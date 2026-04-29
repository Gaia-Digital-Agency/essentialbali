import type { CollectionConfig } from "payload";
import { VALID_AREAS, VALID_KINDS, VALID_TOPICS } from "../lib/media-naming";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Media collection — single source of truth for all images on essentialbali.
 *
 * Naming convention enforced via beforeChange hook in N3:
 *   {source}_{kind}[_{area}][_{topic}]_{slug}-{nano}.webp
 *
 * Hard rules (server-enforced):
 *   - Accepted MIMEs: image/jpeg, image/png, image/webp (videos rejected)
 *   - Max upload size: 10 MB (rejected at beforeValidate)
 *   - Output format: WebP for the original + every imageSize variant
 *     (jpeg/png inputs are auto-converted by Sharp via formatOptions)
 *
 * Editorial fields (set by Imager pipeline / upload dock):
 *   - source        — who created the image (imager | external)
 *   - kind          — how it's used (hero, hero_ads, inline, …)
 *   - area / topic  — optional content-tagging
 *   - linkedArticle — back-pointer to the article that owns the hero
 *   - linkedHeroAd  — back-pointer to the hero-ad slot using the creative
 *   - prompt        — original Imagen prompt, kept for re-roll context
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    hidden: () => true,
    useAsTitle: "alt",
    description:
      "All images. Always WebP, ≤10 MB, named per the canonical convention.",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    // Re-encode original to WebP regardless of input format.
    formatOptions: { format: "webp", options: { quality: 85 } },
    imageSizes: [
      {
        name: "thumbnail",
        width: 480,
        height: 270,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 80 } },
      },
      {
        name: "card",
        width: 768,
        height: 432,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        name: "hero",
        width: 1920,
        height: 1080,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 85 } },
      },
    ],
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Reject oversize uploads early so we never spend Sharp CPU on them.
        // req.file is set by Payload during multipart upload; data.filesize
        // is set after Sharp processing on later updates. Check both.
        const incomingSize =
          (req as unknown as { file?: { size?: number } }).file?.size ??
          (data as { filesize?: number } | undefined)?.filesize ??
          0;
        if (incomingSize && incomingSize > MAX_FILE_BYTES) {
          throw new Error(
            `Upload too large: ${(incomingSize / 1024 / 1024).toFixed(1)} MB. Max is 10 MB.`,
          );
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: { description: "Accessibility + SEO. Required for every image." },
    },
    { name: "credit", type: "text" },

    // ── Naming-convention metadata ─────────────────────────────────────────
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "external",
      options: [
        { label: "Imager (AI generated)", value: "imager" },
        { label: "External / upload",    value: "external" },
      ],
      admin: {
        description:
          "imager = produced by the Imagen pipeline. external = uploaded by a human or imported from elsewhere.",
      },
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "other",
      options: VALID_KINDS.map((k) => ({
        label: k.replace(/_/g, " "),
        value: k,
      })),
      admin: {
        description:
          "How the image is used. Drives the canonical filename + the Imager gallery filter.",
      },
    },
    {
      name: "area",
      type: "select",
      options: VALID_AREAS.map((a) => ({ label: a, value: a })),
      admin: {
        description: "Optional. Use when the image belongs to a specific Bali area.",
      },
    },
    {
      name: "topic",
      type: "select",
      options: VALID_TOPICS.map((t) => ({ label: t, value: t })),
      admin: {
        description: "Optional. Use when the image belongs to a specific site topic.",
      },
    },

    // ── Back-pointers (optional, populated by the dispatch / upload flow) ──
    {
      name: "linkedArticle",
      type: "relationship",
      relationTo: "articles",
      admin: {
        description:
          "If this image is an article hero/inline, the article it belongs to.",
      },
    },
    {
      name: "linkedHeroAd",
      type: "relationship",
      relationTo: "hero-ads",
      admin: {
        description:
          "If this image is a hero-ad creative, the hero-ad slot it belongs to.",
      },
    },

    // ── AI-generation context ─────────────────────────────────────────────
    {
      name: "prompt",
      type: "textarea",
      admin: {
        description:
          "Original Imagen prompt. Kept so re-rolls can reuse or refine it.",
      },
    },
  ],
};
