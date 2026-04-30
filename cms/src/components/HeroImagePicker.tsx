"use client";

/**
 * "Browse Imager Gallery" — opens a modal showing imager-generated
 * media tiles. Click a tile to assign it as the current article's
 * hero image.
 *
 * Lives on the article edit page (`admin.components.edit.beforeDocumentControls`
 * on Articles), alongside the existing RegenerateHeroButton.
 *
 * Why an extra picker on top of Payload's built-in media picker:
 *   the built-in picker shows ALL media (including hero ad creatives,
 *   user uploads, GCS-imported assets). Editors regularly have to
 *   page through dozens of irrelevant items to find the imager-
 *   generated heroes that actually fit. This filtered picker shows
 *   only `source=imager, kind=hero` and adds an at-a-glance area+
 *   topic context per tile so editors pick the right image fast.
 *
 * Endpoints:
 *   GET  /api/media?where[source][equals]=imager
 *        &where[kind][equals]=hero
 *        &limit=120&sort=-createdAt&depth=0
 *   PATCH /api/articles/{id}  body { hero: <mediaId> }
 */
import React, { useEffect, useState } from "react";

type MediaDoc = {
  id: number | string;
  alt?: string;
  filename?: string;
  url?: string;
  prompt?: string;
  area?: string;
  topic?: string;
  createdAt?: string;
  sizes?: {
    thumbnail?: { url?: string };
    card?: { url?: string };
  };
};

function getArticleDocId(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.pathname.match(
    /\/admin\/collections\/articles\/([^/]+)/,
  );
  if (!m) return null;
  const id = m[1];
  if (id === "create") return null;
  return id;
}

const HeroImagePicker: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<MediaDoc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [articleDocId, setArticleDocId] = useState<string | null>(null);

  useEffect(() => {
    setArticleDocId(getArticleDocId());
  }, []);

  // Hide on the create form (no article exists yet to attach to)
  if (!articleDocId) return null;

  const loadGallery = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        "/api/media?where[source][equals]=imager" +
        "&where[kind][equals]=hero" +
        "&limit=120&sort=-createdAt&depth=0";
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setDocs(Array.isArray(j?.docs) ? j.docs : []);
    } catch (e: any) {
      setError(e?.message || "load failed");
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => {
    setOpen(true);
    if (!docs) void loadGallery();
  };

  const closePicker = () => {
    setOpen(false);
    setError(null);
  };

  const pickAndAssign = async (media: MediaDoc) => {
    if (!articleDocId) return;
    setPendingId(media.id);
    setError(null);
    try {
      const r = await fetch(`/api/articles/${articleDocId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: media.id }),
      });
      if (!r.ok) throw new Error(`PATCH ${r.status}`);
      // Reload so the article edit form rebinds the new hero.
      if (typeof window !== "undefined") window.location.reload();
    } catch (e: any) {
      setError(e?.message || "assign failed");
    } finally {
      setPendingId(null);
    }
  };

  const tileSrc = (m: MediaDoc): string | null =>
    m.sizes?.card?.url || m.sizes?.thumbnail?.url || m.url || null;

  return (
    <>
      <div style={btnRow}>
        <button type="button" onClick={openPicker} style={btn}>
          🖼  Browse Imager Gallery
        </button>
      </div>

      {open && (
        <div
          style={overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePicker();
          }}
        >
          <div style={modal}>
            <div style={modalHeader}>
              <div>
                <div style={modalTitle}>Pick a hero from the Imager gallery</div>
                <div style={modalSub}>
                  Click any tile to set it as this article's hero image.
                  Imager-generated heroes only — sorted newest first.
                </div>
              </div>
              <button type="button" onClick={closePicker} style={closeBtn}>
                ×
              </button>
            </div>

            {error && <div style={errBar}>{error}</div>}

            {loading && (
              <div style={{ padding: "2rem", textAlign: "center", opacity: 0.7 }}>
                Loading…
              </div>
            )}

            {!loading && docs && docs.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", opacity: 0.7 }}>
                No Imager-generated heroes yet. Run an Elliot dispatch to
                produce some.
              </div>
            )}

            {!loading && docs && docs.length > 0 && (
              <div style={grid}>
                {docs.map((m) => {
                  const src = tileSrc(m);
                  const busy = pendingId === m.id;
                  return (
                    <button
                      key={String(m.id)}
                      type="button"
                      onClick={() => pickAndAssign(m)}
                      disabled={!!pendingId}
                      style={{ ...tile, opacity: busy ? 0.5 : 1 }}
                      title={m.prompt || m.alt || m.filename}
                    >
                      <div style={tileImgWrap}>
                        {src && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={src} alt={m.alt || ""} style={tileImg} />
                        )}
                      </div>
                      <div style={tileMeta}>
                        <span style={tileMetaArea}>
                          {m.area || "—"}
                        </span>
                        <span style={tileMetaTopic}>{m.topic || ""}</span>
                      </div>
                      <div style={tileAlt}>
                        {(m.alt || m.filename || "").slice(0, 50)}
                      </div>
                      {busy && <div style={tileBusy}>assigning…</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const btnRow: React.CSSProperties = {
  margin: "0.4rem 0 0.6rem",
};
const btn: React.CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: "6px",
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-150)",
  fontSize: "0.82rem",
  cursor: "pointer",
};
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "3vh 2vw",
  overflow: "auto",
};
const modal: React.CSSProperties = {
  background: "var(--theme-bg)",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "10px",
  width: "min(1200px, 95vw)",
  maxHeight: "94vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};
const modalHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "1rem 1.2rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
};
const modalTitle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
};
const modalSub: React.CSSProperties = {
  fontSize: "0.78rem",
  opacity: 0.7,
  marginTop: "0.2rem",
};
const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--theme-text)",
  fontSize: "1.6rem",
  lineHeight: 1,
  cursor: "pointer",
  padding: "0 0.5rem",
};
const errBar: React.CSSProperties = {
  margin: "0.7rem 1.2rem",
  padding: "0.55rem 0.85rem",
  background: "rgba(220,38,38,0.12)",
  border: "1px solid rgba(220,38,38,0.4)",
  color: "#dc2626",
  borderRadius: "6px",
  fontSize: "0.82rem",
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "0.7rem",
  padding: "1rem 1.2rem",
  overflowY: "auto",
};
const tile: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  textAlign: "left",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
  background: "var(--theme-elevation-50)",
  padding: "0.4rem",
  cursor: "pointer",
  overflow: "hidden",
  fontFamily: "inherit",
  color: "var(--theme-text)",
};
const tileImgWrap: React.CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  background: "var(--theme-elevation-100)",
  borderRadius: "5px",
  overflow: "hidden",
};
const tileImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const tileMeta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "0.4rem",
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const tileMetaArea: React.CSSProperties = {
  color: "var(--theme-text)",
  fontWeight: 600,
};
const tileMetaTopic: React.CSSProperties = {
  opacity: 0.7,
};
const tileAlt: React.CSSProperties = {
  marginTop: "0.2rem",
  fontSize: "0.7rem",
  opacity: 0.85,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const tileBusy: React.CSSProperties = {
  marginTop: "0.2rem",
  fontSize: "0.7rem",
  fontStyle: "italic",
  opacity: 0.85,
};

export default HeroImagePicker;
