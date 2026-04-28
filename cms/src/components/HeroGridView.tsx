"use client";

/**
 * /admin/hero-grid — 8×8 visual editor for the 64 fixed hero-ad slots.
 *
 * One cell per (area × topic). Click anywhere on the cell to toggle
 * active / inactive. Cell shows the client name + creative thumbnail
 * when populated, otherwise the "Ads space > {area} > {topic}" placeholder.
 *
 * Pure client component. Uses fetch() against the same-origin Payload
 * REST API. Auth is the Payload admin session cookie.
 */
import React, { useEffect, useState } from "react";

const AREAS_ORDER = [
  "canggu",
  "kuta",
  "ubud",
  "jimbaran",
  "denpasar",
  "kintamani",
  "singaraja",
  "nusa-penida",
];

const TOPICS_ORDER = [
  "events",
  "news",
  "featured",
  "dine",
  "health-wellness",
  "nightlife",
  "activities",
  "people-culture",
];

type Tax = { id: number | string; slug: string; name: string };

type Media = { id: number | string; url?: string | null; sizes?: Record<string, { url?: string | null }> };

type HeroAd = {
  id: number | string;
  area: Tax | number | string;
  topic: Tax | number | string;
  label?: string | null;
  active?: boolean;
  client?: string | null;
  creative?: Media | number | string | null;
  linkUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
};

const slugOf = (t: HeroAd["area"]): string =>
  typeof t === "object" && t !== null ? (t as Tax).slug : "";

const nameOf = (t: HeroAd["area"]): string =>
  typeof t === "object" && t !== null ? (t as Tax).name : "";

const creativeUrl = (c: HeroAd["creative"]): string | null => {
  if (!c || typeof c !== "object") return null;
  const m = c as Media;
  return m.sizes?.thumbnail?.url || m.url || null;
};

