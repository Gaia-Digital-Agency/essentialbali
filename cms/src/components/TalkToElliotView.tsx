"use client";
import React, { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "elliot"; text: string; ts: number };

export default function TalkToElliotView() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "elliot",
      text:
        "I'm Elliot — orchestrator for Essential Bali content production. I plan content across 8 areas × 8 topics, dispatch to copywriter / web-manager / seo / imager / crawler / scraper, and push approved drafts to Payload. Ask me about the site, content gaps, or to plan a wave.",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "user", text: q, ts: Date.now() }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));
      const text = (data as any)?.answer || (data as any)?.error || "No reply.";
      setMessages((m) => [...m, { role: "elliot", text, ts: Date.now() }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "elliot", text: `(network error: ${e?.message || "unknown"})`, ts: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
  };

  return (
    <div style={shell}>
      <header style={head}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={dot} />
          <div>
            <div style={title}>Elliot — Essential Bali AI</div>
            <div style={sub}>Orchestrator · 6 sub-agents · Vertex Gemini 2.5</div>
          </div>
        </div>
      </header>

      <div style={agentsRow}>
        {[
          { id: "copywriter", label: "Copywriter", desc: "drafts articles" },
          { id: "web-manager", label: "Web Manager", desc: "pushes to Payload" },
          { id: "seo", label: "SEO", desc: "meta + keywords" },
          { id: "imager", label: "Imager", desc: "Imagen 3 hero images" },
          { id: "crawler", label: "Crawler", desc: "benchmark sites" },
          { id: "scraper", label: "Scraper", desc: "Python data extract" },
        ].map((a) => (
          <div key={a.id} style={agentChip} title={a.desc}>
            <span style={{ fontWeight: 500 }}>{a.label}</span>
            <span style={{ opacity: 0.65, fontSize: "0.65rem", marginLeft: 4 }}>· {a.desc}</span>
          </div>
        ))}
      </div>

      <div ref={scrollRef} style={msgs}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={m.role === "user" ? bubbleUser : bubbleElliot}>
              <div style={whoLabel}>{m.role === "user" ? "You" : "Elliot"}</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{m.text}</div>
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ ...row, justifyContent: "flex-start" }}>
            <div style={bubbleElliot}>
              <div style={whoLabel}>Elliot</div>
              <div style={{ opacity: 0.6, fontStyle: "italic" }}>thinking…</div>
            </div>
          </div>
        )}
      </div>

      <div style={composeWrap}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask Elliot — e.g. 'How many Canggu/Dine articles do we have?' or 'Plan wave 1 for Ubud'."
          rows={2}
          style={textarea}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !input.trim()}
          style={sendBtn}
        >
          {busy ? "Thinking…" : "Send"}
        </button>
      </div>
      <p style={hint}>Cmd/Ctrl+Enter to send. Conversation isn't persisted across reloads.</p>
    </div>
  );
}

const shell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 80px)",
  maxWidth: 960,
  margin: "0 auto",
  padding: "1.5rem 1.75rem",
  color: "var(--theme-text)",
};
const head: React.CSSProperties = {
  paddingBottom: "0.85rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  marginBottom: "0.75rem",
};
const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "var(--theme-success-500, #16a34a)",
};
const title: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 600,
  color: "var(--theme-text)",
};
const sub: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.75,
};
const agentsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "1rem",
};
const agentChip: React.CSSProperties = {
  fontSize: "0.7rem",
  padding: "0.28rem 0.65rem",
  borderRadius: 999,
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
  border: "1px solid var(--theme-elevation-150)",
};

const msgs: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "0.5rem 0",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};
const row: React.CSSProperties = { display: "flex" };
const bubbleBase: React.CSSProperties = {
  maxWidth: "78%",
  padding: "0.7rem 0.95rem",
  borderRadius: 14,
  fontSize: "0.88rem",
  border: "1px solid var(--theme-elevation-150)",
};
const bubbleUser: React.CSSProperties = {
  ...bubbleBase,
  background: "var(--theme-elevation-100)",
  color: "var(--theme-text)",
};
const bubbleElliot: React.CSSProperties = {
  ...bubbleBase,
  background: "var(--theme-elevation-50)",
  color: "var(--theme-text)",
};
const whoLabel: React.CSSProperties = {
  fontSize: "0.62rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.65,
  marginBottom: "0.25rem",
};

const composeWrap: React.CSSProperties = {
  display: "flex",
  gap: "0.6rem",
  alignItems: "flex-end",
  paddingTop: "0.85rem",
  borderTop: "1px solid var(--theme-elevation-150)",
};
const textarea: React.CSSProperties = {
  flex: 1,
  resize: "vertical",
  padding: "0.6rem 0.8rem",
  borderRadius: "var(--style-radius-s, 4px)",
  border: "1px solid var(--theme-elevation-200)",
  background: "var(--theme-input-bg, var(--theme-bg))",
  color: "var(--theme-text)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
};
const sendBtn: React.CSSProperties = {
  padding: "0.65rem 1.4rem",
  borderRadius: "var(--style-radius-s, 4px)",
  background: "var(--theme-success-500, #16a34a)",
  color: "#fff",
  border: "none",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};
const hint: React.CSSProperties = {
  marginTop: "0.5rem",
  fontSize: "0.68rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.6,
};
