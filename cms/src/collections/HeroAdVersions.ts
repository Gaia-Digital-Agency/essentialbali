import type { CollectionConfig } from "payload";
import { isStaffOrAgent } from "../access";

/**
 * Append-only audit log of hero-ad slot changes.
 *
 * Written by the `afterChange` hook on the `hero-ads` collection — every
 * create / update produces one row here capturing the state of the slot
 * at that moment. Delete events are recorded via a beforeDelete hook
 * that snapshots originalDoc before the row is removed.
 *
 * Read by the History tab on the hero-ads edit page (`HeroAdHistory.tsx`)
 * which queries `where[slot][equals]={id}&sort=-changedAt`.
 *
 * Why a separate collection instead of Payload v3's built-in
 * versioning: Payload's versioning is per-document and intended for
 * draft/publish flows. We want an audit trail of WHO changed WHAT and
 * WHEN — including who deleted a slot — surfaced cleanly inline. A
 * tiny dedicated collection is simpler than wiring versioning + a
 * custom view on top of it.
 *
 * Access:
 *   read    — public (for the History tab on the public side, if ever)
 *   create  — isStaffOrAgent (only the hook calls this)
 *   update  — disabled (audit log is append-only)
 *   delete  — admin only (for occasional housekeeping)
 */
export const HeroAdVersions: CollectionConfig = {
  slug: "hero-ad-versions",
  labels: { singular: "Hero Ad Version", plural: "Hero Ad History" },
  admin: {
    useAsTitle: "label",
    group: "System",
    description:
      "Append-only audit log of every change to a hero-ads slot. Auto-written by hooks; manual edits disallowed.",
    defaultColumns: ["slot", "event", "active", "client", "changedAt", "changedBy"],
    listSearchableFields: ["label"],
    pagination: { defaultLimit: 50 },
  },
  defaultSort: "-changedAt",
  access: {
    read: () => true,
    create: isStaffOrAgent,
    update: () => false, // append-only
    delete: ({ req }) => (req.user as any)?.role === "admin",
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "slot",
          type: "relationship",
          relationTo: "hero-ads",
          required: true,
          index: true,
          admin: { description: "The hero-ads row this snapshot belongs to." },
        },
        {
          name: "event",
          type: "select",
          required: true,
          defaultValue: "update",
          options: [
            { label: "Create", value: "create" },
            { label: "Update", value: "update" },
            { label: "Delete", value: "delete" },
          ],
          admin: { description: "Which Payload lifecycle hook fired." },
        },
      ],
    },
    {
      name: "label",
      type: "text",
      admin: {
        description:
          "Auto-derived: '<event> · <slot label> · <changedAt>'.",
      },
    },
    {
      name: "changedAt",
      type: "date",
      required: true,
      index: true,
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        readOnly: true,
      },
    },
    {
      name: "changedBy",
      type: "relationship",
      relationTo: "users",
      admin: { description: "User who triggered the change. Null for system events." },
    },

    // Snapshot of the hero-ads core fields at the moment of change.
    // Mirrors the columns in HeroAds.ts so the History UI can render
    // a side-by-side or change-by-change view if we ever want one.
    {
      name: "snapshot",
      type: "group",
      fields: [
        { name: "area", type: "relationship", relationTo: "areas" },
        { name: "topic", type: "relationship", relationTo: "topics" },
        { name: "active", type: "checkbox" },
        { name: "client", type: "text" },
        { name: "creative", type: "upload", relationTo: "media" },
        { name: "linkUrl", type: "text" },
        { name: "headline", type: "text" },
        { name: "subline", type: "textarea" },
        { name: "ctaActive", type: "checkbox" },
        { name: "ctaText", type: "text" },
        { name: "ctaUrl", type: "text" },
        { name: "startAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
  ],
};
