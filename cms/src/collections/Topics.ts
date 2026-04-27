import type { CollectionConfig } from "payload";

export const Topics: CollectionConfig = {
  slug: "topics",
  admin: {
    hidden: () => true,
    useAsTitle: "name",
    description: "8 fixed topics: Events, News, Featured, Dine, Health & Wellness, Nightlife, Activities, People & Culture.",
    defaultColumns: ["name", "slug"],
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "icon", type: "text" },
    { name: "intro", type: "textarea" },
  ],
};
