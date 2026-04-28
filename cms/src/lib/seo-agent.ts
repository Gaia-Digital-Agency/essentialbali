/**
 * In-process SEO helper — same logic as
 * /opt/.openclaw-ess/workspace-seo/scripts/optimize-meta.mjs but callable
 * from inside the Payload Next.js server (no IPC, no shell-out).
 *
 * Used by Articles.beforeChange to auto-fill empty seo.metaTitle /
 * seo.metaDescription / seo.keywords using the article's title + body
 * text. Non-empty editor-set values are NEVER overwritten.
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS (gda-viceroy service account, same
 * key the /api/ai-chat route uses).
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

export type SeoOptimizeInput = {
  area: string;
  topic: string;
  title: string;
  subTitle?: string;
  bodyText?: string; // plaintext extract of the rich-text body
  existingMetaTitle?: string;
  existingMetaDescription?: string;
};

export type SeoOptimizeOutput = {
  primary_keyword: string;
  long_tail_keywords: string[];
  meta_title: string;
  meta_description: string;
  internal_link_anchors: string[];
};

function buildPrompt(input: SeoOptimizeInput): string {
  const bodyExcerpt = (input.bodyText || "").slice(0, 4000);
  return [
    "You are an SEO specialist for Essential Bali — a Bali lifestyle publication.",
    `Area: ${input.area}.  Topic: ${input.topic}.`,
    `Title: ${input.title}`,
    input.subTitle ? `Sub-title: ${input.subTitle}` : "",
    input.existingMetaTitle ? `Existing meta_title (improve, don't duplicate): ${input.existingMetaTitle}` : "",
    bodyExcerpt ? `Article body excerpt:\n${bodyExcerpt}` : "",
    "",
    "Hard rules:",
    "- meta_title MUST be ≤ 60 characters, include primary keyword, read as a real headline.",
    "- meta_description MUST be ≤ 160 characters, include primary keyword once, end with a soft CTA.",
    "- internal_link_anchors are 3–5 short noun phrases (2–4 words each). No URLs.",
    "- DO NOT use: delve, tapestry, hidden gem, bustling, in the realm of, navigate the landscape,",
    "  unveil, embark on a journey, testament to, a myriad of, it goes without saying, game-changer.",
    "",
    "Return STRICT JSON only — no preamble, no code fences:",
    "{",
    '  "primary_keyword":      string,',
    '  "long_tail_keywords":   string[]   (3-5),',
    '  "meta_title":           string  (≤ 60 chars),',
    '  "meta_description":     string  (≤ 160 chars),',
    '  "internal_link_anchors": string[] (3-5)',
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function optimizeSeo(input: SeoOptimizeInput): Promise<SeoOptimizeOutput> {
  const client = await getAuth().getClient();
  const tokenResp = await client.getAccessToken();
  const token = tokenResp.token;
  if (!token) throw new Error("[seo-agent] failed to obtain GCP access token");

  const url =
    `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1500,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`[seo-agent] Vertex failed ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const txt =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "";
  if (!txt) throw new Error("[seo-agent] empty response from Vertex");

  let parsed: SeoOptimizeOutput;
  try {
    parsed = JSON.parse(txt);
  } catch {
    parsed = JSON.parse(txt.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  }

  // Defence in depth — clamp to the documented caps even if the model overshoots.
  parsed.meta_title = String(parsed.meta_title || "").slice(0, 60);
  parsed.meta_description = String(parsed.meta_description || "").slice(0, 160);
  parsed.long_tail_keywords = Array.isArray(parsed.long_tail_keywords)
    ? parsed.long_tail_keywords.slice(0, 5)
    : [];
  parsed.internal_link_anchors = Array.isArray(parsed.internal_link_anchors)
    ? parsed.internal_link_anchors.slice(0, 5)
    : [];
  return parsed;
}

/**
 * Minimal Lexical-richtext-to-plaintext extraction. Keeps the helper
 * dependency-free; we only need it for prompt context, not faithful
 * rendering.
 */
export function lexicalToPlain(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(lexicalToPlain).join(" ");
  if (typeof node === "object") {
    const own = typeof node.text === "string" ? node.text : "";
    const children = Array.isArray(node.children)
      ? node.children.map(lexicalToPlain).join(" ")
      : "";
    const root = node.root ? lexicalToPlain(node.root) : "";
    return [own, children, root].filter(Boolean).join(" ");
  }
  return "";
}
