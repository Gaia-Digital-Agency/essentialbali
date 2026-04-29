"use client";
/**
 * MediaUploadDock — drag/drop upload surface inside /admin/elliot.
 *
 * Sends the right metadata to the canonical-naming hook (N3):
 *   POST /api/media (multipart)
 *     file:     the chosen image file
 *     _payload: { alt, source: "external", kind, area?, topic?, linkedArticle? }
 *
 * Server-side hook on the Media collection rewrites req.file.name to
 *   {source}_{kind}[_{area}][_{topic}]_{slug}-{nano}.webp
 * before generateFileData runs. originals + size variants both land in
 * GCS under the canonical name.
 *
 * Hard limits enforced client-side (server enforces too):
 *   - max 10 MB
 *   - MIME ∈ image/jpeg | image/png | image/webp (videos rejected)
 *
 * On success: shows a green chip with the resulting filename + a Copy
 * URL button. On failure: shows a red bar with the server error.
 *
 * Auth: relies on the Payload session cookie carried automatically by
 * fetch() on same-origin requests. /admin/elliot is gated by Payload's
 * admin auth, so any user reaching this component is already logged in.
 */
import React, { useCallback, useRef, useState } from "react";

type Kind =
  | "hero"
  | "hero_ads"
  | "inline"
  | "newsletter"
  | "avatar"
  | "banner"
  | "other";

type Area =
  | ""
  | "canggu"
  | "kuta"
  | "ubud"
  | "jimbaran"
  | "denpasar"
  | "kintamani"
  | "singaraja"
  | "nusa-penida";

type Topic =
  | ""
  | "events"
  | "news"
  | "featured"
  | "dine"
  | "health-wellness"
  | "nightlife"
  | "activities"
  | "people-culture";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 10 * 1024 * 1024;

interface SuccessChip {
  id: number | string;
  filename: string;
  url: string;
}

const KINDS: Kind[] = ["hero", "hero_ads", "inline", "newsletter", "avatar", "banner", "other"];
const AREAS: Area[] = ["", "canggu", "kuta", "ubud", "jimbaran", "denpasar", "kintamani", "singaraja", "nusa-penida"];
const TOPICS: Topic[] = ["", "events", "news", "featured", "dine", "health-wellness", "nightlife", "activities", "people-culture"];

