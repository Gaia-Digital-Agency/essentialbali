import type { CollectionConfig } from "payload";

export const Personas: CollectionConfig = {
  slug: "personas",
  admin: {
    hidden: () => true,
    useAsTitle: "name",
    description: "Writer personas — pen names with distinct voice. E-E-A-T helps SEO.",
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "bio", type: "textarea" },
    { name: "avatar", type: "upload", relationTo: "media" },
    {
      name: "voiceNotes",
      type: "textarea",
      admin: { description: "Style guide: tone, vocabulary, do/don't list. Used by copywriter agent." },
    },
    {
      name: "topics",
      type: "relationship",
      relationTo: "topics",
      hasMany: true,
      admin: { description: "Topics this persona is best at." },
    },
  ],
};
