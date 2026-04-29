/**
 * In-process Imagen 3 regenerate helper.
 *
 * Mirrors /opt/.openclaw-ess/workspace-imager/scripts/regenerate.mjs
 * (which is the Elliot orchestrator path). This in-process version
 * powers the "🔁 Regenerate hero" button in the Payload admin so the
 * editor can re-roll the hero image without leaving the article page.
 *
 * Both paths share the SAME Vertex prompt construction + negative-prompt
 * mapping, so admin-clicked regenerations and Elliot-orchestrated
 * regenerations are interchangeable. Drift surface is small.
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS service-account → Vertex Imagen.
 */
import "server-only";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "gda-viceroy";
const LOCATION = process.env.GCP_VERTEX_LOCATION || "asia-southeast1";
const IMAGE_MODEL =
  process.env.GCP_VERTEX_IMAGE_MODEL || "imagen-3.0-generate-002";

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

const AREA_CUES: Record<string, string> = {
  canggu: "Canggu, Bali — black volcanic-sand beach, surfboards, expat cafes, rice paddies meeting coast",
  kuta: "Kuta, Bali — wide pale beach, sunset crowds, beach umbrellas, busy boardwalk",
  ubud: "Ubud, Bali — terraced rice fields, jungle canopy, traditional carved wood, river gorges",
  jimbaran: "Jimbaran, Bali — fishing boats on bay, seafood grills on the sand, evening warm light",
  denpasar: "Denpasar, Bali — urban capital, night markets, traditional pasar, motorbike streets",
  kintamani: "Kintamani, Bali — Mount Batur volcano, crater lake, cool highland mist, lava-rock fields",
  singaraja: "Singaraja, North Bali — quiet northern coast, dolphin boats at Lovina, Dutch colonial buildings",
  "nusa-penida": "Nusa Penida, Bali — dramatic limestone cliffs, turquoise sea, Kelingking T-Rex viewpoint",
};
const TOPIC_CUES: Record<string, string> = {
  events: "lively scene of people gathered, banners or stage subtly visible, festival atmosphere",
  news: "documentary-style street photography, candid local life, no posed subjects",
  featured: "wide editorial establishing shot, cinematic, golden-hour light",
  dine: "close-up Indonesian food on woven tray or wooden table, steam, warm tungsten light, shallow depth of field",
  "health-wellness": "calm spa or yoga scene, soft natural light, plants, traditional Balinese textiles",
  nightlife: "dusk-to-evening venue, string lights, glassware on bar, warm atmospheric haze",
  activities: "person mid-activity (surfing, hiking, diving) in motion, dynamic angle, natural daylight",
  "people-culture": "respectful portrait of traditional ceremony or craft, ceremonial dress, no faces in tight close-up",
};
const NEGATIVE_BASE = [
  "watermarks", "text overlays", "logos", "blurry", "low quality",
  "stock-photo cliché", "ai-generated face artifacts", "extra fingers",
  "western tourists in close-up", "religious imagery used disrespectfully",
];

// Free-form feedback → extra negative-prompt fragments (mirrors the
// orchestrator script's mapping so admin and Elliot produce identical
// outputs for the same feedback string).
function feedbackToNegative(feedback: string): string {
  const f = String(feedback || "").toLowerCase();
  const extras: string[] = [];
  if (/no people|no faces|no person|no humans/.test(f)) extras.push("people, faces, humans");
  if (/less generic|not stock|not cliché|not cliche/.test(f)) extras.push("stock-photo cliché, generic photography, posed model");
  if (/no signs|no text|no sign/.test(f)) extras.push("text, signage, lettering, captions");
  if (/no logo/.test(f)) extras.push("logos, brand marks");
  if (/sharper|crisp/.test(f)) extras.push("blurry, soft focus");
  if (/no white background|no studio/.test(f)) extras.push("white background, studio shot, isolated subject");
  return extras.join(", ");
}

export type RegenerateInput = {
  area: string;
  topic: string;
  title: string;
  summary?: string;
  persona?: string;
  feedback: string;
};

export type RegenerateOutput = {
  /** Raw PNG bytes (caller writes to disk or pipes into Payload media upload). */
  png: Buffer;
  /** Final prompt sent to Imagen — useful for logging. */
  prompt: string;
  /** Final negative prompt. */
  negativePrompt: string;
  width: number;
  height: number;
};

function buildPrompt({ area, topic, title, summary, persona, feedback }: RegenerateInput): string {
  const areaCue = AREA_CUES[area] || `${area}, Bali`;
  const topicCue = TOPIC_CUES[topic] || "";
  const personaHint =
    persona === "maya" ? "foodie editorial, close-up food and hands" :
    persona === "komang" ? "outdoor activity editorial, natural environment" :
    persona === "putu" ? "cultural anthropology, respectful documentary tone" :
    persona === "sari" ? "after-dark editorial, motion and atmosphere" :
    "Bali lifestyle editorial";
  const augmentedSummary = [
    summary || title,
    "Operator feedback: " + String(feedback || "").trim().slice(0, 240),
  ].filter(Boolean).join(". ");
  return [
    `${title}.`,
    augmentedSummary ? `${augmentedSummary}.` : "",
    `Setting: ${areaCue}.`,
    topicCue ? `Composition: ${topicCue}.` : "",
    `Style: ${personaHint}, photographic, magazine-quality, natural light, no text, no logos.`,
  ].filter(Boolean).join(" ");
}

export async function regenerateHero(input: RegenerateInput): Promise<RegenerateOutput> {
  const client = await getAuth().getClient();
  const tokenResp = await client.getAccessToken();
  const token = tokenResp.token;
  if (!token) throw new Error("[imager-regenerate] failed to obtain GCP access token");

  const prompt = buildPrompt(input);
  const negativePrompt = [NEGATIVE_BASE.join(", "), feedbackToNegative(input.feedback)]
    .filter(Boolean)
    .join(", ");

  const url =
    `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/locations/${LOCATION}/publishers/google/models/${IMAGE_MODEL}:predict`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        negativePrompt,
        addWatermark: false,
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`[imager-regenerate] Vertex Imagen ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as { predictions?: { bytesBase64Encoded?: string }[] };
  const b64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("[imager-regenerate] Imagen returned no bytes");
  const png = Buffer.from(b64, "base64");

  // Read width/height from PNG IHDR (bytes 16..23 big-endian).
  let width = 0, height = 0;
  if (png.length > 24 && png.slice(1, 4).toString() === "PNG") {
    width = png.readUInt32BE(16);
    height = png.readUInt32BE(20);
  }

  return { png, prompt, negativePrompt, width, height };
}
