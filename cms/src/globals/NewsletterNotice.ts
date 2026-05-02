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
      label: "Active (sitewide kill-switch)",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description:
          "If unchecked, the entire newsletter notice section is hidden across the whole site.",
        position: "sidebar",
      },
    },
    {
      name: "headline",
      label: "Headline",
      type: "text",
      required: true,
      defaultValue: "Get The Essential",
      maxLength: 80,
      admin: {
        description: "Big serif headline shown at the top of the section.",
      },
    },
    {
      name: "subline",
      label: "Paragraph",
      type: "textarea",
      defaultValue:
        "The Essential guide to Bali's modern landscape. We bring you curated News and Events, while exploring hidden Destinations and unique Stays.",
      maxLength: 400,
      admin: {
        description: "Body paragraph under the headline.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "placeholder",
          label: "Email Placeholder Text",
          type: "text",
          defaultValue: "Enter your email",
          maxLength: 60,
          admin: { description: "Greyed-out text inside the email input field." },
        },
        {
          name: "buttonText",
          label: "Button Text",
          type: "text",
          defaultValue: "Subscribe Now",
          maxLength: 30,
          admin: { description: "Label on the Subscribe button." },
        },
      ],
    },
    {
      name: "successMessage",
      label: "Success Message",
      type: "text",
      defaultValue: "Thanks for subscribing to our newsletter!",
      maxLength: 120,
      admin: {
        description: "Toast shown to a brand-new subscriber after a successful sign-up.",
      },
    },
    {
      name: "alreadySubscribedMessage",
      label: "Already Subscribed Message",
      type: "text",
      defaultValue: "You're already subscribed — thanks!",
      maxLength: 120,
      admin: {
        description: "Toast shown when the submitted email is already on the active subscriber list.",
      },
    },
    {
      name: "errorMessage",
      label: "Error Message",
      type: "text",
      defaultValue: "Something went wrong. Please try again.",
      maxLength: 120,
      admin: { description: "Generic fallback toast for unexpected errors (network failure, server 500, etc.)." },
    },
    {
      name: "backgroundImage",
      label: "Background Image (GCS-hosted)",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional. Upload an image and it's auto-stored in the gda-essentialbali-media GCS bucket and served from there. If set, used as the section background. 1600×900 or larger recommended.",
      },
    },
  ],
};
