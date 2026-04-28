import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    description:
      "All newsletter sign-ups. To compose and send a newsletter, go to the Newsletters collection.",
    defaultColumns: ["email", "status", "source", "createdAt"],
  },
  access: {
    read: () => true,
    create: isStaffOrAgent,
    update: isStaffOrAgent,
    delete: isStaffOrAgent,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Unsubscribed", value: "unsubscribed" },
        { label: "Bounced", value: "bounced" },
      ],
    },
    { name: "source", type: "text", admin: { description: "Where the sign-up came from (e.g. 'footer', 'popup')." } },
  ],
};
