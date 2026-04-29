import type { CollectionConfig } from "payload";

export const Areas: CollectionConfig = {
  slug: "areas",
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    description:
      "Bali areas. Editable name / slug / intro / hero. Adding a new area also adds 8 new hero-image slots (one per topic). Removing an area cascades to its articles and hero slots — be careful.",
    defaultColumns: ["name", "slug", "lat", "lng"],
    listSearchableFields: ["name", "slug"],
  },
  access: { read: () => true },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
    { name: "intro", type: "textarea" },
    { name: "hero", type: "upload", relationTo: "media" },
    { name: "lat", type: "number" },
    { name: "lng", type: "number" },
  ],
};
