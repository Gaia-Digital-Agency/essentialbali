/**
 * Public subscribe endpoint for the homepage Newsletter form.
 *
 * POST /api/subscribers/subscribe
 *   { email: string, source?: string }
 *
 * Why a route instead of POST /api/subscribers directly:
 *   the Subscribers collection's create access is `isStaffOrAgent`,
 *   so unauthenticated POSTs from the public site would be rejected.
 *   This handler uses Payload's local API (bypasses access control)
 *   to upsert by email.
 *
 * Behaviour:
 *   - new email   → create with status=active
 *   - existing active → 200, idempotent (already subscribed)
 *   - existing unsubscribed/bounced → flip back to active
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      email?: string;
      source?: string;
    } | null;
    const email = String(body?.email || "").trim().toLowerCase();
    const source = String(body?.source || "homepage").trim().slice(0, 80);

    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });

    const existing = await payload.find({
      collection: "subscribers",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      const doc: any = existing.docs[0];
      if (doc.status === "active") {
        return NextResponse.json({
          success: true,
          data: {
            email,
            subscribed_at: doc.createdAt,
            message: "You're already subscribed — thanks!",
          },
        });
      }
      const updated = await payload.update({
        collection: "subscribers",
        id: doc.id,
        data: { status: "active", source },
      });
      return NextResponse.json({
        success: true,
        data: {
          email,
          subscribed_at: (updated as any).updatedAt,
          message: "Welcome back — your subscription is reactivated.",
        },
      });
    }

    const created = await payload.create({
      collection: "subscribers",
      data: { email, status: "active", source },
    });

    return NextResponse.json({
      success: true,
      data: {
        email,
        subscribed_at: (created as any).createdAt,
        message: "Thanks for subscribing to our newsletter!",
      },
    });
  } catch (err: any) {
    console.error("[subscribe] error:", err?.message || err);
    return NextResponse.json(
      { success: false, message: err?.message || "Subscription failed" },
      { status: 500 },
    );
  }
}
