/**
 * POST /api/advertise — receive ad-inquiry from the public site contact form
 * (footer "Advertise With Us" button).
 *
 * Sends email to info@gaiada.com via Payload's configured email transport
 * (Gmail SMTP). Does not persist — fire and forget.
 */
import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { sendGmail } from "@/lib/gmail-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RATE_LIMIT_PREFIX = "essentialbali:advertise:rl:";
const RATE_LIMIT_MAX = 4; // per IP per window
const RATE_LIMIT_WINDOW_S = 60 * 60; // 1 hour

const TO_ADDRESS = process.env.ADVERTISE_TO || "info@gaiada.com";

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {});
  }
  return redis;
}

async function rateLimit(ip: string): Promise<{ ok: boolean; retryAfter: number }> {
  try {
    const r = getRedis();
    const key = `${RATE_LIMIT_PREFIX}${ip}`;
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, RATE_LIMIT_WINDOW_S);
    if (n > RATE_LIMIT_MAX) {
      const ttl = await r.ttl(key);
      return { ok: false, retryAfter: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_S };
    }
    return { ok: true, retryAfter: 0 };
  } catch {
    return { ok: true, retryAfter: 0 };
  }
}

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
    } | null;

    const name = String(body?.name || "").trim().slice(0, 200);
    const email = String(body?.email || "").trim().slice(0, 200);
    const company = String(body?.company || "").trim().slice(0, 200);
    const message = String(body?.message || "").trim().slice(0, 4000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rl = await rateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const subject = `Ads inquiry — ${name}${company ? ` (${company})` : ""}`;
    const html =
      `<p><b>Ads inquiry from essentialbali.gaiada.online</b></p>` +
      `<table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif">` +
      `<tr><td style="background:#f5f5f5"><b>Name</b></td><td>${esc(name)}</td></tr>` +
      `<tr><td style="background:#f5f5f5"><b>Email</b></td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>` +
      (company
        ? `<tr><td style="background:#f5f5f5"><b>Company</b></td><td>${esc(company)}</td></tr>`
        : "") +
      `<tr><td style="background:#f5f5f5;vertical-align:top"><b>Message</b></td><td><div style="white-space:pre-wrap">${esc(message)}</div></td></tr>` +
      `<tr><td style="background:#f5f5f5"><b>IP</b></td><td>${esc(ip)}</td></tr>` +
      `</table>`;
    const text =
      `Ads inquiry from essentialbali.gaiada.online\n\n` +
      `Name:    ${name}\n` +
      `Email:   ${email}\n` +
      (company ? `Company: ${company}\n` : "") +
      `IP:      ${ip}\n\n` +
      `Message:\n${message}\n`;

    await sendGmail({
      to: TO_ADDRESS,
      replyTo: email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[advertise] failed:", err?.message || err);
    return NextResponse.json(
      { error: "Could not send. Please try again or email info@gaiada.com directly." },
      { status: 500 },
    );
  }
}
