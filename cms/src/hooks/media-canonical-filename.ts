/**
 * Media canonical-filename hook (beforeOperation).
 *
 * Rewrites `req.file.name` to the canonical form BEFORE Payload's
 * `generateFileData()` derives the persisted filename and the per-size
 * variant filenames. By the time `beforeValidate` runs it is too late:
 * `generateFileData` has already populated data.filename + data.sizes.*
 * .filename and tagged the buffer-list `filesToUpload` with target paths.
 *
 * Hook signature (from payload/dist/collections/operations/utilities/
 * buildBeforeOperation.js):
 *   hook({ args, collection, context, operation, overrideAccess, req })
 * Return value: the (possibly mutated) inner operation args, or
 * undefined to leave them unchanged. We don't need to swap the args
 * object — only mutate req.file.name in place — so we return undefined.
 *
 * Payload v3 hook order for upload create/update:
 *     beforeOperation              ← we run here
 *     generateFileData()
 *     beforeValidate
 *     validate
 *     beforeChange
 *     (storage-gcs adapter writes file)
 *     afterChange
 *
 * Canonical form (built by mediaName()):
 *   {source}_{kind}[_{area}][_{topic}]_{slug}-{nano}.webp
 *
 * Slug derivation order (first non-empty wins):
 *   1. data.linkedArticle  → fetch article, use its `slug`
 *   2. data.linkedHeroAd   → use `{area}-{topic}` from the linked hero ad
 *   3. data.alt            → sluggified by mediaName()
 *   4. literal "media"     → last-resort fallback so we never blow up
 *
 * No-op for non-write operations and metadata-only updates (no file).
 */
import {
  mediaName,
  type MediaArea,
  type MediaKind,
  type MediaSource,
  type MediaTopic,
} from "../lib/media-naming";

interface RelationshipRef {
  id: number | string;
  slug?: string;
  area?: { slug?: string } | string | null;
  topic?: { slug?: string } | string | null;
}

function refId(ref: unknown): number | string | null {
  if (ref == null) return null;
  if (typeof ref === "number" || typeof ref === "string") return ref;
  if (typeof ref === "object" && "id" in (ref as object)) {
    return (ref as { id: number | string }).id;
  }
  return null;
}

// Loose typing — Payload's BeforeOperationHook generic is over-constrained
// for this case and the runtime only cares about the function shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCanonicalFilename = async (params: any): Promise<void> => {
  const { req, operation } = params;

  // Only fire on create / update (the upload-bearing operations).
  if (operation !== "create" && operation !== "update") return;

  const file = req?.file;
  if (!file?.size) return; // metadata-only update — nothing to rename

  // Pull the upload payload data from args.data — Payload places it on
  // the inner operation args object (params.args.data on create/update).
  const d: Record<string, unknown> = (params.args?.data ?? {}) as Record<string, unknown>;

  const source = ((d.source as string) || "external") as MediaSource;
  const kind = ((d.kind as string) || "other") as MediaKind;
  let area = (d.area as MediaArea | null | undefined) || null;
  let topic = (d.topic as MediaTopic | null | undefined) || null;

  // ── Derive the slug ──────────────────────────────────────────────────
  let slug = "";

  // (1) linkedArticle.slug
  const articleId = refId(d.linkedArticle);
  if (articleId != null) {
    try {
      const article = (await req.payload.findByID({
        collection: "articles",
        id: articleId,
        depth: 0,
      })) as RelationshipRef | null;
      if (article?.slug) slug = String(article.slug);
    } catch (e) {
      req.payload.logger.warn(
        `[media:setCanonicalFilename] linkedArticle ${articleId} lookup failed: ${(e as Error).message}`,
      );
    }
  }

  // (2) linkedHeroAd → "{area}-{topic}"
  if (!slug) {
    const heroAdId = refId(d.linkedHeroAd);
    if (heroAdId != null) {
      try {
        const ad = (await req.payload.findByID({
          collection: "hero-ads",
          id: heroAdId,
          depth: 1,
        })) as RelationshipRef | null;
        const adAreaSlug =
          typeof ad?.area === "object" ? ad?.area?.slug : (ad?.area as string | undefined);
        const adTopicSlug =
          typeof ad?.topic === "object" ? ad?.topic?.slug : (ad?.topic as string | undefined);
        if (!area && adAreaSlug) area = adAreaSlug as MediaArea;
        if (!topic && adTopicSlug) topic = adTopicSlug as MediaTopic;
        if (adAreaSlug && adTopicSlug) {
          slug = `${adAreaSlug}-${adTopicSlug}`;
        }
      } catch (e) {
        req.payload.logger.warn(
          `[media:setCanonicalFilename] linkedHeroAd ${heroAdId} lookup failed: ${(e as Error).message}`,
        );
      }
    }
  }

  // (3) alt text
  if (!slug && typeof d.alt === "string" && d.alt.trim()) {
    slug = d.alt;
  }

  // (4) last-resort fallback
  if (!slug) slug = "media";

  // ── Build canonical filename ─────────────────────────────────────────
  let canonical: string;
  try {
    canonical = mediaName({
      source,
      kind,
      area: area || undefined,
      topic: topic || undefined,
      slug,
    });
  } catch (e) {
    req.payload.logger.warn(
      `[media:setCanonicalFilename] canonical name failed (${(e as Error).message}); using fallback`,
    );
    canonical = mediaName({
      source: "external",
      kind: "other",
      slug: typeof d.alt === "string" && d.alt ? d.alt : "media",
    });
  }

  // Mutate req.file.name in place. generateFileData() will use this as
  // the basename for both the original and every imageSize variant.
  file.name = canonical;
  // Some multipart parsers also expose .originalname / .filename — set
  // them too just in case downstream code reads any of them.
  if ("originalname" in file) (file as { originalname?: string }).originalname = canonical;
  if ("filename" in file) (file as { filename?: string }).filename = canonical;
};
