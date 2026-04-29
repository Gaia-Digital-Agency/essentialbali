/**
 * Media naming convention — canonical filename builder + parser.
 *
 * Format:
 *   {source}_{kind}[_{area}][_{topic}]_{slug}-{nano}.webp
 *
 * Examples:
 *   imager_hero_canggu_activities_sunset-surf-spots-3k7q9p.webp
 *   imager_hero_ads_kuta_nightlife_friday-block-9z2x1m.webp
 *   imager_newsletter_weekly-april-29-7n4b8r.webp           (no area/topic)
 *   external_inline_ubud_health-wellness_yoga-retreat-2v6a4d.webp
 *   external_avatar_persona-zara-bali-1f8e0c.webp           (no area/topic)
 *
 * Rules:
 *   - All lowercase, snake_case for kind/area/topic, kebab-case for slug.
 *   - Always .webp extension on disk; jpeg/jpg/png inputs are converted.
 *   - source ∈ imager | external
 *   - kind   ∈ hero | hero_ads | inline | newsletter | avatar | banner | other
 *   - area   ∈ 8 known Bali areas (optional, omitted cleanly when n/a)
 *   - topic  ∈ 8 known site topics (optional, omitted cleanly when n/a)
 *   - slug   = the article/asset slug, kebab-case, ≤80 chars
 *   - nano   = 6-char base36 random suffix for collision safety on re-rolls
 */

export const VALID_SOURCES = ["imager", "external"] as const;
export type MediaSource = (typeof VALID_SOURCES)[number];

export const VALID_KINDS = [
  "hero",
  "hero_ads",
  "inline",
  "newsletter",
  "avatar",
  "banner",
  "other",
] as const;
export type MediaKind = (typeof VALID_KINDS)[number];

export const VALID_AREAS = [
  "canggu",
  "kuta",
  "ubud",
  "jimbaran",
  "denpasar",
  "kintamani",
  "singaraja",
  "nusa-penida",
] as const;
export type MediaArea = (typeof VALID_AREAS)[number];

export const VALID_TOPICS = [
  "events",
  "news",
  "featured",
  "dine",
  "health-wellness",
  "nightlife",
  "activities",
  "people-culture",
] as const;
export type MediaTopic = (typeof VALID_TOPICS)[number];

export interface MediaNameInput {
  source: MediaSource;
  kind: MediaKind;
  area?: MediaArea | null;
  topic?: MediaTopic | null;
  slug: string;
  /** Optional override for the 6-char nano stamp (test only). */
  nano?: string;
}

export interface MediaNameParsed {
  source: MediaSource | null;
  kind: MediaKind | null;
  area: MediaArea | null;
  topic: MediaTopic | null;
  slug: string | null;
  nano: string | null;
  ext: string | null;
}

const SLUG_MAX = 80;

/** Lowercase, strip non-alnum-or-dash, collapse runs of `-`, trim ends. */
function safeSlug(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX);
}

/** Snake-case key — used for kind. (Areas + topics are pre-validated against known lists.) */
function safeSnake(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/** 6-char base36 random suffix (~2 billion combos). */
function nanoStamp(): string {
  // Math.random gives ~52 bits; toString(36) is base36; pad to 6.
  return (Math.random().toString(36) + "000000").slice(2, 8);
}

/**
 * Build the canonical filename.
 *
 * Throws if source/kind invalid. Area/topic — if provided — must match the
 * known lists (otherwise we'd corrupt the URL space).
 */
export function mediaName(input: MediaNameInput): string {
  const { source, kind, area, topic, slug, nano } = input;

  if (!VALID_SOURCES.includes(source as MediaSource)) {
    throw new Error(`mediaName: invalid source "${source}"`);
  }
  if (!VALID_KINDS.includes(kind as MediaKind)) {
    throw new Error(`mediaName: invalid kind "${kind}"`);
  }
  if (area && !VALID_AREAS.includes(area as MediaArea)) {
    throw new Error(`mediaName: invalid area "${area}"`);
  }
  if (topic && !VALID_TOPICS.includes(topic as MediaTopic)) {
    throw new Error(`mediaName: invalid topic "${topic}"`);
  }
  if (!slug || typeof slug !== "string") {
    throw new Error(`mediaName: slug is required`);
  }

  const slugSafe = safeSlug(slug);
  if (!slugSafe) throw new Error(`mediaName: slug yielded empty after sanitisation`);

  const parts: string[] = [safeSnake(source), safeSnake(kind)];
  if (area) parts.push(area);
  if (topic) parts.push(topic);
  parts.push(`${slugSafe}-${nano || nanoStamp()}`);

  return `${parts.join("_")}.webp`;
}

/**
 * Parse a canonical filename back into its parts.
 *
 * Best-effort: if a token doesn't match a known list it's left null rather
 * than throwing. Used for diagnostics + admin display, not for any
 * security-sensitive routing.
 */
export function parseMediaName(filename: string): MediaNameParsed {
  const out: MediaNameParsed = {
    source: null,
    kind: null,
    area: null,
    topic: null,
    slug: null,
    nano: null,
    ext: null,
  };

  if (!filename || typeof filename !== "string") return out;

  const dot = filename.lastIndexOf(".");
  if (dot < 0) return out;
  out.ext = filename.slice(dot + 1).toLowerCase();
  const stem = filename.slice(0, dot);

  // Last `-` separates {slug}-{nano}; the head before that is `_`-joined parts.
  const lastDash = stem.lastIndexOf("-");
  if (lastDash < 0) return out;
  const head = stem.slice(0, lastDash);
  out.nano = stem.slice(lastDash + 1) || null;

  const tokens = head.split("_").filter(Boolean);
  if (tokens.length < 3) return out;

  // tokens = [source, kind, ...optional area/topic, slug]
  // Walk left-to-right peeling known tokens.
  let i = 0;
  if (VALID_SOURCES.includes(tokens[i] as MediaSource)) {
    out.source = tokens[i] as MediaSource;
    i++;
  }
  // kind may be one or two tokens (hero_ads / health-wellness style is hyphenated, not underscored).
  // Try two-token kind first (e.g. hero_ads).
  const twoTok = `${tokens[i]}_${tokens[i + 1]}`;
  if (VALID_KINDS.includes(twoTok as MediaKind)) {
    out.kind = twoTok as MediaKind;
    i += 2;
  } else if (VALID_KINDS.includes(tokens[i] as MediaKind)) {
    out.kind = tokens[i] as MediaKind;
    i++;
  }
  // Optional area
  if (tokens[i] && VALID_AREAS.includes(tokens[i] as MediaArea)) {
    out.area = tokens[i] as MediaArea;
    i++;
  }
  // Optional topic
  if (tokens[i] && VALID_TOPICS.includes(tokens[i] as MediaTopic)) {
    out.topic = tokens[i] as MediaTopic;
    i++;
  }
  // Remainder is slug
  if (i < tokens.length) {
    out.slug = tokens.slice(i).join("_") || null;
  }

  return out;
}

/** Cheap predicate — does this filename look like it follows the convention? */
export function isCanonicalMediaName(filename: string): boolean {
  const p = parseMediaName(filename);
  return Boolean(p.source && p.kind && p.slug && p.nano && p.ext === "webp");
}

export default mediaName;
