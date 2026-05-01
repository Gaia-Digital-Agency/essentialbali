"use client";
/**
 * HomepageCurationView — manage which 20 articles fill the homepage.
 *
 * 5 groups × 4 slots each = 20 visible cards on the public homepage.
 * Each article carries a `group` enum value (or NULL = not on homepage).
 *
 * Operations:
 *   - View the 4 articles currently in each group.
 *   - Remove an article from a group  (PATCH article { group: null }).
 *   - Add an article to a group       (PATCH article { group: "<grp>" }).
 *     If the target group is already at 4, the oldest-by-published_at
 *     in that group gets bumped out (set to null) atomically.
 *   - 🎲 Refresh group        (POST /api/curation/refresh { group: "<grp>" })
 *   - 🎲 Refresh all          (POST /api/curation/refresh { group: "*" })
 *
 * Auth: piggybacks on Payload session cookie (this view lives under
 * /admin which is gated by Payload's middleware).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";

const GROUPS = [
  { value: "mostPopular",   label: "Most Popular",
    desc: "Editorial pick / above-the-fold." },
  { value: "trending",      label: "Trending",
    desc: "Timely, what's happening now." },
  { value: "ultimateGuide", label: "Ultimate Guide",
    desc: "Evergreen long-form depth pieces." },
  { value: "overseas",      label: "Overseas",
    desc: "Outside-Bali / regional spotlight." },
  { value: "spotlight",     label: "Spotlight",
    desc: "Single-feature standout, rotates." },
] as const;

type GroupSlug = (typeof GROUPS)[number]["value"];

interface Article {
  id: number | string;
  title: string;
  slug: string;
  group?: GroupSlug | null;
  publishedAt?: string;
  area?: { id: number; name?: string; slug?: string } | number | null;
  topic?: { id: number; name?: string; slug?: string } | number | null;
  hero?: { url?: string; sizes?: { thumbnail?: { url?: string } } } | number | null;
  status?: string;
}

const SLOTS_PER_GROUP = 4;

export default function HomepageCurationView() {
  const [byGroup, setByGroup] = useState<Record<GroupSlug, Article[]>>(
    () =>
      GROUPS.reduce(
        (acc, g) => ({ ...acc, [g.value]: [] }),
        {} as Record<GroupSlug, Article[]>,
      ),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [searchOpenFor, setSearchOpenFor] = useState<GroupSlug | null>(null);

  const reload = useCallback(async () => {
    setErr(null);
    try {
      // One fetch per group — keeps the URL tidy (Payload's `where[][]` doesn't
      // play nicely with OR-of-equals) and the cardinality is 5 small queries.
      const next: Record<GroupSlug, Article[]> = {} as never;
      await Promise.all(
        GROUPS.map(async (g) => {
          const url =
            `/api/articles?where[group][equals]=${g.value}` +
            `&sort=-publishedAt&limit=${SLOTS_PER_GROUP}&depth=1`;
          const res = await fetch(url, { credentials: "include" });
          const j = await res.json();
          next[g.value] = Array.isArray(j?.docs) ? j.docs : [];
        }),
      );
      setByGroup(next);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, tick]);

  const removeFromGroup = async (articleId: Article["id"], group: GroupSlug) => {
    if (!confirm(`Remove this article from ${group}?`)) return;
    setBusy(`remove-${articleId}`);
    setErr(null);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group: null }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.errors?.[0]?.message || `HTTP ${res.status}`);
      }
      setTick((t) => t + 1);
    } catch (e) {
      setErr(`remove failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const refreshGroup = async (group: GroupSlug | "*") => {
    const label = group === "*" ? "all 20 slots" : group;
    if (!confirm(`Re-pick ${label} from the article pool? Current selection will be replaced.`))
      return;
    setBusy(`refresh-${group}`);
    setErr(null);
    try {
      const res = await fetch("/api/curation/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setTick((t) => t + 1);
    } catch (e) {
      setErr(`refresh failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const totalTagged = useMemo(
    () => Object.values(byGroup).reduce((sum, arr) => sum + arr.length, 0),
    [byGroup],
  );

  return (
    <section style={shell} aria-label="Homepage Curation">
      <header style={head}>
        <div style={title}>Homepage curation</div>
        <div style={sub}>
          The 20 articles tagged below — 5 groups × 4 each — fill the public
          homepage. Every other article in the site has <code>group = NULL</code>
          and lives only on its area-page and category-page.
        </div>
        <div style={metaRow}>
          <div style={metaPill}>
            <strong>{totalTagged}</strong> / 20 slots filled
          </div>
          <button
            type="button"
            onClick={() => refreshGroup("*")}
            disabled={busy !== null}
            style={primaryBtn}
            title="Random-pick a fresh 20 from the pool (4 per group)"
          >
            🎲 Refresh all 20
          </button>
          <button
            type="button"
            onClick={reload}
            disabled={busy !== null}
            style={ghostBtn}
            title="Reload from server"
          >
            ↻ Reload
          </button>
        </div>
        {err && <div style={errBar}>⚠ {err}</div>}
      </header>

      {GROUPS.map((g) => {
        const items = byGroup[g.value] || [];
        const empty = items.length === 0;
        const incomplete = items.length < SLOTS_PER_GROUP;
        return (
          <article key={g.value} style={groupBlock}>
            <div style={groupHead}>
              <div>
                <div style={groupTitle}>
                  {g.label}{" "}
                  <span style={{ opacity: 0.6, fontSize: "0.78rem", marginLeft: "0.4rem" }}>
                    {items.length} / {SLOTS_PER_GROUP}
                  </span>
                  {incomplete && (
                    <span style={warnBadge}>⚠ slot empty</span>
                  )}
                </div>
                <div style={groupDesc}>{g.desc}</div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => refreshGroup(g.value)}
                  disabled={busy !== null}
                  style={ghostBtn}
                  title="Random-pick 4 articles for this group from the pool"
                >
                  🎲 Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpenFor(g.value)}
                  disabled={busy !== null}
                  style={ghostBtn}
                  title="Search and add an article to this group"
                >
                  + Add
                </button>
              </div>
            </div>

            {empty ? (
              <div style={emptyBox}>
                No articles tagged. Use 🎲 Refresh to let Elliot pick 4, or
                + Add to pick by hand.
              </div>
            ) : (
              <ul style={cardList}>
                {items.map((a) => (
                  <li key={a.id} style={card}>
                    <div style={cardThumb}>
                      {typeof a.hero === "object" && (a.hero?.sizes?.thumbnail?.url || a.hero?.url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.hero.sizes?.thumbnail?.url || a.hero.url}
                          alt=""
                          style={cardImg}
                        />
                      ) : (
                        <div style={cardThumbPh}>(no hero)</div>
                      )}
                    </div>
                    <div style={cardBody}>
                      <div style={cardTitle}>{a.title || a.slug}</div>
                      <div style={cardMeta}>
                        {(typeof a.area === "object" && a.area?.name) || ""}
                        {a.area && a.topic ? " · " : ""}
                        {(typeof a.topic === "object" && a.topic?.name) || ""}
                        {a.status && ` · ${a.status}`}
                      </div>
                    </div>
                    <div style={cardActions}>
                      <a
                        href={`/admin/collections/articles/${a.id}`}
                        style={cardLink}
                        title="Open in Payload admin"
                      >
                        edit
                      </a>
                      <button
                        type="button"
                        onClick={() => removeFromGroup(a.id, g.value)}
                        disabled={busy !== null}
                        style={cardRemoveBtn}
                        title="Remove from this group (article keeps existing, just untagged)"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}

      {searchOpenFor && (
        <AddArticleModal
          group={searchOpenFor}
          onClose={() => setSearchOpenFor(null)}
          onAdded={() => {
            setSearchOpenFor(null);
            setTick((t) => t + 1);
          }}
        />
      )}
    </section>
  );
}

interface AddProps {
  group: GroupSlug;
  onClose: () => void;
  onAdded: () => void;
}

function AddArticleModal({ group, onClose, onAdded }: AddProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const where = q.trim()
          ? `&where[title][like]=${encodeURIComponent(q.trim())}`
          : "";
        // Exclude already-tagged articles (any group). The candidate pool
        // for a new homepage placement is articles that are unpinned today.
        const res = await fetch(
          `/api/articles?where[group][exists]=false${where}&limit=12&sort=-publishedAt&depth=1`,
          { credentials: "include" },
        );
        const j = await res.json();
        setResults(Array.isArray(j?.docs) ? j.docs : []);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const pick = async (a: Article) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/articles/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ group }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.errors?.[0]?.message || `HTTP ${res.status}`);
      }
      onAdded();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={modal}>
        <div style={modalHead}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Add to {group}
          </div>
          <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">
            ×
          </button>
        </div>
        <input
          type="text"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title… or leave empty for newest unpinned"
          style={searchInput}
        />
        {err && <div style={errBar}>⚠ {err}</div>}
        {loading && <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>searching…</div>}
        <ul style={resultsList}>
          {results.map((a) => (
            <li key={a.id} style={resultRow}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={cardTitle}>{a.title || a.slug}</div>
                <div style={cardMeta}>
                  {(typeof a.area === "object" && a.area?.name) || "—"}
                  {" · "}
                  {(typeof a.topic === "object" && a.topic?.name) || "—"}
                </div>
              </div>
              <button type="button" onClick={() => pick(a)} disabled={loading} style={ghostBtn}>
                pick
              </button>
            </li>
          ))}
          {!loading && results.length === 0 && (
            <li style={{ fontSize: "0.78rem", opacity: 0.7, padding: "0.6rem 0" }}>
              no matches (or no untagged articles)
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ── styles ───────────────────────────────────────────────────────────
const shell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.5rem",
  maxWidth: "1100px",
  margin: "0 auto",
};
const head: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.4rem" };
const title: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 600 };
const sub: React.CSSProperties = { fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.5, maxWidth: "55ch" };
const metaRow: React.CSSProperties = { display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.4rem" };
const metaPill: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.25rem 0.7rem",
  borderRadius: "0.3rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};
const errBar: React.CSSProperties = {
  marginTop: "0.4rem",
  padding: "0.45rem 0.7rem",
  borderRadius: "0.35rem",
  background: "rgba(220,80,80,0.18)",
  border: "1px solid rgba(220,80,80,0.4)",
  fontSize: "0.78rem",
};
const groupBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  padding: "0.95rem 1rem",
  borderRadius: "0.55rem",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.025)",
};
const groupHead: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.6rem",
};
const groupTitle: React.CSSProperties = { fontSize: "1rem", fontWeight: 600 };
const groupDesc: React.CSSProperties = { fontSize: "0.74rem", opacity: 0.7, marginTop: "0.15rem" };
const warnBadge: React.CSSProperties = {
  fontSize: "0.66rem",
  padding: "0.1rem 0.45rem",
  borderRadius: "0.25rem",
  background: "rgba(220,170,80,0.18)",
  border: "1px solid rgba(220,170,80,0.4)",
  marginLeft: "0.4rem",
  verticalAlign: "middle",
};
const emptyBox: React.CSSProperties = {
  fontSize: "0.78rem",
  opacity: 0.6,
  padding: "0.7rem 0.85rem",
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: "0.4rem",
  lineHeight: 1.5,
};
const cardList: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "0.6rem",
  listStyle: "none",
  padding: 0,
  margin: 0,
};
const card: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.4rem",
  overflow: "hidden",
};
const cardThumb: React.CSSProperties = { aspectRatio: "16 / 9", background: "rgba(255,255,255,0.04)" };
const cardImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const cardThumbPh: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  opacity: 0.4,
};
const cardBody: React.CSSProperties = { padding: "0.5rem 0.65rem", flex: 1 };
const cardTitle: React.CSSProperties = {
  fontSize: "0.84rem",
  fontWeight: 500,
  lineHeight: 1.35,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};
const cardMeta: React.CSSProperties = { fontSize: "0.7rem", opacity: 0.6, marginTop: "0.25rem" };
const cardActions: React.CSSProperties = {
  display: "flex",
  gap: "0.3rem",
  padding: "0.3rem 0.5rem",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  alignItems: "center",
};
const cardLink: React.CSSProperties = {
  fontSize: "0.72rem",
  textDecoration: "underline",
  color: "inherit",
  opacity: 0.85,
  flex: 1,
};
const cardRemoveBtn: React.CSSProperties = {
  fontSize: "0.95rem",
  padding: "0.05rem 0.55rem",
  borderRadius: "0.25rem",
  border: "1px solid rgba(220,80,80,0.45)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  fontSize: "0.82rem",
  padding: "0.4rem 0.85rem",
  borderRadius: "0.35rem",
  border: "1px solid rgba(110,180,255,0.5)",
  background: "rgba(110,180,255,0.18)",
  color: "inherit",
  cursor: "pointer",
  fontWeight: 500,
};
const ghostBtn: React.CSSProperties = {
  fontSize: "0.78rem",
  padding: "0.3rem 0.65rem",
  borderRadius: "0.3rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const backdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "8vh",
  zIndex: 1000,
};
const modal: React.CSSProperties = {
  background: "rgb(20,22,26)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "0.6rem",
  padding: "1rem",
  width: "min(640px, 92%)",
  maxHeight: "80vh",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};
const modalHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtn: React.CSSProperties = {
  fontSize: "1.2rem",
  lineHeight: 1,
  padding: "0.1rem 0.5rem",
  borderRadius: "0.25rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
const searchInput: React.CSSProperties = {
  padding: "0.5rem 0.7rem",
  borderRadius: "0.35rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  fontSize: "0.85rem",
};
const resultsList: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};
const resultRow: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  padding: "0.4rem 0.5rem",
  borderRadius: "0.3rem",
  background: "rgba(0,0,0,0.18)",
  border: "1px solid rgba(255,255,255,0.06)",
};
