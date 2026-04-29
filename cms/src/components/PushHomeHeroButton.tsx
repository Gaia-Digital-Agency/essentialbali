"use client";

/**
 * Admin edit-page action: when editing the homepage default hero
 * (the (NULL area, NULL topic) row), shows a button that pushes its
 * content (creative, headline, subline, link, CTA) to every cell-
 * specific hero row whose topic has showsHero=true.
 *
 * Hidden on cell-specific hero edit pages — only the homepage hero
 * is the source of a "push to all" action.
 *
 * Wired via cms/src/collections/HeroAds.ts:
 *   admin.components.edit.beforeDocumentControls = ["@/components/PushHomeHeroButton"]
 *
 * The endpoint behind this is POST /api/hero-ads/push-to-all
 * (cms/src/app/(frontend)/api/hero-ads/push-to-all/route.ts).
 */
import React, { useEffect, useState } from "react";

type Result = {
  ok?: boolean;
  updatedCount?: number;
  failedCount?: number;
  cellRowsConsidered?: number;
  activated?: boolean;
  error?: string;
};

// Parse the hero-ads doc id out of the admin URL path:
//   /admin/collections/hero-ads/65        -> "65"
//   /admin/collections/hero-ads/create    -> null (we're not editing an existing row)
//   anywhere else                         -> null
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

export default function PushHomeHeroButton() {
  const [isHomepageRow, setIsHomepageRow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Only render on the homepage default row. We confirm by fetching the
  // current doc — if area + topic are both null, we're on the right page.
  useEffect(() => {
    const id = getHeroDocId();
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/hero-ads/${id}?depth=0`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data && data.area == null && data.topic == null) {
          setIsHomepageRow(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHomepageRow) return null;

  const onClick = async () => {
    const ok = window.confirm(
      "Push this homepage hero's image, copy, link, and CTA to every cell-specific hero (8 areas × topics with showsHero), and activate them all?\n\nCell-level area/topic, client, and schedule are preserved. The cell rows for topics with showsHero=false (e.g. Events) are skipped.",
    );
    if (!ok) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/hero-ads/push-to-all", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activate: true }),
      });
      const json = (await res.json()) as Result;
      setResult(json);
    } catch (e: any) {
      setResult({ error: e?.message || "Network error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={head}>
        <div>
          <div style={title}>Push to all cell heroes</div>
          <div style={sub}>
            Copies image, headline, subline, link, and CTA to every cell-
            specific hero (skipping topics with showsHero=false) and activates
            them. Useful for site-wide campaigns. Cell-level <code>client</code>{" "}
            and <code>schedule</code> are preserved.
          </div>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          style={{
            ...btn,
            opacity: busy ? 0.55 : 1,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "Pushing…" : "Push to all"}
        </button>
      </div>
      {result && (
        <div
          style={{
            ...resultBar,
            background: result.ok
              ? "rgba(22,163,74,0.15)"
              : "rgba(220,38,38,0.15)",
            color: result.ok ? "#16a34a" : "#dc2626",
            borderColor: result.ok
              ? "rgba(22,163,74,0.4)"
              : "rgba(220,38,38,0.4)",
          }}
        >
          {result.error
            ? `Failed: ${result.error}`
            : `Updated ${result.updatedCount} of ${result.cellRowsConsidered} cell hero${
                result.cellRowsConsidered === 1 ? "" : "s"
              }${result.failedCount ? `. ${result.failedCount} failed.` : ""}${
                result.activated ? " (all activated)" : ""
              }`}
        </div>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  margin: "0.6rem 0 1.2rem",
  padding: "0.9rem 1.1rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "8px",
};

const head: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap",
};

const title: React.CSSProperties = {
  fontSize: "0.92rem",
  fontWeight: 600,
  color: "var(--theme-text)",
};

const sub: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.85,
  marginTop: "0.3rem",
  maxWidth: 640,
};

const btn: React.CSSProperties = {
  padding: "0.55rem 1.2rem",
  borderRadius: "6px",
  background: "var(--theme-success-500, #16a34a)",
  color: "#fff",
  border: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const resultBar: React.CSSProperties = {
  marginTop: "0.7rem",
  padding: "0.6rem 0.9rem",
  borderRadius: "6px",
  fontSize: "0.82rem",
  border: "1px solid",
};
