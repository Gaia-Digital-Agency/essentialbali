import type { CollectionConfig } from "payload";

export const Topics: CollectionConfig = {
  slug: "topics",
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    description:
      "Editorial topics that appear in the site nav. Adding a new topic adds 8 new hero-image slots (one per area). Removing a topic cascades to its articles and hero slots — be careful.",
    defaultColumns: ["name", "slug", "icon"],
    listSearchableFields: ["name", "slug"],
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "icon", type: "text" },
    { name: "intro", type: "textarea" },
  ],
};
