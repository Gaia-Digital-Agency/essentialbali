import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";
import { optimizeSeo, lexicalToPlain } from "../lib/seo-agent";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    description:
      "All editorial content. AI submits as pending_review; human approves before publish. Use the matrix above to filter by area × topic.",
    defaultColumns: ["title", "area", "topic", "status", "updatedAt"],
    pagination: {
      defaultLimit: 25,
      limits: [25, 50, 100],
    },
    components: {
      // 8×8 matrix filter + status chips, rendered above the standard list table.
      beforeListTable: ["@/components/ArticlesMatrixFilter"],
      // Edit page: the "🔁 Regenerate hero" button + feedback input.
      // Renders below the document fields. Hidden on the create form.
      edit: {
        beforeDocumentControls: ["@/components/RegenerateHeroButton"],
      },
    },
  },
  defaultSort: "-updatedAt",
  access: {
    read: () => true,
    create: isStaffOrAgent,
    update: isStaffOrAgent,
    delete: isStaffOrAgent,
  },
  hooks: {
    beforeChange: [
      // Auto-fill seo.metaTitle / seo.metaDescription via the live SEO agent
      // (Vertex Gemini) when both are empty. Editor-typed values are NEVER
      // overwritten. Failure is non-fatal — we just log and let the article
      // save without SEO meta.
      async ({ data, req, operation }) => {
        if (operation !== "create" && operation !== "update") return data;
        const seo = (data.seo as Record<string, unknown> | undefined) || {};
        const metaTitle = typeof seo.metaTitle === "string" ? seo.metaTitle.trim() : "";
        const metaDescription =
          typeof seo.metaDescription === "string" ? seo.metaDescription.trim() : "";
        // Skip when at least one is already set OR when title/area/topic are missing
        // (the model needs context).
        if (metaTitle && metaDescription) return data;
        if (!data.title || !data.area || !data.topic) return data;

        // Resolve area/topic slugs (the field stores ids when saving from admin).
        const payload = req?.payload;
        if (!payload) return data;
        let areaSlug: string | null = null;
        let topicSlug: string | null = null;
        try {
          const areaDoc =
            typeof data.area === "object" && data.area !== null && "slug" in data.area
              ? (data.area as { slug?: string })
              : await payload.findByID({ collection: "areas", id: data.area as string, depth: 0 }).catch(() => null);
          areaSlug = areaDoc?.slug ?? null;
          const topicDoc =
            typeof data.topic === "object" && data.topic !== null && "slug" in data.topic
              ? (data.topic as { slug?: string })
              : await payload.findByID({ collection: "topics", id: data.topic as string, depth: 0 }).catch(() => null);
          topicSlug = topicDoc?.slug ?? null;
        } catch (e) {
          req?.payload?.logger?.warn?.(`[seo-autofill] taxonomy lookup failed: ${String(e)}`);
        }
        if (!areaSlug || !topicSlug) return data;

        const bodyText = lexicalToPlain(data.body).slice(0, 4000);
        try {
          const out = await optimizeSeo({
            area: areaSlug,
            topic: topicSlug,
            title: String(data.title),
            subTitle: typeof data.subTitle === "string" ? data.subTitle : undefined,
            bodyText,
            existingMetaTitle: metaTitle || undefined,
            existingMetaDescription: metaDescription || undefined,
          });
          data.seo = {
            ...seo,
            metaTitle: metaTitle || out.meta_title,
            metaDescription: metaDescription || out.meta_description,
            keywords:
              Array.isArray(seo.keywords) && (seo.keywords as unknown[]).length > 0
                ? seo.keywords
                : [out.primary_keyword, ...out.long_tail_keywords].filter(Boolean).slice(0, 7),
          };
          req?.payload?.logger?.info?.(
            `[seo-autofill] filled meta for "${String(data.title).slice(0, 60)}"`,
          );
        } catch (e) {
          req?.payload?.logger?.warn?.(
            `[seo-autofill] SEO agent failed for "${String(data.title).slice(0, 60)}": ${String(e)}`,
          );
        }
        return data;
      },

      // Auto-promote on approve. When the operator flips status from
      // anything-not-approved to "approved" (e.g. via the admin
      // Status dropdown), we promote it straight to "published" and
      // stamp publishedAt — saves them an extra click.
      //
      // We do this in beforeChange (mutating `data` in place) rather
      // than afterChange + an inner payload.update(), because the
      // inner-update path deadlocks Payload's transaction. beforeChange
      // is single-pass and never recurses.
      async ({ data, originalDoc, operation }) => {
        if (operation !== "update") return data;
        if (data.status !== "approved") return data;
        // Don't re-promote if already approved (would clobber a manual
        // edit that left status=approved while changing other fields).
        if (originalDoc?.status === "approved" || originalDoc?.status === "published") return data;
        data.status = "published";
        if (!data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
  },
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
      // Event-only metadata. Only consumed when topic = Events; the
      // generic article templates ignore these fields. Editors writing
      // an event piece fill the date/time/venue here and the
      // EventsV3.tsx + SingleEventV2.tsx templates render them as
      // structured event headers + filterable date/time chips.
      //
      // Replaces the legacy meta_data.{start_date, end_date, start_time,
      // end_time} JSON blob from the retired MySQL schema.
      name: "eventDetails",
      type: "group",
      admin: {
        description:
          "Used only when Topic = Events. Date / time / venue render in the events listing and single-event page. Ignored for the other 7 topics.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "startDate",
              type: "date",
              index: true,
              admin: {
                date: { pickerAppearance: "dayOnly" },
                description: "Event start date (or single-day date).",
              },
            },
            {
              name: "endDate",
              type: "date",
              admin: {
                date: { pickerAppearance: "dayOnly" },
                description: "Optional. Leave empty for a single-day event.",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "startTime",
              type: "text",
              maxLength: 5,
              admin: {
                placeholder: "18:00",
                description: "24-hour HH:MM. Used by the morning/afternoon/night filter.",
              },
            },
            {
              name: "endTime",
              type: "text",
              maxLength: 5,
              admin: { placeholder: "23:00" },
            },
            {
              name: "timeOfDay",
              type: "select",
              options: [
                { label: "Morning (01:00-12:00)", value: "morning" },
                { label: "Afternoon (12:00-18:00)", value: "afternoon" },
                { label: "Night (18:00-24:00)", value: "night" },
                { label: "All-day", value: "all-day" },
              ],
              admin: {
                description:
                  "Auto-derived from startTime when blank. Set explicitly for all-day events or to override.",
              },
            },
          ],
        },
        { name: "venueName", type: "text", admin: { placeholder: "e.g. Potato Head Beach Club" } },
        { name: "venueAddress", type: "textarea" },
        {
          type: "row",
          fields: [
            { name: "venueLat", type: "number" },
            { name: "venueLng", type: "number" },
          ],
        },
        { name: "ticketUrl", type: "text", admin: { description: "Booking / ticket page (optional)." } },
        {
          name: "recurrence",
          type: "select",
          defaultValue: "one-off",
          options: [
            { label: "One-off", value: "one-off" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Annual", value: "annual" },
          ],
        },
      ],
      hooks: {
        beforeChange: [
          // Auto-derive timeOfDay from startTime when not explicitly set.
          // Only runs when an event has a startTime (HH:MM) and no
          // timeOfDay was chosen. Doesn't overwrite an editor's pick.
          ({ value, siblingData }) => {
            if (!value) return value;
            const v = value as Record<string, unknown>;
            if (v.timeOfDay) return v;
            const st = typeof v.startTime === "string" ? v.startTime : "";
            const m = st.match(/^(\d{1,2}):(\d{2})$/);
            if (!m) return v;
            const h = Number(m[1]);
            if (Number.isNaN(h)) return v;
            if (h >= 1 && h < 12) v.timeOfDay = "morning";
            else if (h >= 12 && h < 18) v.timeOfDay = "afternoon";
            else if (h >= 18 && h < 24) v.timeOfDay = "night";
            return v;
          },
        ],
      },
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    { name: "publishedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },

    // Homepage daily-feed rotation tracking. Hidden in admin UI — only the
    // pick-daily-feed.mjs cron writes these. Used by the picker to give
    // newer / less-shown articles priority and avoid repeats until the
    // pool is exhausted (cycle length = ceil(published / 16) days).
    {
      name: "homeFeaturedCount",
      type: "number",
      defaultValue: 0,
      admin: { hidden: true },
      index: true,
    },
    {
      name: "homeLastFeaturedAt",
      type: "date",
      admin: { hidden: true, date: { pickerAppearance: "dayAndTime" } },
      index: true,
    },
  ],
  indexes: [
    { fields: ["area", "topic", "status"] },
    { fields: ["publishedAt"] },
    // Compound index for the daily picker's sort key.
    { fields: ["homeFeaturedCount", "homeLastFeaturedAt"] },
  ],
};
