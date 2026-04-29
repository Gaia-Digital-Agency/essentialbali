import type { GlobalConfig } from "payload";
import { isStaffOrAgent } from "../access";

/**
 * Newsletter Notice — the on-page subscribe-form copy that appears at
 * the bottom of every public page (homepage, all 64 listing pages,
 * every article).
 *
 * NOT to be confused with "Subscriber Communication" (the `newsletters`
 * collection), which manages the actual broadcast emails sent via SMTP.
 *
 * This Global is the single source of truth for:
 *   • the headline + subline + button + placeholder text
 *   • the success / already-subscribed messages shown after submit
 *   • an optional background image
 *   • a sitewide kill-switch (`active`)
 *
 * Read by:
 *   • <NewsletterNotice> React component on the public site
 *   • POST /api/subscribers/subscribe (for server-side success messages,
 *     so server + client copy stay aligned)
 *
 * Public read access (publicly fetched by every visitor); writes
 * restricted to staff / agents.
 */
export const NewsletterNotice: GlobalConfig = {
  slug: "newsletter-notice",
  label: "Newsletter Notice",
  admin: {
    description:
      "The on-page subscribe-form block shown on every public page. Edit copy + button text + success messages here. The actual broadcast emails are managed in 'Subscriber Communication'.",
    group: "Site sections",
  },
  access: {
    read: () => true,
    update: isStaffOrAgent,
  },
  fields: [
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description:
          "If unchecked, the section is hidden sitewide. Use as a kill-switch.",
        position: "sidebar",
      },
    },
    {
      name: "headline",
      type: "text",
      required: true,
      defaultValue: "Get The Essential",
      maxLength: 80,
    },
    {
      name: "subline",
      type: "textarea",
      defaultValue:
        "The Essential guide to Bali's modern landscape. We bring you curated News and Events, while exploring hidden Destinations and unique Stays.",
      maxLength: 400,
    },
    {
      type: "row",
      fields: [
        {
          name: "placeholder",
          type: "text",
          defaultValue: "Enter your email",
          maxLength: 60,
        },
        {
          name: "buttonText",
          type: "text",
          defaultValue: "Subscribe Now",
          maxLength: 30,
        },
      ],
    },
    {
      name: "successMessage",
      type: "text",
      defaultValue: "Thanks for subscribing to our newsletter!",
      maxLength: 120,
      admin: {
        description: "Shown to a brand-new subscriber after a successful sign-up.",
      },
    },
    {
      name: "alreadySubscribedMessage",
      type: "text",
      defaultValue: "You're already subscribed — thanks!",
      maxLength: 120,
      admin: {
        description: "Shown when an email is submitted that's already on the active list.",
      },
    },
    {
      name: "errorMessage",
      type: "text",
      defaultValue: "Something went wrong. Please try again.",
      maxLength: 120,
      admin: { description: "Generic fallback for unexpected errors." },
    },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional. If set, used as the section background. 1600×900 or larger recommended.",
      },
    },
  ],
};
