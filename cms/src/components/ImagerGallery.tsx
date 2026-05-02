"use client";
/**
 * ImagerGallery — 8 topic lanes × 3 images each (= 24 total).
 *
 * Each lane has its own ↻ refresh button so an operator can refresh
 * just one slice without re-querying the other 7. There's a single
 * global ↻ refresh-all that re-fires every lane.
 *
 * Why per-lane: the previous flat "24 most recent imager media" query
 * was a firehose. With 19+ articles already published, the most-recent
 * tile was useless if you wanted to see, say, the latest Dine images.
 * Per-topic lanes turn the firehose into curation.
 *
 * Refresh-bug fix (F9): the previous version's ↻ button bumped a
 * `refreshTick` state that gated the useEffect dep array. That worked
 * for re-firing the fetch but the response could be served from
 * browser cache (Payload's GET /api/media has no Cache-Control). We
 * add a `?t=${Date.now()}` cache-buster to the URL on refresh so the
 * browser actually goes back to Payload.
 *
 * Each lane fetches:
 *   GET /api/media?where[source][equals]=imager
 *      &where[topic][equals]=<slug>
 *      &limit=3&sort=-createdAt&depth=0&t=<cache-buster>
 */
import React, { useCallback, useEffect, useRef, useState } from "react";

interface MediaDoc {
  id: number | string;
  alt?: string;
  filename?: string;
  url?: string;
  prompt?: string;
  source?: string;
  kind?: string;
  area?: string;
  topic?: string;
  createdAt?: string;
  sizes?: {
    thumbnail?: { url?: string };
    card?: { url?: string };
  };
}

interface Lane {
  slug: string;        // topic slug e.g. "dine"
  label: string;       // human label e.g. "Dine"
  emoji: string;       // small visual cue
}

const LANES: Lane[] = [
  { slug: "events",          label: "Events",            emoji: "🎫" },
  { slug: "news",            label: "News",              emoji: "📰" },
  { slug: "featured",        label: "Featured",          emoji: "⭐" },
  { slug: "dine",            label: "Dine",              emoji: "🍜" },
  { slug: "health-wellness", label: "Health & Wellness", emoji: "🧘" },
  { slug: "nightlife",       label: "Nightlife",         emoji: "🌙" },
  { slug: "activities",      label: "Activities",        emoji: "🏄" },
  { slug: "people-culture",  label: "People & Culture",  emoji: "🎭" },
];

const PER_LANE = 3;

interface LaneState {
  docs: MediaDoc[];
  loading: boolean;
  err: string | null;
  /** monotonic counter; bumped to force re-fetch */
  tick: number;
}

const initialLaneState = (): LaneState => ({
  docs: [],
  loading: true,
  err: null,
  tick: 0,
});

