#!/usr/bin/env node
/**
 * One-off migration to bring `hero_ads` from 64 to 65 slots.
 *
 * Idempotent — safe to run multiple times. Run AFTER the CMS has
 * restarted with the new collection config (so Drizzle push has had
 * a chance to add the new columns and drop the old unique index).
 *
 * Steps:
 *   1. DROP INDEX area_topic_idx                 (the old unique index — push usually
 *                                                 drops this since it's no longer in
 *                                                 the Payload config, but we DROP IF
 *                                                 EXISTS as a safety net)
 *   2. ALTER COLUMN area_id, topic_id DROP NOT NULL  (push should have done this when
 *                                                     `required: true` came off; we re-
 *                                                     assert it)
 *   3. CREATE UNIQUE INDEX hero_ads_slot_idx ON hero_ads
 *        (COALESCE(area_id, 0), COALESCE(topic_id, 0))
 *      This enforces 65-slot uniqueness — including exactly one (NULL, NULL)
 *      row for the homepage default. Drizzle's `unique()` decorator can't
 *      express the COALESCE form, so it has to be raw SQL.
 *   4. INSERT INTO hero_ads (label, active) VALUES ('Hero > Homepage default', false)
 *      ON CONFLICT (...) DO NOTHING.
 *
 * Usage:
 *   cd /var/www/essentialbali/cms
 *   node scripts/migrate-hero-65.mjs
 *
 * Env required:
 *   DATABASE_URI
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

// Load .env from cms root if not already in env.
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
  console.error("[migrate-hero-65] DATABASE_URI not set");
  process.exit(1);
}

const log = (...a) => console.error("[migrate-hero-65]", ...a);

// Tiny psql wrapper — avoids needing the `pg` npm package as a dep of
// the cms workspace. Returns trimmed stdout; throws on non-zero exit.
function psql(sql) {
  const r = spawnSync(
    "psql",
    [DATABASE_URI, "-At", "-v", "ON_ERROR_STOP=1", "-c", sql],
    { encoding: "utf-8" },
  );
  if (r.status !== 0) {
    throw new Error(
      `psql exit ${r.status}: ${(r.stderr || "").slice(0, 400).trim()}`,
    );
  }
  return (r.stdout || "").trim();
}

try {
  log("connected via psql");

  // 1. Drop the old non-partial unique index, if present. Drizzle push
  //    usually drops it when the index is removed from the Payload config,
  //    but DROP IF EXISTS keeps this script idempotent + safe.
  psql(`DROP INDEX IF EXISTS public.area_topic_idx`);
  log("step 1 — dropped area_topic_idx (if existed)");

  // 2. Make area_id, topic_id nullable. Idempotent.
  psql(`ALTER TABLE hero_ads ALTER COLUMN area_id DROP NOT NULL`);
  psql(`ALTER TABLE hero_ads ALTER COLUMN topic_id DROP NOT NULL`);
  log("step 2 — area_id, topic_id are now NULLABLE");

  // 3. Partial unique index for 65-slot uniqueness, including exactly one
  //    (NULL, NULL) homepage row.
  psql(`
    CREATE UNIQUE INDEX IF NOT EXISTS hero_ads_slot_idx
    ON hero_ads (COALESCE(area_id, 0), COALESCE(topic_id, 0))
  `);
  log("step 3 — hero_ads_slot_idx created (or already present)");

  // 4. Seed the homepage default row if missing.
  const existing = psql(
    `SELECT id FROM hero_ads WHERE area_id IS NULL AND topic_id IS NULL LIMIT 1`,
  );
  if (!existing) {
    const newId = psql(
      `INSERT INTO hero_ads (label, active, created_at, updated_at)
       VALUES ('Hero > Homepage default', false, NOW(), NOW())
       RETURNING id`,
    );
    log(`step 4 — inserted homepage default row id=${newId}`);
  } else {
    log(`step 4 — homepage default row already exists id=${existing}`);
  }

  // Final verification
  const counts = psql(`
    SELECT
      COUNT(*)::text || '|' ||
      COUNT(*) FILTER (WHERE area_id IS NULL AND topic_id IS NULL)::text || '|' ||
      COUNT(*) FILTER (WHERE area_id IS NOT NULL AND topic_id IS NOT NULL)::text
    FROM hero_ads
  `);
  const [total, homepage, cells] = counts.split("|");
  log(`final state: total=${total} homepage=${homepage} cells=${cells}`);
  if (total !== "65") {
    log(
      `WARNING: expected 65 total rows, got ${total}. ` +
        `Cell-specific rows: ${cells} (expected 64).`,
    );
  }
  log("OK");
} catch (err) {
  console.error("[migrate-hero-65] FAILED:", err?.message || err);
  process.exit(2);
}
