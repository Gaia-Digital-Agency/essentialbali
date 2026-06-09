#!/usr/bin/env node
/**
 * update-progress.mjs — post-run progress tracker.
 *
 * Queries Payload CMS for current article counts and hero-ad status,
 * rewrites docs/publish_inventory.md and the progress section of
 * docs/content-population-plan.md, then commits both files.
 *
 * Called by daily-run.sh on gda-ai01 via SSH after each run.
 *
 * Usage: node scripts/update-progress.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import process from "node:process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const envPath = resolve(ROOT, "cms/.env");
const credPath = "/opt/.openclaw-ess/credentials/.env.payload";

for (const p of [credPath, envPath]) {
  if (existsSync(p)) {
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const PAYLOAD_BASE_URL = process.env.PAYLOAD_BASE_URL || "http://localhost:4008";
const PAYLOAD_AGENT_EMAIL = process.env.PAYLOAD_AGENT_EMAIL || "elliot@gaiada.com";
const PAYLOAD_AGENT_PASSWORD = process.env.PAYLOAD_AGENT_PASSWORD;

const DRY_RUN = process.argv.includes("--dry-run");

const AREAS = [
  { slug: "ubud",       name: "Ubud" },
  { slug: "canggu",     name: "Canggu" },
  { slug: "kuta",       name: "Kuta" },
  { slug: "jimbaran",   name: "Jimbaran" },
  { slug: "denpasar",   name: "Denpasar" },
  { slug: "singaraja",  name: "Singaraja" },
  { slug: "kintamani",  name: "Kintamani" },
  { slug: "nusa-penida",name: "Nusa Penida" },
];
const TOPICS = [
  { slug: "activities",    name: "Activities" },
  { slug: "dine",          name: "Dine" },
  { slug: "featured",      name: "Featured" },
  { slug: "health-wellness", name: "Health & Wellness" },
  { slug: "news",          name: "News" },
  { slug: "nightlife",     name: "Nightlife" },
  { slug: "people-culture",name: "People & Culture" },
  { slug: "events",        name: "Events" },
];

async function login() {
  const res = await fetch(`${PAYLOAD_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: PAYLOAD_AGENT_EMAIL, password: PAYLOAD_AGENT_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${res.status}`);
  const d = await res.json();
  return d.token;
}

async function fetchAll(token, path) {
  const res = await fetch(`${PAYLOAD_BASE_URL}${path}`, {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function padCell(s, width) {
  const str = String(s);
  return str + " ".repeat(Math.max(0, width - str.length));
}

function buildInventoryDoc(articleCounts, heroAdStatus, date) {
  const topicHeaders = TOPICS.map((t) => t.name);
  const colW = 18;
  const areaW = 14;

  const headerRow = "| " + padCell("Area", areaW) + " | " + topicHeaders.map((h) => padCell(h, colW)).join(" | ") + " |";
  const sepRow = "|" + "-".repeat(areaW + 2) + "|" + TOPICS.map(() => "-".repeat(colW + 2)).join("|") + "|";

  const heroRows = AREAS.map((a) => {
    const cells = TOPICS.map((t) => {
      const key = `${a.slug}|${t.slug}`;
      return padCell(heroAdStatus[key] ? "✓" : "—", colW);
    });
    return "| " + padCell(a.name, areaW) + " | " + cells.join(" | ") + " |";
  });

  const activeCount = Object.values(heroAdStatus).filter(Boolean).length;
  const emptyCount = 64 - activeCount;

  const articleRows = AREAS.map((a) => {
    const cells = TOPICS.map((t) => {
      const key = `${a.slug}|${t.slug}`;
      const n = articleCounts[key] || 0;
      return padCell(n > 0 ? String(n) : "—", colW);
    });
    return "| " + padCell(a.name, areaW) + " | " + cells.join(" | ") + " |";
  });

  const totalArticles = Object.values(articleCounts).reduce((s, n) => s + n, 0);
  const coveredCells = Object.values(articleCounts).filter((n) => n > 0).length;

  return `# Publish Inventory

Last updated: ${date}

**Two separate assets per cell:**
- **Listing Page Hero** (\`hero-ads\` collection) — the full-width banner image shown at the top of each area/topic listing page. One slot per cell; \`✓\` = active with image, \`—\` = empty placeholder.
- **Articles** (\`articles\` collection) — editorial content. Each article carries its own dedicated hero image. Number shown = article count in that cell.

Target: 1 listing hero + 20 articles per cell (640 articles total across 64 cells).

---

## Listing Page Hero Images (hero-ads)

\`✓\` = active with image · \`—\` = empty placeholder

${headerRow}
${sepRow}
${heroRows.join("\n")}

**Active: ${activeCount} / 64 · Empty: ${emptyCount} / 64**

---

## Articles (each article has its own hero image)

Number = article count in that cell. \`—\` = none yet.

${headerRow}
${sepRow}
${articleRows.join("\n")}

**${totalArticles} articles total · ${coveredCells} / 64 cells with at least one article · ${64 - coveredCells} cells empty**
All published articles have a dedicated hero image (stored in GCS: \`gda-essentialbali-media\`).
`;
}

function updatePlanDoc(existingPlan, articleCounts, heroAdStatus, date) {
  const totalArticles = Object.values(articleCounts).reduce((s, n) => s + n, 0);
  const coveredCells = Object.values(articleCounts).filter((n) => n > 0).length;
  const activeHeroAds = Object.values(heroAdStatus).filter(Boolean).length;
  const wave1Done = activeHeroAds >= 64 && coveredCells >= 64;

  const progressBlock = `## Progress (auto-updated ${date})

| Metric | Current | Wave 1 target | Final target |
|---|---|---|---|
| Hero-ads active | ${activeHeroAds} / 64 | 64 / 64 | 64 / 64 |
| Articles total | ${totalArticles} | ≥ 64 (one per cell) | 1,280 |
| Cells with articles | ${coveredCells} / 64 | 64 / 64 | 64 / 64 |
| Avg articles per cell | ${(totalArticles / 64).toFixed(1)} | 1.0 | 20 |

**Wave 1 status:** ${wave1Done ? "✓ COMPLETE — awaiting gate review before Wave 2" : "in progress"}

---`;

  // Replace or append progress block
  if (existingPlan.includes("## Progress")) {
    return existingPlan.replace(/## Progress[\s\S]*?---/, progressBlock);
  }
  // Insert before ## Open gaps
  if (existingPlan.includes("## Open gaps")) {
    return existingPlan.replace("## Open gaps", progressBlock + "\n\n## Open gaps");
  }
  return existingPlan + "\n\n" + progressBlock;
}

async function main() {
  console.error("[update-progress] fetching Payload state…");
  const token = await login();

  const [articlesData, heroAdsData] = await Promise.all([
    fetchAll(token, "/api/articles?where[status][in]=published,approved&limit=2000&depth=1"),
    fetchAll(token, "/api/hero-ads?limit=100&depth=1"),
  ]);

  // Build article counts
  const articleCounts = {};
  for (const doc of articlesData.docs || []) {
    const a = typeof doc.area === "object" ? doc.area?.slug : null;
    const t = typeof doc.topic === "object" ? doc.topic?.slug : null;
    if (!a || !t) continue;
    const key = `${a}|${t}`;
    articleCounts[key] = (articleCounts[key] || 0) + 1;
  }

  // Build hero-ad status map
  const heroAdStatus = {};
  for (const doc of heroAdsData.docs || []) {
    const a = typeof doc.area === "object" ? doc.area?.slug : null;
    const t = typeof doc.topic === "object" ? doc.topic?.slug : null;
    if (!a || !t) continue;
    heroAdStatus[`${a}|${t}`] = !!doc.active;
  }

  const today = new Date().toISOString().slice(0, 10);

  const inventoryPath = resolve(ROOT, "docs/publish_inventory.md");
  const planPath = resolve(ROOT, "docs/content-population-plan.md");

  const newInventory = buildInventoryDoc(articleCounts, heroAdStatus, today);
  const existingPlan = readFileSync(planPath, "utf-8");
  const newPlan = updatePlanDoc(existingPlan, articleCounts, heroAdStatus, today);

  if (DRY_RUN) {
    console.log("=== inventory ===\n" + newInventory.slice(0, 500));
    console.log("=== plan snippet ===\n" + newPlan.slice(newPlan.indexOf("## Progress"), newPlan.indexOf("## Progress") + 400));
    return;
  }

  writeFileSync(inventoryPath, newInventory);
  writeFileSync(planPath, newPlan);
  console.error("[update-progress] docs updated, committing…");

  try {
    execSync(`git -C "${ROOT}" add docs/publish_inventory.md docs/content-population-plan.md`, { stdio: "pipe" });
    execSync(`git -C "${ROOT}" commit -m "chore(content): daily progress update ${today}"`, { stdio: "pipe" });
    console.error("[update-progress] committed");
  } catch (e) {
    if (e.stdout?.toString().includes("nothing to commit")) {
      console.error("[update-progress] nothing changed, no commit");
    } else {
      console.error("[update-progress] commit error:", e.stderr?.toString().slice(0, 200));
    }
  }
}

main().catch((e) => {
  console.error("[update-progress] FATAL:", e?.message || e);
  process.exit(1);
});
