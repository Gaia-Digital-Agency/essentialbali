#!/usr/bin/env node
/**
 * Daily homepage-feed picker.
 *
 * Picks 16 articles for today's <DailyEssentials> 4×4 grid.
 *
 * Rules:
 *   • 2 articles per topic × 8 topics = 16
 *   • each topic's 2 articles come from 2 different areas (when possible —
 *     falls back to same area if the cell only has one)
 *   • sort key for picking: (homeFeaturedCount ASC,
 *                            homeLastFeaturedAt NULLS FIRST ASC,
 *                            random())
 *     This way articles that have been shown the fewest times come
 *     first, with newest-never-shown ahead of older-already-shown,
 *     and random tiebreak gives variety on day-1 when everyone
 *     has count=0.
 *   • after picking, bump homeFeaturedCount += 1 and set
 *     homeLastFeaturedAt = today on the 16 selected articles.
 *
 * Cycle math at full population (1280 published):
 *   1280 / 16 = 80 days before any article repeats.
 *
 * Idempotent: if home_daily_feed already has a row for today, exit
 * with no-op (exit code 0). Cron can fire repeatedly without ill effect.
 *
 * "Today" is computed in Asia/Makassar (UTC+8) regardless of the
 * server's timezone, so the daily flip happens at 00:00 local Bali
 * time. The cron schedule itself fires at 04:00 GMT+8 (= 20:00 UTC)
 * to give a 4-hour cushion in case the previous day's traffic is
 * still in flight.
 *
 * Sparse-pool behaviour: if a topic has 0 published articles, it
 * contributes 0 slots; the row may have fewer than 16 slots. The
 * frontend <DailyEssentials> shrinks-and-centres in that case.
 *
 * Usage:
 *   cd /var/www/essentialbali/cms
 *   node scripts/pick-daily-feed.mjs            # idempotent, exits 0
 *   node scripts/pick-daily-feed.mjs --force    # delete today's row + re-pick
 *   node scripts/pick-daily-feed.mjs --date=YYYY-MM-DD --dry-run
 *
 * Env required:
 *   DATABASE_URI
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

// ── env loader ─────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
  console.error("[pick-daily-feed] DATABASE_URI not set");
  process.exit(1);
}

// ── arg parsing ────────────────────────────────────────────────────
const flags = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (a === "--force") return ["force", true];
    if (a === "--dry-run") return ["dryRun", true];
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1].replace(/-/g, "_"), m[2]] : [a, true];
  }),
);

const log = (...a) => console.error("[pick-daily-feed]", ...a);

// ── psql shell wrapper (no npm deps) ───────────────────────────────
// -q (quiet) suppresses command-completion footers like "INSERT 0 1"
// that would otherwise contaminate the captured stdout for INSERT
// ... RETURNING and similar queries.
function psql(sql, json = false) {
  const args = [DATABASE_URI, "-At", "-q", "-v", "ON_ERROR_STOP=1", "-c", sql];
  const r = spawnSync("psql", args, { encoding: "utf-8" });
  if (r.status !== 0) {
    throw new Error(
      `psql exit ${r.status}: ${(r.stderr || "").slice(0, 400).trim()}`,
    );
  }
  const out = (r.stdout || "").trim();
  if (!json) return out;
  return out
    ? out
        .split("\n")
        .map((line) => line.split("|"))
    : [];
}

// ── date in Asia/Makassar (UTC+8) ──────────────────────────────────
function todayMakassar(override) {
  if (override) return override; // YYYY-MM-DD
  const now = new Date();
  // Shift by +8h (Makassar offset, no DST), then take YYYY-MM-DD.
  const shifted = new Date(now.getTime() + 8 * 3600 * 1000);
  return shifted.toISOString().slice(0, 10);
}

// ── seed derived from date (deterministic for diagnostics) ─────────
function seedFromDate(d) {
  // YYYY-MM-DD → YYYYMMDD as a base-10 number
  return Number(d.replace(/-/g, ""));
}

// ── main ───────────────────────────────────────────────────────────
try {
  const today = todayMakassar(flags.date);
  const seed = seedFromDate(today);
  log(`target date (Asia/Makassar) = ${today}, seed = ${seed}`);

  // The `date` column is `timestamp with time zone` (Payload's date field).
  // Use the start-of-day in Asia/Makassar so equality lookups match cleanly.
  const todayTs = `${today}T00:00:00+08:00`;

  // 1. Idempotency check
  if (flags.force) {
    log("--force: deleting any existing row + slots for today");
    if (!flags.dryRun) {
      // CASCADE is present on home_daily_feed_slots._parent_id, but we
      // delete children explicitly anyway to be obvious.
      psql(
        `DELETE FROM home_daily_feed_slots
         WHERE _parent_id IN (
           SELECT id FROM home_daily_feed WHERE date = '${todayTs}'
         )`,
      );
      psql(`DELETE FROM home_daily_feed WHERE date = '${todayTs}'`);
    }
  } else {
    const existing = psql(
      `SELECT id FROM home_daily_feed WHERE date = '${todayTs}' LIMIT 1`,
    );
    if (existing) {
      log(`already done — feed row id=${existing} exists for ${today}`);
      process.exit(0);
    }
  }

  // 2. Pull all 8 topics
  const topicsRaw = psql(
    `SELECT id, slug, name FROM topics ORDER BY id`,
    true,
  );
  const topics = topicsRaw.map(([id, slug, name]) => ({
    id: Number(id),
    slug,
    name,
  }));
  log(`topics: ${topics.length} (${topics.map((t) => t.slug).join(", ")})`);

  // 3. Per-topic candidate selection
  //
  // We cap the candidate pull at 200 per topic — way more than we need
  // (the picker takes 2), but enough headroom that area-distinctness
  // is reliably satisfiable. Sort key matches the spec.
  const slots = [];
  let slotIndex = 0;

  for (const topic of topics) {
    const candidates = psql(
      `SELECT id, area_id
       FROM articles
       WHERE status = 'published' AND topic_id = ${topic.id}
       ORDER BY home_featured_count ASC NULLS FIRST,
                home_last_featured_at ASC NULLS FIRST,
                random()
       LIMIT 200`,
      true,
    );

    if (candidates.length === 0) {
      log(`  topic ${topic.slug}: 0 candidates — skipping (sparse pool)`);
      continue;
    }

    // Pick first candidate; then walk for a second from a different area;
    // fall back to second candidate from any area if no distinct area exists.
    const first = candidates[0];
    const firstAreaId = first[1];
    const second =
      candidates.find((c, i) => i > 0 && c[1] !== firstAreaId) ||
      candidates[1] ||
      null;

    slots.push({
      slotIndex: slotIndex++,
      topicId: topic.id,
      articleId: Number(first[0]),
    });
    if (second) {
      slots.push({
        slotIndex: slotIndex++,
        topicId: topic.id,
        articleId: Number(second[0]),
      });
    } else {
      log(
        `  topic ${topic.slug}: only 1 published article — single slot only`,
      );
    }
    log(
      `  topic ${topic.slug}: picked ${first[0]} (area ${firstAreaId})${
        second ? `, ${second[0]} (area ${second[1]})` : ""
      }`,
    );
  }

  log(`total slots picked: ${slots.length}/16`);

  if (slots.length === 0) {
    log("WARNING: no published articles in any topic — feed will be empty");
  }

  if (flags.dryRun) {
    log("--dry-run: would have written feed row + bumped counters; exiting");
    process.exit(0);
  }

  // 4. Insert the parent row
  const generatedAt = new Date().toISOString();
  const parentId = psql(
    `INSERT INTO home_daily_feed (date, seed, generated_at, updated_at, created_at)
     VALUES ('${todayTs}', ${seed}, '${generatedAt}', NOW(), NOW())
     RETURNING id`,
  );
  log(`inserted home_daily_feed id=${parentId}`);

  // 5. Insert the slot rows.
  //    Payload array sub-rows have a `id varchar NOT NULL` PK that the
  //    admin UI populates with a generated id (nanoid in newer Payload,
  //    UUID-ish strings in older). We mint a UUID per row.
  if (slots.length > 0) {
    const values = slots
      .map((s) => {
        const rowId = randomUUID();
        return `('${rowId}', ${Number(parentId)}, ${s.slotIndex}, ${s.slotIndex}, ${s.topicId}, ${s.articleId})`;
      })
      .join(", ");
    psql(
      `INSERT INTO home_daily_feed_slots
        (id, _parent_id, _order, slot_index, topic_id, article_id)
       VALUES ${values}`,
    );
    log(`inserted ${slots.length} slot rows`);

    // 6. Bump counters on selected articles
    const ids = slots.map((s) => s.articleId).join(",");
    psql(
      `UPDATE articles
       SET home_featured_count = COALESCE(home_featured_count, 0) + 1,
           home_last_featured_at = '${todayTs}'
       WHERE id IN (${ids})`,
    );
    log(`bumped homeFeaturedCount + set homeLastFeaturedAt on ${slots.length} articles`);
  }

  log("OK");
} catch (err) {
  console.error("[pick-daily-feed] FAILED:", err?.message || err);
  process.exit(2);
}
