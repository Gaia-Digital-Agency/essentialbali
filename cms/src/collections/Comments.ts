import type { CollectionConfig } from "payload";

export const Comments: CollectionConfig = {
  slug: "comments",
  admin: {
    hidden: () => true,
    useAsTitle: "body",
    description: "Comments on articles. AI agent can author as a persona; humans show with their own name.",
    defaultColumns: ["article", "persona", "authorName", "status", "createdAt"],
  },
  access: { read: () => true },
  fields: [
    { name: "article", type: "relationship", relationTo: "articles", required: true },
    { name: "persona", type: "relationship", relationTo: "personas", admin: { description: "Set if comment is authored by an AI persona." } },
    { name: "authorName", type: "text", admin: { description: "For real-human commenters." } },
    { name: "body", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "visible",
      options: [
        { label: "Visible", value: "visible" },
        { label: "Hidden", value: "hidden" },
        { label: "Spam", value: "spam" },
      ],
    },
    { name: "parent", type: "relationship", relationTo: "comments", admin: { description: "For threaded replies." } },
  ],
};
