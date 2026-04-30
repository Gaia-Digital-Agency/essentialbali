import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";

/**
 * 65 hero image slots = 1 homepage default + (8 areas × 8 topics) cells.
 *
 * Slot identity:
 *   (area, topic)   — a cell-specific hero (e.g. Canggu × Dine)
 *   (NULL, NULL)    — the homepage default hero
 *   (area, NULL)    — area-level hero (no fallback used currently)
 *   (NULL, topic)   — topic-level hero (no fallback used currently)
 *
 * Uniqueness is enforced in Postgres by a partial unique index on
 *   (COALESCE(area_id, 0), COALESCE(topic_id, 0))
 * so there can be exactly one row per slot, including one (NULL, NULL).
 * That index is created by a one-off SQL because Drizzle's `unique()`
 * decorator can't express the COALESCE form.
 *
 * Each slot has:
 *   • image (creative)           — what's rendered
 *   • optional editorial copy    — title / subtitle on top of the image
 *   • optional CTA button        — only shown when ctaActive=true
 *   • optional client            — empty = editorial, populated = paid placement
 *   • active toggle              — if false, the public site falls back to nothing
 *   • optional schedule (startAt / endAt)
 */
export const HeroAds: CollectionConfig = {
  slug: "hero-ads",
  labels: { singular: "Hero Ad", plural: "Hero Ads" },
  admin: {
    useAsTitle: "label",
    description:
      "Hero ad slots: the homepage default + (8 areas × topics where showsHero=true). Editorial copy and an optional CTA button can be set per slot. Empty client = editorial; populated client = paid placement.",
    defaultColumns: ["label", "active", "client", "startAt", "endAt"],
    // The default Payload list view is replaced with the visual grid
    // (HeroGridView). Detail edit pages remain at /admin/collections/hero-ads/{id}.
    components: {
      views: {
        list: {
          Component: "@/components/HeroGridView",
        },
      },
      // Edit page: shows the "Push to all cell heroes" button on the
      // homepage default row (the (NULL, NULL) slot). The component
      // itself filters — it returns null on cell-specific edit pages.
      edit: {
        beforeDocumentControls: ["@/components/PushHomeHeroButton"],
      },
    },
  },
  access: {
    read: () => true,
    create: isStaffOrAgent,
    update: isStaffOrAgent,
    delete: isStaffOrAgent,
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "area",
          type: "relationship",
          relationTo: "areas",
          // Optional: NULL means "applies to homepage / no specific area".
          admin: { description: "Leave empty for the homepage default hero." },
        },
        {
          name: "topic",
          type: "relationship",
          relationTo: "topics",
          admin: { description: "Leave empty for the homepage default hero." },
        },
      ],
    },
    {
      name: "label",
      type: "text",
      admin: {
        description:
          "Auto-generated, e.g. 'Hero > Canggu > Events' or 'Hero > Homepage default'. Overridable.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "ACTIVATE / DEACTIVATE — controls whether this slot is rendered on the public site.",
        position: "sidebar",
      },
    },
    { name: "client", type: "text", admin: { description: "Leave empty for editorial. Populated = paid placement." } },
    { name: "creative", type: "upload", relationTo: "media", admin: { description: "The hero image. 1200×628 or larger recommended." } },
    { name: "linkUrl", type: "text", admin: { description: "Where the image itself links to when clicked." } },

    // Editorial copy on top of the image
    {
      type: "collapsible",
      label: "Editorial copy",
      admin: { initCollapsed: false },
      fields: [
        { name: "headline", type: "text", admin: { description: "Big serif overlay headline. Optional." } },
        { name: "subline", type: "textarea", admin: { description: "Short subline under the headline. Optional." } },
      ],
    },

    // Optional CTA button
    {
      type: "collapsible",
      label: "CTA button",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "ctaActive",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "If checked, a CTA button is shown on the hero." },
        },
        {
          name: "ctaText",
          type: "text",
          maxLength: 40,
          admin: {
            description: "Button label, e.g. 'Read more', 'Explore Canggu'. Max 40 chars.",
            condition: (data) => !!data?.ctaActive,
          },
        },
        {
          name: "ctaUrl",
          type: "text",
          admin: {
            description: "Where the CTA button links. Independent of the image link above.",
            condition: (data) => !!data?.ctaActive,
          },
        },
      ],
    },

    {
      type: "row",
      fields: [
        { name: "startAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
  ],
  // The cell-uniqueness constraint is enforced in Postgres via a partial
  // unique index on COALESCE(area_id, 0), COALESCE(topic_id, 0) — applied
  // in migration 20260429_120000_n3_hero_slots_65.ts. We intentionally do NOT
  // declare a Payload `indexes` entry here because Drizzle would emit a
  // standard unique index on (area_id, topic_id), which lets multiple
  // (NULL, NULL) rows through.
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-fill the label.
        if (!data.label) {
          if (!data.area && !data.topic) {
            data.label = "Hero > Homepage default";
          } else if (data.area && data.topic) {
            try {
              const area = await req.payload.findByID({ collection: "areas", id: data.area });
              const topic = await req.payload.findByID({ collection: "topics", id: data.topic });
              if (area?.name && topic?.name) {
                data.label = `Hero > ${area.name} > ${topic.name}`;
              }
            } catch {
              /* ignore — label optional */
            }
          } else if (data.area) {
            try {
              const area = await req.payload.findByID({ collection: "areas", id: data.area });
              if (area?.name) data.label = `Hero > ${area.name} > (any topic)`;
            } catch { /* ignore */ }
          } else if (data.topic) {
            try {
              const topic = await req.payload.findByID({ collection: "topics", id: data.topic });
              if (topic?.name) data.label = `Hero > (any area) > ${topic.name}`;
            } catch { /* ignore */ }
          }
        }
        return data;
      },
    ],
  },
};
