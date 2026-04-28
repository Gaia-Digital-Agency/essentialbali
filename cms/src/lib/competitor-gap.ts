/**
 * In-process SEO competitor-gap helper.
 *
 * Takes a gap-report (themes the benchmarks cover that we don't) and
 * ranks each theme by SEO opportunity — primary keyword inferred,
 * estimated search potential, suggested article angle.
 *
 * Single source of truth — used by:
 *   - HTTP service /api/seo-competitor-gap (Elliot orchestrator calls this)
 *   - Could be called directly inside any beforeChange hook later
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS service-account → Vertex Gemini.
 */
import "server-only";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "gda-viceroy";
const LOCATION = process.env.GCP_VERTEX_LOCATION || "asia-southeast1";
const MODEL = process.env.GCP_VERTEX_MODEL || "gemini-2.5-flash";

let auth: GoogleAuth | null = null;
function getAuth(): GoogleAuth {
  if (!auth) {
    auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }
  return auth;
}

export type GapTheme = {
  theme: string;
  example_titles?: string[];
  priority?: "high" | "medium" | "low";
};

export type CompetitorGapInput = {
  area: string;
  topic: string;
  missing_themes: GapTheme[];
  /** Optional context — what we already have, so SEO doesn't double-pitch. */
  our_titles?: string[];
};

export type RankedGap = {
  theme: string;
  primary_keyword: string;
  long_tail_keywords: string[];
  estimated_search_potential: "high" | "medium" | "low";
  suggested_brief: string;
  angle: string;
  rank: number;
};

export type CompetitorGapOutput = {
  area: string;
  topic: string;
  ranked_gaps: RankedGap[];
};

function buildPrompt(input: CompetitorGapInput): string {
  const ours = input.our_titles && input.our_titles.length
    ? `Our currently published titles (${input.our_titles.length}):\n` +
      input.our_titles.map((t) => `- ${t}`).join("\n")
    : "(no published articles yet in this cell)";

  const themesBlock = input.missing_themes.map((t, i) => {
    const examples = (t.example_titles || []).slice(0, 3);
    return [
      `Theme ${i + 1}: ${t.theme} (priority: ${t.priority || "medium"})`,
      examples.length ? "  Examples from benchmarks:" : "",
      ...examples.map((e) => `    - ${e}`),
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  return [
    "You are an SEO strategist for Essential Bali (a Bali lifestyle publication).",
    `Cell: area = ${input.area}, topic = ${input.topic}.`,
    "",
    ours,
    "",
    "Themes from benchmark publications that we don't currently cover:",
    themesBlock,
    "",
    "Your job: for each theme, decide whether to chase it for SEO and produce:",
    "  - primary_keyword: the most likely high-intent search query (≤ 60 chars)",
    "  - long_tail_keywords: 3 long-tail variants (each ≤ 60 chars)",
    "  - estimated_search_potential: \"high\" / \"medium\" / \"low\"",
    "      high   = obvious commercial intent, multiple benchmark coverage",
    "      medium = informational intent, decent coverage",
    "      low    = niche / unlikely to rank quickly",
    "  - suggested_brief: one-sentence brief Elliot can pass to dispatch-article (≤ 200 chars)",
    "  - angle: the editorial angle that beats the benchmarks (≤ 120 chars)",
    "",
    "Then RANK all themes 1..N where 1 = best SEO opportunity to chase next.",
    "Ranking factors: search_potential, gap freshness, persona fit for the topic.",
    "",
    "Hard rules:",
    "- Skip any theme that overlaps an existing title above. Don't double-pitch.",
    "- Each suggested_brief must be punchy and specific — usable as-is for dispatch.",
    "- All string values: NO line breaks, escape internal quotes as \\\".",
    "",
    "Return STRICT JSON only.",
  ].join("\n");
}

export async function rankCompetitorGap(input: CompetitorGapInput): Promise<CompetitorGapOutput> {
  const client = await getAuth().getClient();
  const tokenResp = await client.getAccessToken();
  const token = tokenResp.token;
  if (!token) throw new Error("[competitor-gap] failed to obtain GCP access token");

  const url =
    `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            ranked_gaps: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  theme: { type: "STRING" },
                  primary_keyword: { type: "STRING" },
                  long_tail_keywords: { type: "ARRAY", items: { type: "STRING" } },
                  estimated_search_potential: { type: "STRING" },
                  suggested_brief: { type: "STRING" },
                  angle: { type: "STRING" },
                  rank: { type: "INTEGER" },
                },
                required: ["theme", "primary_keyword", "estimated_search_potential", "rank"],
              },
            },
          },
          required: ["ranked_gaps"],
        },
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`[competitor-gap] Vertex ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const txt =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "";
  if (!txt) throw new Error("[competitor-gap] empty Vertex response");

  let parsed: { ranked_gaps?: any[] };
  try {
    parsed = JSON.parse(txt);
  } catch {
    parsed = JSON.parse(txt.replace(/^```(?:json)?\s*|\s*```$/g, "").replace(/,(\s*[}\]])/g, "$1"));
  }

  const gaps = Array.isArray(parsed.ranked_gaps) ? parsed.ranked_gaps : [];
  const ranked: RankedGap[] = gaps.map((g: any, i: number) => ({
    theme: String(g.theme || "").slice(0, 100),
    primary_keyword: String(g.primary_keyword || "").slice(0, 60),
    long_tail_keywords: Array.isArray(g.long_tail_keywords)
      ? g.long_tail_keywords.slice(0, 5).map((s: any) => String(s).slice(0, 60))
      : [],
    estimated_search_potential: ["high", "medium", "low"].includes(g.estimated_search_potential)
      ? g.estimated_search_potential
      : "medium",
    suggested_brief: String(g.suggested_brief || "").slice(0, 240),
    angle: String(g.angle || "").slice(0, 140),
    rank: Number.isInteger(g.rank) ? g.rank : i + 1,
  }));
  // Sort by rank ascending
  ranked.sort((a, b) => a.rank - b.rank);

  return {
    area: input.area,
    topic: input.topic,
    ranked_gaps: ranked,
  };
}
