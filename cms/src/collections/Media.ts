import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    hidden: () => true,
    useAsTitle: "alt",
    description: "All images and files. AI-generated hero images include a prompt.",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumbnail", width: 480, height: 270, position: "centre" },
      { name: "card", width: 768, height: 432, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    { name: "alt", type: "text", required: true },
    { name: "credit", type: "text" },
    {
      name: "generatedBy",
      type: "select",
      defaultValue: "upload",
      options: [
        { label: "Upload", value: "upload" },
        { label: "Imager (AI)", value: "imager" },
        { label: "Imported", value: "imported" },
      ],
    },
    { name: "prompt", type: "textarea", admin: { description: "Original prompt for AI-generated images." } },
  ],
};
