import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    hidden: () => true,
    useAsTitle: "name",
    description: "Secondary taxonomy for SEO and discovery.",
  },
  access: {
    read: () => true,
    // Staff + ai-agent can create new tags inline. When Elliot dispatches
    // an article with a tag slug that doesn't exist yet, resolveTagIds()
    // in dispatch-article.mjs auto-creates it. Without this, dispatches
    // with new tags silently end up tagless.
    create: isStaffOrAgent,
    update: isStaffOrAgent,
    delete: isStaffOrAgent,
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "name", type: "text", required: true },
  ],
};
