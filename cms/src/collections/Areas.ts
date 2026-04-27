import type { CollectionConfig } from "payload";

export const Areas: CollectionConfig = {
  slug: "areas",
  admin: {
    useAsTitle: "name",
    description: "8 fixed Bali areas: Canggu, Kuta, Ubud, Jimbaran, Denpasar, Kintamani, Singaraja, Nusa Penida.",
    defaultColumns: ["name", "slug"],
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
