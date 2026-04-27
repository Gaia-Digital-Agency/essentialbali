"use client";
import React, { useState } from "react";

/**
 * Renders ABOVE the Subscribers list. Lets an admin compose a quick HTML email
 * and broadcast it to every active subscriber. Calls /api/subscribers/broadcast.
 */
export default function SubscribersBroadcast() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      setResult("Subject and body are required.");
      return;
    }
    if (!confirm(`Send to all active subscribers?\n\nSubject: ${subject}`)) return;
    setSending(true);
    setResult(null);
    try {
      const html = body
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
      const res = await fetch("/api/subscribers/broadcast", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(`✕ ${data.error || "Failed"}`);
      } else {
        setResult(`✓ Sent to ${data.sent || 0} subscribers.`);
        setSubject("");
        setBody("");
      }
    } catch (e: any) {
      setResult(`✕ ${e?.message || "Network error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={headerRow}>
        <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Broadcast email</h3>
        <button type="button" onClick={() => setOpen((v) => !v)} style={toggleBtn}>
          {open ? "Close" : "Compose…"}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: "0.85rem" }}>
          <label style={label}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What’s new on Essential Bali — May edition"
            style={input}
            maxLength={200}
          />
          <label style={label}>Message body (plain text — paragraphs separated by blank lines)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hi friends,&#10;&#10;This week we’re looking at the new beach clubs in Canggu…"
            style={{ ...input, minHeight: 140, fontFamily: "inherit", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem" }}>
            <button type="button" onClick={send} disabled={sending} style={sendBtn}>
              {sending ? "Sending…" : "Send to all active subscribers"}
            </button>
            {result && (
              <span style={{ alignSelf: "center", fontSize: "0.78rem" }}>{result}</span>
            )}
          </div>
          <p style={hint}>
            Recipients will receive via BCC (no recipient sees others’ addresses). Cooldown: 1 broadcast / 5 minutes.
          </p>
        </div>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  margin: "1rem 0 1.25rem",
  padding: "0.85rem 1.1rem",
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 8,
};
const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const toggleBtn: React.CSSProperties = {
  padding: "0.3rem 0.7rem",
  borderRadius: 4,
  background: "rgba(0,0,0,0.05)",
  border: "1px solid rgba(0,0,0,0.1)",
  fontSize: "0.75rem",
  cursor: "pointer",
};
const label: React.CSSProperties = {
  display: "block",
  marginTop: "0.55rem",
  marginBottom: "0.25rem",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "rgba(0,0,0,0.6)",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.7rem",
  borderRadius: 4,
  border: "1px solid rgba(0,0,0,0.15)",
  fontSize: "0.85rem",
  background: "#fff",
};
const sendBtn: React.CSSProperties = {
  padding: "0.5rem 1.1rem",
  borderRadius: 4,
  background: "#111",
  color: "#fff",
  border: "none",
  fontSize: "0.8rem",
  cursor: "pointer",
};
const hint: React.CSSProperties = {
  marginTop: "0.5rem",
  fontSize: "0.7rem",
  color: "rgba(0,0,0,0.55)",
};
