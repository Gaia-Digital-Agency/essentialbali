"use client";
/**
 * RegenerateHeroButton — admin UI for the article edit page.
 *
 * Renders below the hero upload field. Lets the editor type a quick
 * feedback note ("more atmospheric", "no people", etc.) and click
 * to call POST /api/regenerate-hero. The server generates a new
 * Imagen 3 hero, uploads to GCS via Payload media, and re-points
 * Article.hero. We then ask the page to refresh so the new hero
 * preview shows up in place.
 *
 * Wired in cms/src/collections/Articles.ts via:
 *   admin: { components: { afterFields: ["@/components/RegenerateHeroButton"] } }
 *
 * Why a custom field component vs. a separate /admin route:
 *   Field-level component keeps the editor in one place — they read
 *   the article, type feedback, see the new hero. No tab-switching.
 */
import React, { useState } from "react";

export default function RegenerateHeroButton() {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Pull the article id from the URL — the admin edit page is at
  // /admin/collections/articles/<id>.
  const articleId = (() => {
    if (typeof window === "undefined") return null;
    const m = window.location.pathname.match(/\/admin\/collections\/articles\/([^/]+)/);
    return m ? m[1] : null;
  })();

  if (!articleId || articleId === "create") {
    // Hide on the "create new article" form.
    return null;
  }

  const onClick = async () => {
    setErr(null); setMsg(null);
    if (!feedback.trim()) {
      setErr("Type some feedback first (e.g. 'more atmospheric', 'no people in close-up').");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/regenerate-hero", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, feedback: feedback.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr((data as any)?.error || `HTTP ${res.status}`);
        return;
      }
      setMsg(
        `New hero saved (media #${(data as any).new_media_id}, ${(data as any).width}×${(data as any).height}). Reloading…`,
      );
      // Wait a beat so the user sees the success toast, then reload to
      // pick up the new hero preview from Payload.
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      setErr(e?.message || "network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={shell}>
      <div style={label}>🔁 Regenerate hero with Imager</div>
      <div style={hint}>
        Tell Elliot what to change. Examples: <code style={code}>more atmospheric</code>{" "}
        · <code style={code}>no people in close-up</code> ·{" "}
        <code style={code}>less generic, less stock</code> ·{" "}
        <code style={code}>more sunset</code>
      </div>
      <div style={row}>
        <input
          type="text"
          placeholder="Feedback for the new image…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={busy}
          style={input}
        />
        <button type="button" onClick={onClick} disabled={busy} style={button}>
          {busy ? "Generating…" : "Regenerate"}
        </button>
      </div>
      {msg && <div style={msgOk}>{msg}</div>}
      {err && <div style={msgErr}>{err}</div>}
    </div>
  );
}

const shell: React.CSSProperties = {
  marginTop: "0.8rem",
  padding: "0.8rem 1rem",
  borderRadius: "6px",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-50)",
  color: "var(--theme-text)",
};
const label: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.3rem",
};
const hint: React.CSSProperties = {
  fontSize: "0.75rem",
  opacity: 0.75,
  marginBottom: "0.55rem",
};
const code: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.72rem",
  background: "var(--theme-elevation-100)",
  padding: "0.05rem 0.35rem",
  borderRadius: 3,
};
const row: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
};
const input: React.CSSProperties = {
  flex: 1,
  padding: "0.45rem 0.6rem",
  fontSize: "0.85rem",
  borderRadius: "4px",
  border: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-0)",
  color: "var(--theme-text)",
};
const button: React.CSSProperties = {
  padding: "0.45rem 1rem",
  fontSize: "0.85rem",
  fontWeight: 600,
  borderRadius: "4px",
  border: "1px solid var(--theme-success-500, #16a34a)",
  background: "var(--theme-success-500, #16a34a)",
  color: "white",
  cursor: "pointer",
};
const msgOk: React.CSSProperties = {
  marginTop: "0.5rem",
  fontSize: "0.78rem",
  color: "#16a34a",
};
const msgErr: React.CSSProperties = {
  marginTop: "0.5rem",
  fontSize: "0.78rem",
  color: "#dc2626",
};
