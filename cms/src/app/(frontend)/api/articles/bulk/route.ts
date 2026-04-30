/**
 * Bulk action endpoint for Articles.
 *
 * POST /api/articles/bulk
 *   { ids: number[], action: 'approve'|'reject'|'delete'|'publish'|'unpublish' }
 *
 * Auth: admin or editor only.
 *
 * Action semantics (HUMAN-DRIVEN — no automatic Elliot redispatch):
 *   approve    → status='approved' on each (auto-promotes to published
 *                via the existing beforeChange hook in Articles.ts)
 *   reject     → status='rejected'. Hash-lock is released so a future
 *                Elliot dispatch with the same brief is allowed, but
 *                THIS endpoint does NOT trigger it. Editor decides
 *                whether to re-dispatch or hard-delete.
 *   delete     → DELETE the row. Releases the hash-lock unconditionally
 *                (Path B semantics). Use with care.
 *   publish    → status='published' directly. Bypasses the
 *                approve→auto-publish flow for already-reviewed content.
 *   unpublish  → status='draft'. Off the public site, kept for editor
 *                review or later re-publish.
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

const STATUS_FOR: Record<Exclude<Action, "delete">, string> = {
  approve: "approved",
  reject: "rejected",
  publish: "published",
  unpublish: "draft",
};

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
    if (ids.length > 500) {
      return NextResponse.json(
        { error: "max 500 ids per request" },
        { status: 400 },
      );
    }

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ id: number; message: string }> = [];

    for (const id of ids) {
      try {
        if (action === "delete") {
          await payload.delete({ collection: "articles", id });
        } else {
          const data: Record<string, unknown> = { status: STATUS_FOR[action] };
          // For 'publish' action we also stamp publishedAt directly so
          // editors can see the timestamp without going through the
          // approve→hook path.
          if (action === "publish") {
            data.publishedAt = new Date().toISOString();
          }
          // For 'unpublish' clear publishedAt so the article is fully
          // off the public side.
          if (action === "unpublish") {
            data.publishedAt = null;
          }
          await payload.update({ collection: "articles", id, data: data as any });
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
    console.error("[articles/bulk] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
