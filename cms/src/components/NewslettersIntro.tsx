import React from "react";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Renders ABOVE the Newsletters list. Quick stats + clear call-to-action +
 * status-quick-filter chips so editors can land directly on past sends or
 * failures without going through the Filters dropdown.
 * Theme-aware via Payload CSS variables.
 */
export default async function NewslettersIntro() {
  const payload = await getPayload({ config });

  const [subsRes, sentRes, draftRes, sendingRes, failedRes, allRes] =
    await Promise.all([
      payload.find({
        collection: "subscribers",
        where: { status: { equals: "active" } },
        limit: 1,
        depth: 0,
      }),
      payload.find({
        collection: "newsletters",
        where: { status: { equals: "sent" } },
        limit: 5,
        depth: 0,
        sort: "-sentAt",
      }),
      payload.find({
        collection: "newsletters",
        where: { status: { equals: "draft" } },
        limit: 1,
        depth: 0,
      }),
      payload.find({
        collection: "newsletters",
        where: { status: { equals: "sending" } },
        limit: 1,
        depth: 0,
      }),
      payload.find({
        collection: "newsletters",
        where: { status: { equals: "failed" } },
        limit: 1,
        depth: 0,
      }),
      payload.find({ collection: "newsletters", limit: 1, depth: 0 }),
    ]);

  const activeCount = subsRes.totalDocs ?? 0;
  const sentCount = sentRes.totalDocs ?? 0;
  const draftCount = draftRes.totalDocs ?? 0;
  const sendingCount = sendingRes.totalDocs ?? 0;
  const failedCount = failedRes.totalDocs ?? 0;
  const allCount = allRes.totalDocs ?? 0;
  const lastSent = (sentRes.docs as any[])[0]?.sentAt;
  const lastSentLabel = lastSent
    ? new Date(lastSent).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "never";

  return (
    <div style={wrap}>
      <div style={topRow}>
        <div>
          <h2 style={title}>Newsletter broadcasts</h2>
          <p style={sub}>
            Each entry is one email broadcast. Use the{" "}
            <b style={{ color: "var(--theme-text)" }}>Create New</b> button (top
            right) to compose, then set Status to{" "}
            <b style={{ color: "var(--theme-text)" }}>“Ready to send”</b> and
            save — it dispatches via SMTP to all{" "}
            <b style={{ color: "var(--theme-text)" }}>{activeCount}</b> active
            subscriber{activeCount === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <div style={statsRow}>
        <div style={stat}>
          <div style={statValue}>{activeCount}</div>
          <div style={statLabel}>Active subscribers</div>
        </div>
        <div style={stat}>
          <div style={statValue}>{sentCount}</div>
          <div style={statLabel}>Newsletters sent</div>
        </div>
        <div style={stat}>
          <div style={statValue} title={lastSent}>
            {lastSentLabel}
          </div>
          <div style={statLabel}>Last sent</div>
        </div>
      </div>

      {/* Quick-filter chips. Each chip prepends a where[status][equals]
          query param to the standard list URL — Payload reads it and
          filters server-side. The "All" chip clears the filter.
          Counts shown next to each label so editors know whether
          there's anything to look at before clicking. */}
      <div style={chipRow}>
        <span style={chipLabel}>Filter:</span>
        <Link href="/admin/collections/newsletters" style={chip}>
          All <span style={chipCount}>({allCount})</span>
        </Link>
        <Link
          href="/admin/collections/newsletters?where[status][equals]=draft"
          style={{
            ...chip,
            opacity: draftCount === 0 ? 0.55 : 1,
            background: "var(--theme-elevation-100)",
          }}
        >
          Drafts <span style={chipCount}>({draftCount})</span>
        </Link>
        <Link
          href="/admin/collections/newsletters?where[status][equals]=sending"
          style={{
            ...chip,
            opacity: sendingCount === 0 ? 0.55 : 1,
            background: "rgba(14,165,233,0.15)",
            color: "#0ea5e9",
            border: "1px solid rgba(14,165,233,0.4)",
          }}
        >
          In flight <span style={chipCount}>({sendingCount})</span>
        </Link>
        <Link
          href="/admin/collections/newsletters?where[status][equals]=sent"
          style={{
            ...chip,
            opacity: sentCount === 0 ? 0.55 : 1,
            background: "rgba(22,163,74,0.15)",
            color: "#16a34a",
            border: "1px solid rgba(22,163,74,0.4)",
          }}
        >
          Sent <span style={chipCount}>({sentCount})</span>
        </Link>
        <Link
          href="/admin/collections/newsletters?where[status][equals]=failed"
          style={{
            ...chip,
            opacity: failedCount === 0 ? 0.55 : 1,
            background: "rgba(220,38,38,0.15)",
            color: "#dc2626",
            border: "1px solid rgba(220,38,38,0.4)",
          }}
        >
          Failed <span style={chipCount}>({failedCount})</span>
        </Link>
      </div>

      <details style={howto}>
        <summary style={howtoSummary}>How to send a newsletter →</summary>
        <ol style={howtoList}>
          <li>Click <b>Create New</b> in the top right.</li>
          <li>
            Fill in <b>Subject</b> and <b>Body</b>. Optionally a <b>Preheader</b> (preview text).
          </li>
          <li>
            In the right sidebar, change <b>Status</b> from{" "}
            <code>Draft</code> to <code>Ready to send (next save will dispatch)</code>.
          </li>
          <li>Click <b>Save</b>. The system sends to all active subscribers via BCC.</li>
          <li>
            Status auto-updates to <code>Sent</code> with <code>recipientCount</code> and{" "}
            <code>sentAt</code>. Failures land in <code>Failed</code> with the SMTP error.
          </li>
        </ol>
      </details>
    </div>
  );
}

const wrap: React.CSSProperties = {
  margin: "1rem 0 1.25rem",
  padding: "1.1rem 1.4rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "var(--style-radius-s, 4px)",
  color: "var(--theme-text)",
};
const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
  flexWrap: "wrap",
};
const title: React.CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--theme-text)",
};
const sub: React.CSSProperties = {
  margin: "0.35rem 0 0",
  fontSize: "0.82rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.9,
  maxWidth: 540,
  lineHeight: 1.55,
};
const statsRow: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  marginTop: "1.1rem",
  paddingTop: "0.9rem",
  borderTop: "1px solid var(--theme-elevation-150)",
  flexWrap: "wrap",
};
const stat: React.CSSProperties = {
  minWidth: 120,
};
const statValue: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "var(--theme-text)",
  lineHeight: 1.2,
};
const statLabel: React.CSSProperties = {
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.75,
  marginTop: "0.2rem",
};

const howto: React.CSSProperties = {
  marginTop: "1rem",
  paddingTop: "0.9rem",
  borderTop: "1px solid var(--theme-elevation-150)",
};
const howtoSummary: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 500,
  color: "var(--theme-elevation-500, var(--theme-text))",
  cursor: "pointer",
  outline: "none",
};
const howtoList: React.CSSProperties = {
  marginTop: "0.6rem",
  paddingLeft: "1.1rem",
  fontSize: "0.78rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  lineHeight: 1.7,
};

const chipRow: React.CSSProperties = {
  marginTop: "0.9rem",
  paddingTop: "0.8rem",
  borderTop: "1px solid var(--theme-elevation-150)",
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap",
  alignItems: "center",
};
const chipLabel: React.CSSProperties = {
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  opacity: 0.6,
  marginRight: "0.2rem",
};
const chip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.3rem 0.7rem",
  borderRadius: "999px",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  textDecoration: "none",
  fontSize: "0.78rem",
  fontWeight: 500,
  border: "1px solid var(--theme-elevation-150)",
  transition: "opacity 0.15s",
};
const chipCount: React.CSSProperties = {
  fontSize: "0.7rem",
  opacity: 0.7,
};
