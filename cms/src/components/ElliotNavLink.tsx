import React from "react";
import Link from "next/link";

/**
 * Sidebar entry rendered after the Collections list.
 *
 * Holds only the AI-agent group. Hero Ads is no longer here — it lives
 * under Collections (where it belongs) and its list view is the
 * 8×8 visual grid.
 */
export default function SidebarNavLinks() {
  return (
    <div style={wrap}>
      <div style={section}>AI agent</div>
      <Link href="/admin/elliot" style={link}>
        <span
          style={{ ...dot, background: "var(--theme-success-500, #16a34a)" }}
          aria-hidden
        />
        Talk to Elliot
      </Link>
    </div>
  );
}

const wrap: React.CSSProperties = { marginTop: "1rem", padding: "0 1.25rem" };
const section: React.CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.55,
  marginBottom: "0.5rem",
};
const link: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.55rem",
  padding: "0.5rem 0.75rem",
  borderRadius: "var(--style-radius-s, 4px)",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  textDecoration: "none",
  fontSize: "0.85rem",
  fontWeight: 500,
  border: "1px solid var(--theme-elevation-150)",
  marginBottom: "0.4rem",
};
const dot: React.CSSProperties = {
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
};