export default function MediaUploadDock() {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [kind, setKind] = useState<Kind>("other");
  const [area, setArea] = useState<Area>("");
  const [topic, setTopic] = useState<Topic>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessChip | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validate = (f: File | null): string | null => {
    if (!f) return "Pick a file first.";
    if (!(ACCEPT as readonly string[]).includes(f.type)) {
      return `Type "${f.type || "unknown"}" not allowed. Use JPEG, PNG or WebP.`;
    }
    if (f.size > MAX_BYTES) {
      return `Too big: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max is 10 MB.`;
    }
    return null;
  };

  const onPick = (f: File | null) => {
    setErr(null);
    setSuccess(null);
    const v = validate(f);
    if (v) {
      setErr(v);
      setFile(null);
      return;
    }
    setFile(f);
    if (!alt && f?.name) {
      // Pre-fill alt with a humanised filename so the user has something
      // to edit rather than a blank field.
      const stem = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      setAlt(stem);
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0] || null;
      onPick(f);
    },
    [alt],
  );

  const onSubmit = async () => {
    if (!file) return;
    if (!alt.trim()) {
      setErr("Alt text is required (accessibility + SEO).");
      return;
    }
    const v = validate(file);
    if (v) {
      setErr(v);
      return;
    }
    setBusy(true);
    setErr(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const payload: Record<string, string> = {
        alt: alt.trim(),
        source: "external",
        kind,
      };
      if (area) payload.area = area;
      if (topic) payload.topic = topic;
      form.append("_payload", JSON.stringify(payload));

      const res = await fetch("/api/media", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json?.errors?.[0]?.message ||
          json?.message ||
          `upload failed (HTTP ${res.status})`;
        throw new Error(msg);
      }
      const doc = json?.doc || json;
      setSuccess({
        id: doc.id,
        filename: String(doc.filename || "(no filename returned)"),
        url: String(doc.url || ""),
      });
      // Reset for the next upload.
      setFile(null);
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={shell} aria-label="Media Upload Dock">
      <header style={head}>
        <div style={title}>Upload media</div>
        <div style={sub}>
          JPEG / PNG / WebP · ≤ 10 MB · auto-converted to WebP · canonical
          filename derived from the metadata below
        </div>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ ...drop, ...(drag ? dropOver : {}) }}
        role="button"
        tabIndex={0}
      >
        {file ? (
          <div>
            <div style={{ fontSize: "0.85rem" }}>
              <strong>{file.name}</strong>
            </div>
            <div style={{ fontSize: "0.74rem", opacity: 0.75, marginTop: "0.25rem" }}>
              {(file.size / 1024).toFixed(0)} KB · {file.type || "unknown type"}
            </div>
            <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: "0.4rem" }}>
              Click or drop a different file to replace
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>
            <div>Drag & drop, or click to select</div>
            <div style={{ fontSize: "0.74rem", marginTop: "0.3rem" }}>
              Max 10 MB · pictures only
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />
      </div>

      <div style={fieldRow}>
        <label style={labelStyle}>
          <span style={labelText}>Alt text *</span>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="What does the image show?"
            style={input}
          />
        </label>
      </div>

      <div style={triRow}>
        <label style={labelStyle}>
          <span style={labelText}>Kind</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            style={select}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>Area</span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value as Area)}
            style={select}
          >
            {AREAS.map((a) => (
              <option key={a || "_none"} value={a}>
                {a || "—"}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          <span style={labelText}>Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic)}
            style={select}
          >
            {TOPICS.map((t) => (
              <option key={t || "_none"} value={t}>
                {t || "—"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || busy || !alt.trim()}
          style={{ ...btn, ...(busy ? btnBusy : {}) }}
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        {err && <div style={errBar}>⚠ {err}</div>}
        {success && (
          <div style={okChip}>
            <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
              ✓ Uploaded as {success.filename}
            </div>
            {success.url && (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                <a href={success.url} target="_blank" rel="noopener noreferrer" style={chipLink}>
                  open
                </a>
                <button
                  type="button"
                  style={chipBtn}
                  onClick={() => navigator.clipboard?.writeText(success.url)}
                >
                  copy URL
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Inline styles — match TalkToElliotView's neutral admin look ────
const shell: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.6rem",
  padding: "1rem",
  background: "rgba(255,255,255,0.025)",
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
};
const head: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.2rem" };
const title: React.CSSProperties = { fontSize: "1rem", fontWeight: 600 };
const sub: React.CSSProperties = { fontSize: "0.74rem", opacity: 0.7, lineHeight: 1.45 };
const drop: React.CSSProperties = {
  border: "2px dashed rgba(255,255,255,0.2)",
  borderRadius: "0.5rem",
  padding: "1.25rem",
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.12s, background 0.12s",
  fontSize: "0.85rem",
};
const dropOver: React.CSSProperties = {
  borderColor: "rgba(110,180,255,0.7)",
  background: "rgba(110,180,255,0.08)",
};
const fieldRow: React.CSSProperties = { display: "flex", gap: "0.6rem", flexWrap: "wrap" };
const triRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "0.6rem",
};
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 };
const labelText: React.CSSProperties = { fontSize: "0.7rem", opacity: 0.75, fontWeight: 500 };
const input: React.CSSProperties = {
  padding: "0.45rem 0.6rem",
  borderRadius: "0.35rem",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  fontSize: "0.85rem",
};
const select: React.CSSProperties = { ...input };
const btn: React.CSSProperties = {
  padding: "0.5rem 1.1rem",
  borderRadius: "0.35rem",
  border: "1px solid rgba(110,180,255,0.5)",
  background: "rgba(110,180,255,0.15)",
  color: "inherit",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 600,
};
const btnBusy: React.CSSProperties = { opacity: 0.6, cursor: "wait" };
const errBar: React.CSSProperties = {
  padding: "0.45rem 0.7rem",
  borderRadius: "0.35rem",
  background: "rgba(220,80,80,0.18)",
  border: "1px solid rgba(220,80,80,0.4)",
  fontSize: "0.78rem",
  flex: 1,
  minWidth: "10rem",
};
const okChip: React.CSSProperties = {
  padding: "0.45rem 0.7rem",
  borderRadius: "0.35rem",
  background: "rgba(80,200,120,0.18)",
  border: "1px solid rgba(80,200,120,0.4)",
  fontSize: "0.78rem",
  flex: 1,
  minWidth: "12rem",
};
const chipLink: React.CSSProperties = {
  fontSize: "0.74rem",
  textDecoration: "underline",
  color: "inherit",
  opacity: 0.85,
};
const chipBtn: React.CSSProperties = {
  fontSize: "0.74rem",
  padding: "0.15rem 0.5rem",
  borderRadius: "0.25rem",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
