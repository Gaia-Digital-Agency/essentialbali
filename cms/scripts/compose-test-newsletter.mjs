#!/usr/bin/env node
/**
 * compose-test-newsletter
 *
 * Pulls the most recent published articles, asks Vertex Gemini to draft
 * a 200-word weekly digest body, and creates a Newsletter row with
 *   subject = "Test — Bali Weekly Digest, {date}"
 *   status  = "draft"
 *
 * The newsletter is created as a DRAFT so it appears in the
 * "Subscriber Communication" admin list ready for human review +
 * the editor's existing send flow (set status="sending" + save).
 *
 * Usage:
 *   cd /var/www/essentialbali/cms
 *   node scripts/compose-test-newsletter.mjs            # default 5 articles
 *   node scripts/compose-test-newsletter.mjs --limit=8  # pull more
 *
 * Env required:
 *   DATABASE_URI, GCP_PROJECT_ID, GCP_VERTEX_LOCATION, GCP_VERTEX_MODEL,
 *   GOOGLE_APPLICATION_CREDENTIALS
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

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
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_VERTEX_LOCATION || "us-central1";
const MODEL = process.env.GCP_VERTEX_MODEL || "gemini-2.5-flash";
if (!DATABASE_URI) { console.error("DATABASE_URI not set"); process.exit(1); }
if (!PROJECT_ID) { console.error("GCP_PROJECT_ID not set"); process.exit(1); }

const log = (...a) => console.error("[compose-test-newsletter]", ...a);

function psql(sql, json = false) {
  const r = spawnSync(
    "psql",
    [DATABASE_URI, "-At", "-q", "-v", "ON_ERROR_STOP=1", "-c", sql],
    { encoding: "utf-8" },
  );
  if (r.status !== 0) {
    throw new Error(`psql exit ${r.status}: ${(r.stderr || "").slice(0, 400).trim()}`);
  }
  const out = (r.stdout || "").trim();
  if (!json) return out;
  return out ? out.split("\n").map((line) => line.split("|")) : [];
}

const flags = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1].replace(/-/g, "_"), m[2]] : [a, true];
  }),
);
const limit = Number(flags.limit) || 5;

// ── 1. pull recent published articles ──────────────────────────────
const rows = psql(
  `SELECT a.id, a.title, COALESCE(a.sub_title, '') AS sub, ar.slug AS area, t.slug AS topic, a.slug AS article_slug
   FROM articles a
   JOIN areas ar ON ar.id = a.area_id
   JOIN topics t ON t.id = a.topic_id
   WHERE a.status='published'
   ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
   LIMIT ${limit}`,
  true,
);
if (rows.length === 0) {
  console.error("[compose-test-newsletter] no published articles to digest. Run plan-wave first.");
  process.exit(2);
}
const articles = rows.map(([id, title, sub, area, topic, slug]) => ({
  id: Number(id),
  title,
  sub_title: sub,
  area,
  topic,
  url: `/${area}/${topic}/${slug}`,
}));
log(`pulled ${articles.length} articles`);

// ── 2. ask Vertex Gemini to draft a digest ─────────────────────────
async function callGemini(prompt) {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const tokenResp = await client.getAccessToken();
  const token = tokenResp.token;
  if (!token) throw new Error("Failed to obtain GCP access token");

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        // 4000 to give Gemini headroom — Flash sometimes counts both
        // visible output AND its internal "thinking" against this cap,
        // so 1500 was occasionally truncating the JSON mid-string.
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            preheader: { type: "STRING" },
            opening: { type: "STRING" },
            items: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  blurb: { type: "STRING" },
                },
                required: ["blurb"],
              },
            },
            closing: { type: "STRING" },
          },
          required: ["opening", "items", "closing"],
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Vertex ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const d = await res.json();
  const txt = d.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "";
  if (!txt) throw new Error("empty Vertex response");
  try { return JSON.parse(txt); }
  catch {
    let cleaned = txt.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    try { return JSON.parse(cleaned); } catch {
      // Truncation rescue — Gemini sometimes cuts off mid-string.
      // Walk back from the end, find the last complete `}` block,
      // close any open arrays/objects, and try again.
      let truncIdx = cleaned.lastIndexOf("}");
      if (truncIdx === -1) throw new Error("Vertex returned unparseable + un-rescuable JSON");
      let head = cleaned.slice(0, truncIdx + 1);
      // count opens vs closes — close arrays then root object as needed
      const opensArr = (head.match(/\[/g) || []).length;
      const closesArr = (head.match(/]/g) || []).length;
      const opensObj = (head.match(/\{/g) || []).length;
      const closesObj = (head.match(/}/g) || []).length;
      head += "]".repeat(Math.max(0, opensArr - closesArr));
      head += "}".repeat(Math.max(0, opensObj - closesObj));
      log(`warning: Vertex JSON was truncated, recovered last ${truncIdx + 1} of ${cleaned.length} chars`);
      return JSON.parse(head);
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const prompt = [
  "You are an editor for Essential Bali, drafting this week's subscriber digest.",
  "",
  `Today's date: ${today}.`,
  "",
  "Below are this week's published articles. For each, write a 1-2 sentence",
  "blurb that makes the reader want to click through. Voice: warm, specific,",
  "anti-Instagram, never breathy. Mention the area name in the blurb.",
  "Then write an opening line (≤180 chars) and a closing line (≤180 chars).",
  "",
  "Articles, in order — produce items[] in the SAME order:",
  "",
  ...articles.map((a, i) => `  ${i + 1}. [${a.area}/${a.topic}] ${a.title}\n     ${a.sub_title}`),
  "",
  "Optional preheader (≤120 chars): a one-line preview text shown in inboxes.",
  "Hard length limits:",
  "  - opening: ≤180 chars",
  "  - each blurb: ≤200 chars",
  "  - closing: ≤180 chars",
].join("\n");

log("calling Vertex Gemini...");
const ai = await callGemini(prompt);
if (!Array.isArray(ai.items) || ai.items.length !== articles.length) {
  log(`warning: model returned ${ai.items?.length || 0} items but expected ${articles.length}; padding`);
}

// ── 3. compose Lexical body ────────────────────────────────────────
function paragraph(text, format = 0) {
  return {
    type: "paragraph", direction: "ltr", format: "", indent: 0, version: 1,
    children: [{ type: "text", text, detail: 0, format, mode: "normal", style: "", version: 1 }],
  };
}
function heading(text) {
  return {
    type: "heading", tag: "h3", direction: "ltr", format: "", indent: 0, version: 1,
    children: [{ type: "text", text, detail: 0, format: 1, mode: "normal", style: "", version: 1 }],
  };
}
const children = [
  paragraph(String(ai.opening || "This week on Essential Bali.")),
];
articles.forEach((a, i) => {
  children.push(heading(`${i + 1}. ${a.title}`));
  const blurb = ai.items?.[i]?.blurb || a.sub_title || "Read more.";
  children.push(paragraph(String(blurb)));
  children.push(paragraph(`Read: https://essentialbali.com${a.url}`));
});
children.push(paragraph(String(ai.closing || "See you next week.")));

const body = { root: { type: "root", direction: "ltr", format: "", indent: 0, version: 1, children } };
const subject = `Test — Bali Weekly Digest, ${today}`;
const preheader = String(ai.preheader || "This week's essentials, straight to you.").slice(0, 150);

// ── 4. INSERT into newsletters via psql (Drizzle table = newsletters) ──
const subj = subject.replace(/'/g, "''");
const preh = preheader.replace(/'/g, "''");
const bodyJson = JSON.stringify(body).replace(/'/g, "''");

const newId = psql(
  `INSERT INTO newsletters (subject, preheader, body, status, updated_at, created_at)
   VALUES ('${subj}', '${preh}', '${bodyJson}'::jsonb, 'draft', NOW(), NOW())
   RETURNING id`,
);
log(`OK — newsletter id=${newId} created (status=draft)`);
console.log(JSON.stringify({
  ok: true,
  newsletter_id: Number(newId),
  subject,
  preheader,
  article_count: articles.length,
  articles_used: articles.map((a) => ({ id: a.id, area: a.area, topic: a.topic, title: a.title })),
}, null, 2));
