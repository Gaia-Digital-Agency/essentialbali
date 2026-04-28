/**
 * Gmail API send helper for Payload.
 *
 * Why not nodemailer + SMTP?
 *   - Workspace accounts with 2FA reject regular passwords for SMTP.
 *   - Reusing /var/www/templategen's working OAuth refresh token (scope
 *     gmail.send) is more reliable and self-refreshing.
 *
 * The token was authorized by ai@gaiada.com — Gmail API enforces sender =
 * authenticated user, so all emails go FROM ai@gaiada.com regardless of
 * `from` argument. To send AS another user, re-authorize OAuth as that
 * user.
 */

import "server-only";

type SendArgs = {
  to: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
};

let cachedAccessToken: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.exp > now + 60) {
    return cachedAccessToken.token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Gmail API: missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN in env",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gmail OAuth refresh failed: ${res.status} ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: data.access_token,
    exp: now + (data.expires_in || 3600),
  };
  return data.access_token;
}

function quoteAddr(addr: string): string {
  // Email header values must be ASCII-safe; we keep it simple.
  return addr.replace(/[\r\n]/g, "");
}

function arrayify(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function buildMime(args: SendArgs): string {
  const fromAddr = process.env.SMTP_FROM_ADDRESS || "ai@gaiada.com";
  const fromName = args.fromName || process.env.SMTP_FROM_NAME || "Essential Bali";
  const from = `${fromName.replace(/"/g, "")} <${fromAddr}>`;
  const to = arrayify(args.to).map(quoteAddr).join(", ");
  const bcc = arrayify(args.bcc).map(quoteAddr).join(", ");
  const replyTo = args.replyTo ? quoteAddr(args.replyTo) : "";

  const boundary = `eb_boundary_${Math.random().toString(36).slice(2)}`;
  const headers: string[] = [
    `From: ${from}`,
    `To: ${to}`,
    bcc ? `Bcc: ${bcc}` : "",
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${args.subject.replace(/[\r\n]/g, " ")}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const text =
    args.text ||
    (args.html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const html = args.html || `<p>${(args.text || "").replace(/\n/g, "<br>")}</p>`;

  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 8bit`,
    "",
    text,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: 8bit`,
    "",
    html,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return headers.join("\r\n") + "\r\n\r\n" + body;
}

function base64UrlEncode(s: string): string {
  return Buffer.from(s, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmail(args: SendArgs): Promise<{ id: string; threadId?: string }> {
  const access = await getAccessToken();
  const mime = buildMime(args);
  const raw = base64UrlEncode(mime);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gmail API send failed: ${res.status} ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: string; threadId?: string };
  return data;
}
