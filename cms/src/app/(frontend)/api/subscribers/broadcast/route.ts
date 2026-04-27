/**
 * Send a broadcast email to all active Subscribers.
 *
 * POST /api/subscribers/broadcast
 *   { subject: string, html: string, text?: string }
 *
 * Auth: requires a logged-in admin Payload user (cookie session).
 * Throttled to one broadcast per 5 minutes via Redis lock.
 *
 * Uses Payload's configured email transport (nodemailer + SMTP env vars).
 */
import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BROADCAST_COOLDOWN_S = 300;

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

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Auth — must be a logged-in user with admin or editor role.
    const headers = req.headers;
    const { user } = await payload.auth({ headers });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (user as any).role;
    if (role !== "admin" && role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Body
    const body = (await req.json().catch(() => null)) as {
      subject?: string;
      html?: string;
      text?: string;
    } | null;
    const subject = String(body?.subject || "").trim();
    const html = String(body?.html || "").trim();
    const text = String(body?.text || "").trim();
    if (!subject || !html) {
      return NextResponse.json(
        { error: "subject and html are required" },
        { status: 400 },
      );
    }
    if (subject.length > 200) {
      return NextResponse.json({ error: "subject too long" }, { status: 400 });
    }

    // Cooldown lock
    try {
      const r = getRedis();
      const set = await r.set("essentialbali:broadcast:lock", "1", "EX", BROADCAST_COOLDOWN_S, "NX");
      if (!set) {
        const ttl = await r.ttl("essentialbali:broadcast:lock");
        return NextResponse.json(
          { error: `Cooldown active. Try again in ${Math.max(ttl, 1)}s.` },
          { status: 429 },
        );
      }
    } catch {
      // best-effort — proceed without lock if redis fails
    }

    // Pull all active subscribers
    const subs = await payload.find({
      collection: "subscribers",
      where: { status: { equals: "active" } },
      limit: 5000,
      depth: 0,
      pagination: false,
    });
    const recipients = (subs.docs as any[]).map((s) => s.email).filter(Boolean);
    if (!recipients.length) {
      return NextResponse.json({ ok: true, sent: 0, message: "No active subscribers." });
    }

    // Send. Use BCC so subscribers don't see each other. Single send call.
    let sent = 0;
    let failed = 0;
    const fromName = process.env.SMTP_FROM_NAME || "Essential Bali";
    const fromAddress = process.env.SMTP_FROM_ADDRESS || "noreply@gaiada.com";
    try {
      await payload.sendEmail({
        from: `"${fromName}" <${fromAddress}>`,
        to: fromAddress, // self-send; recipients in BCC
        bcc: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      });
      sent = recipients.length;
    } catch (e: any) {
      failed = recipients.length;
      console.error("[broadcast] send failed:", e?.message || e);
      return NextResponse.json(
        { ok: false, error: e?.message || "Email send failed", sent, failed },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, sent, failed, recipients: recipients.length });
  } catch (err: any) {
    console.error("[broadcast] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
