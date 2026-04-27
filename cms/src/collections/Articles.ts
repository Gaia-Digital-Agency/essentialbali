import type { CollectionConfig } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    description: "All editorial content. AI agent submits as pending_review; human approves before publish.",
    defaultColumns: ["title", "area", "topic", "status", "publishedAt"],
  },
  access: { read: () => true },
  fields: [
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, index: true },
      ],
    },
    { name: "subTitle", type: "text" },
    {
      type: "row",
      fields: [
        { name: "area", type: "relationship", relationTo: "areas", required: true },
        { name: "topic", type: "relationship", relationTo: "topics", required: true },
        { name: "persona", type: "relationship", relationTo: "personas" },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Pending Review", value: "pending_review" },
        { label: "Approved", value: "approved" },
        { label: "Published", value: "published" },
        { label: "Rejected", value: "rejected" },
      ],
    },
    { name: "hero", type: "upload", relationTo: "media" },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    { name: "body", type: "richText", required: true },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text", admin: { description: "≤ 60 chars" } },
        { name: "metaDescription", type: "textarea", admin: { description: "≤ 160 chars" } },
        { name: "keywords", type: "text", hasMany: true },
      ],
    },
    {
      name: "source",
      type: "group",
      admin: { description: "Crawler-cited source for AI-drafted articles. Used for idempotency." },
      fields: [
        { name: "url", type: "text" },
        { name: "site", type: "text" },
        { name: "hash", type: "text", index: true, admin: { description: "Idempotency key. AI re-runs with same hash will not duplicate." } },
      ],
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    { name: "publishedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
  ],
  indexes: [
    { fields: ["area", "topic", "status"] },
    { fields: ["publishedAt"] },
  ],
};
