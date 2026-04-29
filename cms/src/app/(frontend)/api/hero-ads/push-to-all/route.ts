/**
 * Push the homepage hero's content to every cell-specific hero slot
 * whose topic has showsHero=true. Idempotent — safe to run repeatedly.
 *
 * POST /api/hero-ads/push-to-all
 *   Body: optional { activate?: boolean } — defaults to true.
 *
 * Auth: requires a logged-in admin or editor (Payload session cookie
 * OR `Authorization: JWT <token>` header).
 *
 * Behaviour:
 *   1. Resolve the homepage hero — the (NULL area, NULL topic) row.
 *      404 if it doesn't exist (run scripts/migrate-hero-65.mjs first).
 *   2. List the topics that have showsHero=true.
 *   3. List every cell-specific hero where topic.id is in that set.
 *   4. For each, copy: creative, headline, subline, linkUrl,
 *      ctaActive, ctaText, ctaUrl from the homepage hero. Set
 *      active=true (unless body.activate=false).
 *   5. Returns counts.
 *
 * What it does NOT touch:
 *   • the homepage hero row itself
 *   • the area/topic relationships of cell rows (we're cloning content,
 *     not slot identity)
 *   • the `client` field — campaign attribution is per-cell
 *   • the `startAt` / `endAt` schedule — cell-level scheduling preserved
 *   • cells whose topic has showsHero=false (Events today)
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Auth — admin or editor only.
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (user as any).role;
    if (role !== "admin" && role !== "editor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Body
    const body = (await req.json().catch(() => ({}))) as { activate?: boolean };
    const activate = body.activate !== false;

    // 1. Find homepage hero (NULL area, NULL topic)
    const homeHeroRes = await payload.find({
      collection: "hero-ads",
      where: {
        and: [
          { area: { exists: false } },
          { topic: { exists: false } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    const homeHero = homeHeroRes.docs[0] as any;
    if (!homeHero) {
      return NextResponse.json(
        {
          error:
            "Homepage hero (NULL,NULL) row not found. Run scripts/migrate-hero-65.mjs first.",
        },
        { status: 404 },
      );
    }

    // 2. Topics where showsHero=true
    const topicsRes = await payload.find({
      collection: "topics",
      where: { showsHero: { not_equals: false } },
      limit: 100,
      depth: 0,
    });
    const heroableTopicIds = (topicsRes.docs as any[]).map((t) => t.id);

    if (heroableTopicIds.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No topics have showsHero=true; nothing to push to.",
        updatedCount: 0,
      });
    }

    // 3. All cell-specific hero rows for those topics
    const cellRowsRes = await payload.find({
      collection: "hero-ads",
      where: {
        and: [
          { area: { exists: true } },
          { topic: { in: heroableTopicIds } },
        ],
      },
      limit: 200,
      depth: 0,
    });
    const cellRows = cellRowsRes.docs as any[];

    // 4. Patch each one. We do these sequentially to keep transaction
    //    behaviour predictable (Payload v3 hooks open per-doc transactions).
    const data: Record<string, unknown> = {
      creative: homeHero.creative ?? null,
      headline: homeHero.headline ?? null,
      subline: homeHero.subline ?? null,
      linkUrl: homeHero.linkUrl ?? null,
      ctaActive: !!homeHero.ctaActive,
      ctaText: homeHero.ctaText ?? null,
      ctaUrl: homeHero.ctaUrl ?? null,
    };
    if (activate) data.active = true;

    let updated = 0;
    let failed = 0;
    const errors: Array<{ id: number | string; message: string }> = [];
    for (const cell of cellRows) {
      try {
        await payload.update({
          collection: "hero-ads",
          id: cell.id,
          data: data as any,
        });
        updated++;
      } catch (e: any) {
        failed++;
        errors.push({ id: cell.id, message: String(e?.message || e).slice(0, 200) });
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      sourceHomeHeroId: homeHero.id,
      heroableTopics: heroableTopicIds.length,
      cellRowsConsidered: cellRows.length,
      updatedCount: updated,
      failedCount: failed,
      activated: activate,
      ...(errors.length ? { errors } : {}),
    });
  } catch (err: any) {
    console.error("[push-to-all] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