export default function HeroGridView() {
  const [docs, setDocs] = useState<HeroAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/hero-ads?limit=100&depth=1", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setDocs(data.docs || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cellMap = new Map<string, HeroAd>();
  for (const d of docs) {
    const k = `${slugOf(d.area)}:${slugOf(d.topic)}`;
    cellMap.set(k, d);
  }

  const toggle = async (cell: HeroAd) => {
    const id = String(cell.id);
    if (pending[id]) return;
    setPending((p) => ({ ...p, [id]: true }));
    const next = !cell.active;
    // optimistic
    setDocs((prev) =>
      prev.map((d) => (d.id === cell.id ? { ...d, active: next } : d)),
    );
    try {
      const res = await fetch(`/api/hero-ads/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) throw new Error(`PATCH ${res.status}`);
    } catch (e: any) {
      // revert
      setDocs((prev) =>
        prev.map((d) => (d.id === cell.id ? { ...d, active: !next } : d)),
      );
      setError(`Failed to toggle: ${e.message || "unknown"}`);
    } finally {
      setPending((p) => {
        const { [id]: _, ...rest } = p;
        return rest;
      });
    }
  };

  const activeCount = docs.filter((d) => d.active).length;

  // Pull a stable name per slug from the first row that has it.
  const areaName = (slug: string) =>
    nameOf(docs.find((d) => slugOf(d.area) === slug)?.area as Tax) ||
    slug.replace(/-/g, " ");
  const topicName = (slug: string) =>
    nameOf(docs.find((d) => slugOf(d.topic) === slug)?.topic as Tax) ||
    slug.replace(/-/g, " ");

  return (
    <div style={shell}>
      <a href="/admin" style={backLink}>
        ← Back to Payload admin
      </a>
      <header style={head}>
        <div>
          <div style={title}>Hero ad grid</div>
          <div style={sub}>
            8 areas × 8 topics = 64 fixed slots ·{" "}
            <strong>{activeCount}</strong> active · click any cell to flip
          </div>
        </div>
        <div style={legendRow}>
          <span style={{ ...legendChip, background: "#16a34a" }} /> active
          <span style={{ ...legendChip, background: "var(--theme-elevation-150)", marginLeft: "0.7rem" }} />{" "}
          inactive (placeholder)
        </div>
      </header>

      {error && <div style={errBar}>{error}</div>}

      {loading ? (
        <div style={{ padding: "1rem", opacity: 0.6 }}>Loading 64 cells…</div>
      ) : (
        <div style={gridWrap}>
          <div style={gridStyle}>
            {/* corner */}
            <div style={cornerCell}>area / topic</div>
            {/* top header — topics */}
            {TOPICS_ORDER.map((tslug) => (
              <div key={`th-${tslug}`} style={topHeader}>
                {topicName(tslug)}
              </div>
            ))}
            {/* rows */}
            {AREAS_ORDER.map((aslug) => (
              <React.Fragment key={`r-${aslug}`}>
                <div style={leftHeader}>{areaName(aslug)}</div>
                {TOPICS_ORDER.map((tslug) => {
                  const cell = cellMap.get(`${aslug}:${tslug}`);
                  if (!cell) {
                    return (
                      <div key={`c-${aslug}-${tslug}`} style={emptyCell}>
                        — missing —
                      </div>
                    );
                  }
                  const isActive = !!cell.active;
                  const thumb = creativeUrl(cell.creative);
                  const isPending = !!pending[String(cell.id)];
                  return (
                    <button
                      key={`c-${aslug}-${tslug}`}
                      type="button"
                      onClick={() => toggle(cell)}
                      disabled={isPending}
                      style={{
                        ...cellStyle,
                        background: isActive
                          ? "rgba(22,163,74,0.18)"
                          : "var(--theme-elevation-50)",
                        borderColor: isActive
                          ? "rgba(22,163,74,0.55)"
                          : "var(--theme-elevation-150)",
                        opacity: isPending ? 0.5 : 1,
                      }}
                      title={
                        cell.label ||
                        `Ads space > ${areaName(aslug)} > ${topicName(tslug)}`
                      }
                    >
                      <div style={cellTop}>
                        <span
                          style={{
                            ...statusDot,
                            background: isActive ? "#16a34a" : "#9ca3af",
                          }}
                        />
                        <span style={cellState}>
                          {isActive ? "ACTIVE" : "Placeholder"}
                        </span>
                        <a
                          href={`/admin/collections/hero-ads/${cell.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={editLink}
                        >
                          edit
                        </a>
                      </div>
                      {cell.client ? (
                        <div style={cellClient}>{cell.client}</div>
                      ) : (
                        <div style={cellClientMuted}>(no client)</div>
                      )}
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt=""
                          style={{
                            width: "100%",
                            height: "44px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            marginTop: "0.3rem",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── styles (theme-token aware so dark / light admin both look right) ────

const shell: React.CSSProperties = {
  padding: "1.4rem 1.6rem",
  maxWidth: "1500px",
  margin: "0 auto",
  color: "var(--theme-text)",
};

const backLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.78rem",
  color: "var(--theme-text)",
  textDecoration: "none",
  opacity: 0.75,
  marginBottom: "0.7rem",
  padding: "0.35rem 0.7rem",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
  background: "var(--theme-elevation-50)",
  width: "fit-content",
};

const head: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "1.2rem",
  padding: "1rem 1.1rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "10px",
};

const title: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 600 };
const sub: React.CSSProperties = { fontSize: "0.85rem", opacity: 0.7, marginTop: "0.3rem" };

const legendRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "0.78rem",
  opacity: 0.75,
};
const legendChip: React.CSSProperties = {
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "999px",
  marginRight: "0.35rem",
  border: "1px solid var(--theme-elevation-150)",
};

const errBar: React.CSSProperties = {
  background: "rgba(220,38,38,0.15)",
  color: "#dc2626",
  border: "1px solid rgba(220,38,38,0.4)",
  padding: "0.6rem 0.9rem",
  borderRadius: "6px",
  marginBottom: "0.8rem",
  fontSize: "0.85rem",
};

const gridWrap: React.CSSProperties = {
  overflowX: "auto",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1fr) repeat(8, minmax(110px, 1fr))",
  gap: "0.4rem",
  minWidth: "1100px",
};

const cornerCell: React.CSSProperties = {
  fontSize: "0.7rem",
  opacity: 0.5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "0.5rem",
  alignSelf: "end",
};

const topHeader: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  textAlign: "center",
  padding: "0.5rem 0.3rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
};

const leftHeader: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  padding: "0.5rem 0.6rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
};

const cellStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  padding: "0.45rem 0.55rem",
  border: "1px solid",
  borderRadius: "6px",
  cursor: "pointer",
  fontFamily: "inherit",
  color: "var(--theme-text)",
  minHeight: "78px",
  fontSize: "0.78rem",
};

const emptyCell: React.CSSProperties = {
  ...cellStyle,
  cursor: "default",
  opacity: 0.4,
  textAlign: "center",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
};

const cellTop: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  fontSize: "0.7rem",
};

const statusDot: React.CSSProperties = {
  display: "inline-block",
  width: "8px",
  height: "8px",
  borderRadius: "999px",
};

const cellState: React.CSSProperties = {
  textTransform: "uppercase",
  fontWeight: 600,
  letterSpacing: "0.04em",
  flex: 1,
};

const editLink: React.CSSProperties = {
  fontSize: "0.65rem",
  textDecoration: "underline",
  opacity: 0.7,
  color: "var(--theme-text)",
};

const cellClient: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  marginTop: "0.25rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const cellClientMuted: React.CSSProperties = {
  fontSize: "0.72rem",
  opacity: 0.5,
  marginTop: "0.25rem",
  fontStyle: "italic",
};
