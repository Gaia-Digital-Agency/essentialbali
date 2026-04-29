import { isStaffOrAgent } from "../access";
import type { CollectionConfig } from "payload";

/**
 * Each Newsletter document = one broadcast email to all active subscribers.
 *
 * Workflow:
 *   1. Compose with status = "draft"
 *   2. Save
 *   3. Click "Send to subscribers" in the sidebar (custom action) — or set status="sending" and save
 *   4. After-change hook performs the BCC send via Payload's email transport,
 *      then sets status="sent", recipientCount, sentAt.
 */
export const Newsletters: CollectionConfig = {
  slug: "newsletters",
  // Sidebar label is "Subscriber Communication" — disambiguates from the
  // Newsletter Notice global (which manages the on-page subscribe-form copy).
  // Slug stays "newsletters" so URLs and the existing nginx allowlist
  // entry don't move.
  labels: {
    singular: "Subscriber Communication",
    plural: "Subscriber Communication",
  },
  admin: {
    useAsTitle: "subject",
    description:
      "Compose and send broadcast emails to all active subscribers. See the panel above for instructions.",
    defaultColumns: ["subject", "status", "sentAt", "recipientCount"],
    listSearchableFields: ["subject"],
    components: {
      beforeListTable: ["@/components/NewslettersIntro"],
    },
  },
  defaultSort: "-createdAt",
  access: {
    create: isStaffOrAgent,
    update: isStaffOrAgent,
    delete: isStaffOrAgent,
    read: () => true,
  },
  fields: [
    {
      name: "subject",
      type: "text",
      required: true,
      maxLength: 200,
      admin: {
        description: "Email subject line. Keep under 60 chars for inbox preview.",
      },
    },
    {
      name: "preheader",
      type: "text",
      maxLength: 150,
      admin: {
        description: "Short preview text shown next to subject in inboxes (optional).",
      },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      admin: {
        description: "The email body. Will be sent as both HTML and plain-text.",
      },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Ready to send (next save will dispatch)", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
      admin: {
        position: "sidebar",
        description:
          'Set to "Ready to send" and save to dispatch. After dispatch, this becomes "Sent" automatically.',
      },
    },
    {
      name: "sentAt",
      type: "date",
      admin: {
        readOnly: true,
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "recipientCount",
      type: "number",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "lastError",
      type: "text",
      admin: {
        readOnly: true,
        condition: (data) => data?.status === "failed",
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // Only act when status transitions FROM not-sending TO "sending".
        if (data.status !== "sending") return data;
        if (originalDoc?.status === "sending" || originalDoc?.status === "sent") return data;

        const fromName = process.env.SMTP_FROM_NAME || "Essential Bali";
        const fromAddress = process.env.SMTP_FROM_ADDRESS || "noreply@gaiada.com";

        try {
          // Pull active subscribers
          const subs = await req.payload.find({
            collection: "subscribers",
            where: { status: { equals: "active" } },
            limit: 5000,
            depth: 0,
            pagination: false,
          });
          const recipients = (subs.docs as any[]).map((s) => s.email).filter(Boolean);
          if (!recipients.length) {
            data.status = "failed";
            data.lastError = "No active subscribers.";
            data.sentAt = new Date().toISOString();
            data.recipientCount = 0;
            return data;
          }

          // Render rich text body to HTML (best-effort)
          const html = lexicalToHtml(data.body);
          const text = html
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const fullHtml = `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:1.5rem;line-height:1.55;color:#222">${
            data.preheader ? `<div style="display:none;visibility:hidden;height:0;width:0;overflow:hidden">${data.preheader}</div>` : ""
          }${html}<hr style="margin-top:2rem;border:none;border-top:1px solid #eee"><p style="font-size:11px;color:#888">You're receiving this because you subscribed to Essential Bali.</p></body></html>`;

          await req.payload.sendEmail({
            from: `"${fromName}" <${fromAddress}>`,
            to: fromAddress,
            bcc: recipients,
            subject: data.subject,
            html: fullHtml,
            text,
          });

          data.status = "sent";
          data.sentAt = new Date().toISOString();
          data.recipientCount = recipients.length;
          data.lastError = null;
          req.payload.logger.info(
            `[newsletter] sent "${data.subject}" to ${recipients.length} subscribers`,
          );
        } catch (err: any) {
          data.status = "failed";
          data.lastError = String(err?.message || err);
          req.payload.logger.error(`[newsletter] send failed: ${data.lastError}`);
        }
        return data;
      },
    ],
  },
};

/** Walk a Lexical body tree and produce minimal HTML. */
function lexicalToHtml(body: any): string {
  if (!body || !body.root) return "";
  const lines: string[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (n.type === "paragraph" && Array.isArray(n.children)) {
      lines.push(`<p>${n.children.map((c: any) => textNode(c)).join("")}</p>`);
      return;
    }
    if (n.type === "heading" && Array.isArray(n.children)) {
      const tag = n.tag || "h2";
      lines.push(`<${tag}>${n.children.map((c: any) => textNode(c)).join("")}</${tag}>`);
      return;
    }
    if (n.type === "list" && Array.isArray(n.children)) {
      const t = n.listType === "number" ? "ol" : "ul";
      lines.push(`<${t}>${n.children.map((c: any) => `<li>${(c.children || []).map(textNode).join("")}</li>`).join("")}</${t}>`);
      return;
    }
    if (Array.isArray(n.children)) n.children.forEach(walk);
  };
  walk(body.root);
  return lines.join("\n");
}

function textNode(c: any): string {
  if (!c) return "";
  if (c.type === "link" && Array.isArray(c.children)) {
    const url = c.fields?.url || c.url || "#";
    return `<a href="${escapeHtml(url)}">${c.children.map(textNode).join("")}</a>`;
  }
  if (typeof c.text === "string") {
    let t = escapeHtml(c.text);
    if (c.format & 1) t = `<strong>${t}</strong>`;
    if (c.format & 2) t = `<em>${t}</em>`;
    return t;
  }
  if (Array.isArray(c.children)) return c.children.map(textNode).join("");
  return "";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
