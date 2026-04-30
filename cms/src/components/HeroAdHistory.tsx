"use client";

/**
 * "History" panel on the hero-ads edit page. Renders a timeline of
 * every snapshot from the `hero-ad-versions` collection for the
 * current slot.
 *
 * Wired via HeroAds.admin.components.edit.beforeDocumentControls.
 *
 * On the create form (no slot id), renders nothing.
 */
import React, { useEffect, useState } from "react";

type Version = {
  id: number | string;
  event: "create" | "update" | "delete";
  changedAt: string;
  label?: string;
  changedBy?: { id: number; email?: string; name?: string } | number | null;
  snapshot?: {
    active?: boolean;
    client?: string | null;
    headline?: string | null;
    subline?: string | null;
    ctaActive?: boolean;
    ctaText?: string | null;
    ctaUrl?: string | null;
    creative?:
      | { id: number; sizes?: { thumbnail?: { url?: string } }; url?: string }
      | number
      | null;
  };
};

function getHeroDocId(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(
    /\/admin\/collections\/hero-ads\/([^/]+)/,
  );
  if (!m) return null;
  const id = m[1];
  if (id === "create") return null;
  return id;
}

const HeroAdHistory: React.FC = () => {
  const [docId, setDocId] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDocId(getHeroDocId());
  }, []);

  useEffect(() => {
    if (!docId || !open) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/hero-ad-versions?where[slot][equals]=${docId}` +
            `&sort=-changedAt&limit=50&depth=1`,
          { credentials: "include" },
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (!cancelled) setVersions(Array.isArray(j?.docs) ? j.docs : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "load failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docId, open]);

  if (!docId) return null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const eventColor = (e: Version["event"]) =>
    e === "create" ? "#16a34a" : e === "delete" ? "#dc2626" : "#0ea5e9";

  return (
    <div style={wrap}>
      <div style={head}>
        <div>
          <strong style={{ fontSize: "0.85rem" }}>History</strong>
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", opacity: 0.7 }}>
            audit trail of every change to this slot (append-only)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={toggleBtn}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <>
          {error && <div style={errBar}>{error}</div>}
          {!versions && !error && (
            <div style={{ padding: "0.7rem", opacity: 0.6, fontSize: "0.8rem" }}>
              Loading…
            </div>
          )}
          {versions && versions.length === 0 && (
            <div style={{ padding: "0.7rem", opacity: 0.6, fontSize: "0.8rem" }}>
              No history yet — the next save will be the first entry.
            </div>
          )}
          {versions && versions.length > 0 && (
            <div style={listWrap}>
              {versions.map((v) => {
                const who =
                  typeof v.changedBy === "object" && v.changedBy
                    ? v.changedBy.email || v.changedBy.name || `user#${v.changedBy.id}`
                    : v.changedBy
                      ? `user#${v.changedBy}`
                      : "system";
                const snap = v.snapshot || {};
                const thumb =
                  typeof snap.creative === "object" && snap.creative
                    ? snap.creative.sizes?.thumbnail?.url ||
                      (snap.creative as any).url
                    : null;
                return (
                  <div key={String(v.id)} style={row}>
                    <div style={{ ...eventBadge, background: eventColor(v.event) }}>
                      {v.event}
                    </div>
                    <div style={rowBody}>
                      <div style={rowHead}>
                        <span style={rowTime}>{fmt(v.changedAt)}</span>
                        <span style={rowWho}>{who}</span>
                      </div>
                      <div style={rowFields}>
                        <span
                          style={{
                            ...pill,
                            background: snap.active
                              ? "rgba(22,163,74,0.15)"
                              : "rgba(115,115,115,0.15)",
                            color: snap.active ? "#16a34a" : "#737373",
                          }}
                        >
                          {snap.active ? "active" : "inactive"}
                        </span>
                        {snap.client && <span style={pill}>client: {snap.client}</span>}
                        {snap.headline && (
                          <span style={pill}>“{snap.headline.slice(0, 50)}”</span>
                        )}
                        {snap.ctaActive && snap.ctaText && (
                          <span style={pill}>CTA: {snap.ctaText}</span>
                        )}
                      </div>
                    </div>
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" style={thumbImg} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const wrap: React.CSSProperties = {
  margin: "0.5rem 0 1rem",
  padding: "0.7rem 0.9rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
};
const head: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.7rem",
  color: "var(--theme-text)",
};
const toggleBtn: React.CSSProperties = {
  padding: "0.3rem 0.7rem",
  borderRadius: "6px",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-150)",
  fontSize: "0.78rem",
  cursor: "pointer",
};
const errBar: React.CSSProperties = {
  marginTop: "0.5rem",
  padding: "0.5rem 0.8rem",
  background: "rgba(220,38,38,0.12)",
  border: "1px solid rgba(220,38,38,0.4)",
  color: "#dc2626",
  borderRadius: "6px",
  fontSize: "0.8rem",
};
const listWrap: React.CSSProperties = {
  marginTop: "0.6rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxHeight: "420px",
  overflowY: "auto",
};
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.7rem",
  padding: "0.6rem 0.7rem",
  background: "var(--theme-bg)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
};
const eventBadge: React.CSSProperties = {
  textTransform: "uppercase",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: "#fff",
  padding: "0.2rem 0.5rem",
  borderRadius: "4px",
  flexShrink: 0,
};
const rowBody: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};
const rowHead: React.CSSProperties = {
  display: "flex",
  gap: "0.7rem",
  fontSize: "0.78rem",
};
const rowTime: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--theme-text)",
};
const rowWho: React.CSSProperties = {
  opacity: 0.7,
};
const rowFields: React.CSSProperties = {
  display: "flex",
  gap: "0.3rem",
  flexWrap: "wrap",
};
const pill: React.CSSProperties = {
  fontSize: "0.7rem",
  padding: "0.15rem 0.5rem",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  borderRadius: "999px",
};
const thumbImg: React.CSSProperties = {
  width: "60px",
  height: "34px",
  objectFit: "cover",
  borderRadius: "4px",
  flexShrink: 0,
};

export default HeroAdHistory;
