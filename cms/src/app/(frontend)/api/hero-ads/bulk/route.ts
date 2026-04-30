/**
 * Bulk action endpoint for Hero Ads.
 *
 * POST /api/hero-ads/bulk
 *   { ids: number[], action: 'approve'|'reject'|'delete'|'publish'|'unpublish' }
 *
 * Auth: admin or editor only.
 *
 * Action semantics (slot model — same 5 verbs as Articles, mapped to
 * hero-ad fields):
 *   approve    → active=true (slot live on the public side)
 *   publish    → active=true (alias of approve for editor consistency)
 *   unpublish  → active=false (slot persists, just hidden from public)
 *   reject     → active=false + creative=null. Editor decides whether
 *                to regenerate via the standalone Imager call or
 *                hard-delete. NO automatic Imager redispatch from this
 *                endpoint.
 *   delete     → DELETE the row entirely. Slot identity is recreatable
 *                via the migrate-hero-65 script (or the area-only
 *                generator), but the row is gone until then.
 *
 * Returns: { ok, action, requested, succeeded, failed, errors[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = ["approve", "reject", "delete", "publish", "unpublish"] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (user as any).role;
    if (role !== "admin" && role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      ids?: unknown;
      action?: unknown;
    };
    const action = String(body.action || "") as Action;
    if (!ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `action must be one of ${ACTIONS.join(", ")}` },
        { status: 400 },
      );
    }
    const idsRaw = Array.isArray(body.ids) ? body.ids : [];
    const ids = idsRaw
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (ids.length === 0) {
      return NextResponse.json({ error: "ids[] required" }, { status: 400 });
    }
    if (ids.length > 200) {
      return NextResponse.json(
        { error: "max 200 ids per request" },
        { status: 400 },
      );
    }

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ id: number; message: string }> = [];

    for (const id of ids) {
      try {
        if (action === "delete") {
          await payload.delete({ collection: "hero-ads", id });
        } else if (action === "approve" || action === "publish") {
          await payload.update({
            collection: "hero-ads",
            id,
            data: { active: true } as any,
          });
        } else if (action === "unpublish") {
          await payload.update({
            collection: "hero-ads",
            id,
            data: { active: false } as any,
          });
        } else if (action === "reject") {
          await payload.update({
            collection: "hero-ads",
            id,
            data: { active: false, creative: null } as any,
          });
        }
        succeeded++;
      } catch (e: any) {
        failed++;
        errors.push({ id, message: String(e?.message || e).slice(0, 200) });
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      action,
      requested: ids.length,
      succeeded,
      failed,
      ...(errors.length ? { errors } : {}),
    });
  } catch (err: any) {
    console.error("[hero-ads/bulk] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
