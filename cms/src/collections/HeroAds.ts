import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";

/**
 * 64 fixed hero ad slots — one per (area, topic) cell.
 *
 * Until activated, each slot displays the placeholder text:
 *   "Ads space > {Area Name} > {Topic Name}"
 *
 * Toggle the `active` boolean in admin to flip between placeholder and live creative.
 */
export const HeroAds: CollectionConfig = {
  slug: "hero-ads",
  admin: {
    useAsTitle: "label",
    description:
      "64 ad slots (8 areas × 8 topics). Default placeholder shows until 'active' is toggled on. Schedule with start/end. Manage clients here.",
    defaultColumns: ["label", "active", "client", "startAt", "endAt"],
    // The default Payload list view is replaced with the 8×8 visual grid
    // (HeroGridView). Detail edit pages remain at /admin/collections/hero-ads/{id}.
    components: {
      views: {
        list: {
          Component: "@/components/HeroGridView",
        },
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
        { name: "area", type: "relationship", relationTo: "areas", required: true },
        { name: "topic", type: "relationship", relationTo: "topics", required: true },
      ],
    },
    {
      name: "label",
      type: "text",
      admin: {
        description: "Auto-generated placeholder, e.g. 'Ads space > Canggu > Events'. Overridable.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "ACTIVATE / DEACTIVATE — controls whether this slot shows a live creative or the placeholder.",
        position: "sidebar",
      },
    },
    { name: "client", type: "text" },
    { name: "creative", type: "upload", relationTo: "media" },
    { name: "linkUrl", type: "text" },
    {
      type: "row",
      fields: [
        { name: "startAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
  ],
  indexes: [{ fields: ["area", "topic"], unique: true }],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-fill the placeholder label on create/update if blank.
        if (!data.label && data.area && data.topic) {
          try {
            const area = await req.payload.findByID({ collection: "areas", id: data.area });
            const topic = await req.payload.findByID({ collection: "topics", id: data.topic });
            if (area?.name && topic?.name) {
              data.label = `Ads space > ${area.name} > ${topic.name}`;
            }
          } catch {
            // ignore — label optional
          }
        }
        return data;
      },
    ],
  },
};
