import type { CollectionConfig } from "payload";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    description:
      "Newsletter sign-ups. Use the Broadcast panel above to send a one-off email to all active subscribers.",
    defaultColumns: ["email", "status", "source", "createdAt"],
    components: {
      beforeListTable: ["@/components/SubscribersBroadcast"],
    },
  },
  access: { read: () => true },
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
