import React from "react";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Renders ABOVE the Newsletters list. Quick stats + clear call-to-action.
 * Theme-aware via Payload CSS variables.
 */
export default async function NewslettersIntro() {
  const payload = await getPayload({ config });

  const [subsRes, sentRes] = await Promise.all([
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
  ]);

  const activeCount = subsRes.totalDocs ?? 0;
  const sentCount = sentRes.totalDocs ?? 0;
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