export default function ImagerGallery() {
  const [lanes, setLanes] = useState<Record<string, LaneState>>(() =>
    LANES.reduce(
      (acc, l) => ({ ...acc, [l.slug]: initialLaneState() }),
      {} as Record<string, LaneState>,
    ),
  );
  const [open, setOpen] = useState<MediaDoc | null>(null);

  // Fetch one lane's images. Called when its tick bumps.
  const fetchLane = useCallback(async (slug: string, bust: number) => {
    setLanes((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], loading: true, err: null },
    }));
    const url =
      `/api/media?where[source][equals]=imager` +
      `&where[topic][equals]=${slug}` +
      `&limit=${PER_LANE}&sort=-createdAt&depth=0` +
      `&t=${bust}`;
    try {
      const r = await fetch(url, { credentials: "include", cache: "no-store" });
      const j = await r.json();
      const docs: MediaDoc[] = Array.isArray(j?.docs) ? j.docs : [];
      setLanes((prev) => ({
        ...prev,
        [slug]: { docs, loading: false, err: null, tick: prev[slug].tick },
      }));
    } catch (e) {
      setLanes((prev) => ({
        ...prev,
        [slug]: {
          docs: prev[slug].docs,
          loading: false,
          err: (e as Error).message,
          tick: prev[slug].tick,
        },
      }));
    }
  }, []);

  // Initial load — fire all 8 lanes in parallel on mount.
  useEffect(() => {
    const bust = Date.now();
    LANES.forEach((l) => {
      void fetchLane(l.slug, bust);
    });
  }, [fetchLane]);

  // ESC closes modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const refreshLane = useCallback(
    (slug: string) => {
      void fetchLane(slug, Date.now());
    },
    [fetchLane],
  );

  const refreshAll = useCallback(() => {
    const bust = Date.now();
    LANES.forEach((l) => {
      void fetchLane(l.slug, bust);
    });
  }, [fetchLane]);

  const totalCount = Object.values(lanes).reduce(
    (sum, l) => sum + l.docs.length,
    0,
  );
  const anyLoading = Object.values(lanes).some((l) => l.loading);

  return (
    <section style={shell} aria-label="Imager Gallery">
      <header style={head}>
        <div style={title}>Imager gallery</div>
        <div style={sub}>
          AI-generated media organised by topic. Each lane shows the 3
          most recent <code>source = imager</code> images. Per-lane ↻
          refresh keeps load off the API.
        </div>
      </header>

      <div style={toolbar}>
        <button
          type="button"
          style={refreshAllBtn}
          onClick={refreshAll}
          disabled={anyLoading}
          title="Reload all 8 lanes"
        >
          ↻ refresh all
        </button>
        <div style={{ fontSize: "0.74rem", opacity: 0.7 }}>
          {anyLoading ? "loading…" : `${totalCount} image${totalCount === 1 ? "" : "s"}`}
        </div>
      </div>

      <div style={lanesWrap}>
        {LANES.map((lane) => {
          const state = lanes[lane.slug];
          return (
            <div key={lane.slug} style={laneBlock}>
              <div style={laneHeader}>
                <div style={laneTitle}>
                  <span style={laneEmoji}>{lane.emoji}</span>
                  {lane.label}
                  <span style={laneCount}>
                    {state.loading ? "…" : `${state.docs.length}/${PER_LANE}`}
                  </span>
                </div>
                <button
                  type="button"
                  style={laneRefreshBtn}
                  onClick={() => refreshLane(lane.slug)}
                  disabled={state.loading}
                  title={`Reload ${lane.label}`}
                  aria-label={`Reload ${lane.label}`}
                >
                  ↻
                </button>
              </div>

              {state.err && (
                <div style={laneErr}>error: {state.err}</div>
              )}

              {!state.err && state.docs.length === 0 && !state.loading && (
                <div style={laneEmpty}>
                  no imager output for {lane.label} yet
                </div>
              )}

              <div style={laneGrid}>
                {state.docs.map((d) => {
                  const thumb =
                    d.sizes?.thumbnail?.url || d.sizes?.card?.url || d.url || "";
                  return (
                    <button
                      key={d.id}
                      type="button"
                      style={tile}
                      onClick={() => setOpen(d)}
                      title={d.filename || d.alt}
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={d.alt || ""}
                          style={tileImg}
                          loading="lazy"
                        />
                      ) : (
                        <div style={tilePlaceholder}>(no thumb)</div>
                      )}
                      <div style={tileLabel}>
                        <div style={tileName}>
                          {shortName(d.filename || "—")}
                        </div>
                        {d.area && <div style={tileMeta}>{d.area}</div>}
                      </div>
                    </button>
                  );
                })}
                {/* Pad with empty slot placeholders so each lane stays 3-wide */}
                {!state.loading &&
                  state.docs.length > 0 &&
                  state.docs.length < PER_LANE &&
                  Array.from({ length: PER_LANE - state.docs.length }).map(
                    (_, i) => <div key={`pad-${i}`} style={tileEmpty} />,
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {open && <Modal doc={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function shortName(s: string, max = 38): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 3) + "…";
}

interface ModalProps {
  doc: MediaDoc;
  onClose: () => void;
}

function Modal({ doc, onClose }: ModalProps) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const fullUrl = doc.url || doc.sizes?.card?.url || "";
  const handleCopy = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div
      ref={wrap}
      style={backdrop}
      onClick={(e) => {
        if (e.target === wrap.current) onClose();
      }}
    >
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.7rem" }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, wordBreak: "break-all" }}>
              {doc.filename || `Media ${doc.id}`}
            </div>
            <div style={{ fontSize: "0.74rem", opacity: 0.7, marginTop: "0.25rem" }}>
              {[doc.kind, doc.area, doc.topic].filter(Boolean).join(" · ") || "(no tags)"}
            </div>
          </div>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">
            ×
          </button>
        </div>
        <div style={modalBody}>
          {fullUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fullUrl} alt={doc.alt || ""} style={modalImg} />
          ) : (
            <div style={tilePlaceholder}>(no image url)</div>
          )}
        </div>
        {doc.alt && (
          <div style={modalRow}>
            <div style={modalLabel}>alt</div>
            <div>{doc.alt}</div>
          </div>
        )}
        {doc.prompt && (
          <div style={modalRow}>
            <div style={modalLabel}>prompt</div>
            <div style={{ fontSize: "0.78rem", opacity: 0.85, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
              {doc.prompt}
            </div>
          </div>
        )}
        <div style={modalActions}>
          {fullUrl && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={modalLink}>
              open original
            </a>
          )}
          <button type="button" onClick={handleCopy} style={modalCopyBtn} disabled={!fullUrl}>
            {copied ? "copied!" : "copy URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────
const shell: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.6rem",
  padding: "1rem",
  background: "rgba(255,255,255,0.025)",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};
const head: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.2rem" };
const title: React.CSSProperties = { fontSize: "1rem", fontWeight: 600 };
const sub: React.CSSProperties = { fontSize: "0.74rem", opacity: 0.7, lineHeight: 1.45 };
const toolbar: React.CSSProperties = { display: "flex", gap: "0.6rem", alignItems: "center" };
const refreshAllBtn: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.7rem",
  borderRadius: "0.3rem",
  border: "1px solid rgba(110,180,255,0.5)",
  background: "rgba(110,180,255,0.15)",
  color: "inherit",
  cursor: "pointer",
};
const lanesWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
};
const laneBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
  padding: "0.55rem 0.65rem",
  borderRadius: "0.45rem",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.06)",
};
const laneHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.6rem",
};
const laneTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  fontSize: "0.86rem",
  fontWeight: 500,
};
const laneEmoji: React.CSSProperties = { fontSize: "0.95rem" };
const laneCount: React.CSSProperties = {
  fontSize: "0.7rem",
  opacity: 0.55,
  marginLeft: "0.3rem",
  fontVariantNumeric: "tabular-nums",
};
const laneRefreshBtn: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.18rem 0.55rem",
  borderRadius: "0.25rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  lineHeight: 1,
};
const laneErr: React.CSSProperties = {
  fontSize: "0.74rem",
  padding: "0.35rem 0.55rem",
  borderRadius: "0.3rem",
  background: "rgba(220,80,80,0.15)",
  border: "1px solid rgba(220,80,80,0.35)",
};
const laneEmpty: React.CSSProperties = {
  fontSize: "0.72rem",
  opacity: 0.55,
  fontStyle: "italic",
  padding: "0.25rem 0.1rem",
};
const laneGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.4rem",
};
const tile: React.CSSProperties = {
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.35rem",
  padding: 0,
  cursor: "pointer",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  color: "inherit",
};
const tileImg: React.CSSProperties = {
  width: "100%",
  height: "76px",
  objectFit: "cover",
  display: "block",
};
const tileEmpty: React.CSSProperties = {
  background: "rgba(0,0,0,0.05)",
  border: "1px dashed rgba(255,255,255,0.06)",
  borderRadius: "0.35rem",
};
const tilePlaceholder: React.CSSProperties = {
  width: "100%",
  height: "76px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.65rem",
  opacity: 0.5,
};
const tileLabel: React.CSSProperties = { padding: "0.3rem 0.45rem 0.4rem", fontSize: "0.66rem" };
const tileName: React.CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const tileMeta: React.CSSProperties = {
  marginTop: "0.15rem",
  fontSize: "0.62rem",
  opacity: 0.6,
};
const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1.5rem",
};
const modal: React.CSSProperties = {
  background: "rgb(20,22,26)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "0.6rem",
  padding: "1rem",
  maxWidth: "min(900px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};
const closeBtn: React.CSSProperties = {
  fontSize: "1.4rem",
  lineHeight: 1,
  padding: "0.1rem 0.5rem",
  borderRadius: "0.3rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
const modalBody: React.CSSProperties = { display: "flex", justifyContent: "center" };
const modalImg: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "60vh",
  objectFit: "contain",
  borderRadius: "0.3rem",
};
const modalRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "70px 1fr",
  gap: "0.6rem",
  fontSize: "0.82rem",
};
const modalLabel: React.CSSProperties = { fontSize: "0.72rem", opacity: 0.6, paddingTop: "0.15rem" };
const modalActions: React.CSSProperties = {
  display: "flex",
  gap: "0.6rem",
  alignItems: "center",
  paddingTop: "0.3rem",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};
const modalLink: React.CSSProperties = {
  fontSize: "0.78rem",
  textDecoration: "underline",
  color: "inherit",
  opacity: 0.85,
};
const modalCopyBtn: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.7rem",
  borderRadius: "0.3rem",
  border: "1px solid rgba(110,180,255,0.5)",
  background: "rgba(110,180,255,0.15)",
  color: "inherit",
  cursor: "pointer",
};
