/**
 * /api/curation/refresh — POST { group: "<one-of-five>" | "*" }
 *
 * Random-picks 4 articles per refreshed group from the published-pool of
 * articles that DON'T currently have a `group` set. (We don't move
 * already-pinned articles around — that would steal slots from other
 * groups; pick only from the unpinned pool.)
 *
 * For each refreshed group:
 *   1. Untag every article currently in that group  (group = NULL)
 *   2. Pick 4 random unpinned articles → set their group to the target.
 *
 * Special: { group: "*" } untags ALL 5 groups first, then refills all
 * 5 from the pool. Use when you want a global re-shuffle.
 *
 * Auth: requires logged-in admin / staff / ai-agent.
 *
 * Notes:
 *   - "Random" here is `ORDER BY random() LIMIT 4` (Postgres) — fine for
 *     a few hundred articles. Re-evaluate at 10k+ scale.
 *   - Operations are NOT atomic across groups; if the second batch
 *     errors, the first batch is already untagged. Acceptable: refresh
 *     is idempotent — re-running fixes any partial state.
 *   - The picked rows go through Payload's update() so collection
 *     beforeChange hooks (e.g. SEO auto-fill) still fire — same as a
 *     manual edit in the admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_GROUPS = [
  "mostPopular",
  "trending",
  "ultimateGuide",
  "overseas",
  "spotlight",
] as const;
type GroupSlug = (typeof VALID_GROUPS)[number];

const SLOTS_PER_GROUP = 4;

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const me = await payload
    .auth({ headers: req.headers as unknown as Headers })
    .catch(() => null);
  const user = me?.user as unknown as { role?: string } | null;
  if (!user) {
    return NextResponse.json({ error: "auth required" }, { status: 401 });
  }
  if (!["admin", "staff", "ai-agent"].includes(user.role || "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { group?: string };
  const target = body.group;
  if (!target) {
    return NextResponse.json(
      { error: "required: group (one of " + VALID_GROUPS.join("/") + " or *)" },
      { status: 400 },
    );
  }

  const groupsToRefresh: GroupSlug[] =
    target === "*"
      ? [...VALID_GROUPS]
      : VALID_GROUPS.includes(target as GroupSlug)
        ? [target as GroupSlug]
        : [];
  if (groupsToRefresh.length === 0) {
    return NextResponse.json(
      { error: `invalid group "${target}"` },
      { status: 400 },
    );
  }

  // Use the underlying Drizzle / pg driver via payload.db so we can do
  // ORDER BY random(). Payload's find() doesn't expose a random sort.
  const db = payload.db as unknown as {
    drizzle: {
      execute: (sql: unknown) => Promise<{ rows: { id: number }[] }>;
    };
  };
  const sqlTag = (await import("@payloadcms/db-postgres")).sql;

  const summary: Record<string, { untagged: number; tagged: number }> = {};

  for (const grp of groupsToRefresh) {
    // 1) Untag whatever currently sits in this group.
    const untagged = await payload
      .update({
        collection: "articles",
        where: { group: { equals: grp } },
        data: { group: null },
        overrideAccess: true,
        depth: 0,
      })
      .catch((e) => {
        throw new Error(`untag ${grp}: ${(e as Error).message}`);
      });
    const untagCount = (untagged?.docs?.length ?? 0) as number;

    // 2) Random-pick 4 from the unpinned-published pool.
    const picked = await db.drizzle.execute(
      sqlTag`SELECT id FROM articles
             WHERE "group" IS NULL
               AND status = 'published'
             ORDER BY random()
             LIMIT ${SLOTS_PER_GROUP}`,
    );
    const ids = (picked.rows || []).map((r) => r.id);

    // 3) Tag them.
    let tagCount = 0;
    for (const id of ids) {
      try {
        await payload.update({
          collection: "articles",
          id,
          data: { group: grp },
          overrideAccess: true,
          depth: 0,
        });
        tagCount++;
      } catch (e) {
        // Best-effort; one bad row shouldn't kill the whole refresh.
        payload.logger.warn(
          `[curation/refresh] tagging article ${id} as ${grp} failed: ${(e as Error).message}`,
        );
      }
    }

    summary[grp] = { untagged: untagCount, tagged: tagCount };
  }

  return NextResponse.json({ ok: true, refreshed: summary });
}
