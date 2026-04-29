"use client";
/**
 * ImagerGallery — read-only grid of the 24 most recent imager-generated
 * media docs. Lives next to MediaUploadDock in /admin/elliot.
 *
 * Fetches:
 *   GET /api/media?where[source][equals]=imager
 *      &limit=24&sort=-createdAt&depth=0
 * (Read access is open on the Media collection — no auth header needed
 * for the GET, but the page itself is gated by Payload admin.)
 *
 * Click a tile → modal preview with the full image, alt, prompt
 * (if any), filename, and a Copy URL button. ESC or backdrop closes.
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

const PAGE_SIZE = 24;

export default function ImagerGallery() {
  const [docs, setDocs] = useState<MediaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<MediaDoc | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    const url =
      `/api/media?where[source][equals]=imager` +
      `&limit=${PAGE_SIZE}&sort=-createdAt&depth=0`;
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const list = Array.isArray(j?.docs) ? j.docs : [];
        setDocs(list);
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  // ESC to close modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return (
    <section style={shell} aria-label="Imager Gallery">
      <header style={head}>
        <div style={title}>Imager gallery</div>
        <div style={sub}>
          24 most recent AI-generated media (source = imager) · click a
          tile to preview + copy URL
        </div>
      </header>

      <div style={toolbar}>
        <button type="button" style={refreshBtn} onClick={refresh} title="Reload">
          ↻ refresh
        </button>
        <div style={{ fontSize: "0.74rem", opacity: 0.7 }}>
          {loading
            ? "loading…"
            : err
              ? `error: ${err}`
              : `${docs.length} item${docs.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {!loading && !err && docs.length === 0 && (
        <div style={empty}>
          No Imager output yet. Trigger a hero generation from an article
          (the 🔁 button) or via Elliot's <code>generate-hero</code> skill;
          once it lands the tile shows up here.
        </div>
      )}

      <div style={grid}>
        {docs.map((d) => {
          const thumb = d.sizes?.thumbnail?.url || d.sizes?.card?.url || d.url || "";
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
                <img src={thumb} alt={d.alt || ""} style={tileImg} loading="lazy" />
              ) : (
                <div style={tilePlaceholder}>(no thumb)</div>
              )}
              <div style={tileLabel}>
                <div style={tileName}>{shortName(d.filename || "—")}</div>
                {d.kind && <div style={tileMeta}>{tagLabel(d)}</div>}
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <Modal doc={open} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}

function tagLabel(d: MediaDoc): string {
  const parts: string[] = [];
  if (d.kind) parts.push(d.kind);
  if (d.area) parts.push(d.area);
  if (d.topic) parts.push(d.topic);
  return parts.join(" · ");
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
              {tagLabel(doc) || "(no tags)"}
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
const refreshBtn: React.CSSProperties = {
  fontSize: "0.74rem",
  padding: "0.25rem 0.6rem",
  borderRadius: "0.3rem",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
const empty: React.CSSProperties = {
  padding: "1rem",
  fontSize: "0.78rem",
  opacity: 0.7,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: "0.4rem",
  lineHeight: 1.55,
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "0.6rem",
};
const tile: React.CSSProperties = {
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.4rem",
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
  height: "84px",
  objectFit: "cover",
  display: "block",
};
const tilePlaceholder: React.CSSProperties = {
  width: "100%",
  height: "84px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  opacity: 0.5,
};
const tileLabel: React.CSSProperties = { padding: "0.4rem 0.55rem 0.5rem", fontSize: "0.72rem" };
const tileName: React.CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const tileMeta: React.CSSProperties = {
  marginTop: "0.2rem",
  fontSize: "0.66rem",
  opacity: 0.65,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
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
