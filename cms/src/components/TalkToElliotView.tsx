"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "elliot"; text: string; ts: number };

type Skill = { name: string; signature: string; desc: string };
type Agent = {
  id: string;
  name: string;
  role: string;
  model: string;
  workspace: string;
  status: "live" | "scaffolded" | "wip";
  skills: Skill[];
  invoker?: string; // shell command or path that backs the skill
};

const AGENTS: Agent[] = [
  {
    id: "main",
    name: "Elliot",
    role: "Orchestrator — plans content, dispatches to sub-agents, gates quality before submitting to Payload",
    model: "Anthropic Claude Haiku 4.5  ·  fallback Gemini 2.5 Flash",
    workspace: "/opt/.openclaw-ess/workspace-main",
    status: "live",
    skills: [
      { name: "plan-wave", signature: "plan-wave()", desc: "pick next batch of (area, topic, count) targets based on Payload article counts + wave strategy" },
      { name: "dispatch-article", signature: "dispatch-article(area, topic)", desc: "run full chain: crawler → scraper → copywriter → imager → seo → web-manager" },
      { name: "review-gate", signature: "review-gate(article)", desc: "pre-flight: word count, persona match, image, SEO, AI-isms, dedupe by source.hash" },
      { name: "status-report", signature: "status-report()", desc: "per-cell: published/approved/pending_review/draft" },
      { name: "maintenance-pass", signature: "maintenance-pass()", desc: "find stale Events / News > 30 days, queue refreshes" },
    ],
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Writes article body in a persona voice (Maya / Komang / Putu / Sari)",
    model: "Gemini 2.5 Flash",
    workspace: "/opt/.openclaw-ess/workspace-copywriter",
    status: "live",
    skills: [
      { name: "draft-article", signature: "draft-article(area, topic, brief, persona, research)", desc: "produce { title, slug, body_markdown, meta_title, meta_description, persona, area, topic, word_count, sources }" },
      { name: "rewrite-article", signature: "rewrite-article(article, instruction)", desc: "rework existing article per human feedback" },
      { name: "regenerate-title", signature: "regenerate-title(article)", desc: "produce 5 alternative titles for human pick" },
      { name: "persona-check", signature: "persona-check(text, persona)", desc: "score voice match 0-10, suggest fixes" },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-copywriter/scripts/draft-article.mjs"
  },
  {
    id: "web-manager",
    name: "Web Manager",
    role: "Bridge to Payload CMS — pushes drafts, uploads media, manages comments + ads",
    model: "Gemini 2.5 Flash",
    workspace: "/opt/.openclaw-ess/workspace-web-manager",
    status: "live",
    skills: [
      { name: "submit-article", signature: "submit-article(article)", desc: "POST /api/articles with status=pending_review (idempotent via source.hash)" },
      { name: "upload-media", signature: "upload-media(file, alt, credit)", desc: "POST multipart to /api/media, returns mediaId" },
      { name: "link-hero", signature: "link-hero(articleId, mediaId)", desc: "PATCH article.hero" },
      { name: "submit-comment", signature: "submit-comment(articleId, persona, body)", desc: "POST /api/comments" },
      { name: "toggle-hero-ad", signature: "toggle-hero-ad(area, topic, active)", desc: "PATCH /api/hero-ads cell" },
      { name: "fetch-status", signature: "fetch-status(articleId)", desc: "GET status (review/approved/published/rejected)" },
      { name: "list-pending-review", signature: "list-pending-review()", desc: "for Elliot status-report" },
    ],
    invoker: "JWT login at https://essentialbali.gaiada.online/api/users/login",
  },
  {
    id: "seo",
    name: "SEO",
    role: "Search optimization — keywords, meta, schema, internal links",
    model: "Gemini 2.5 Flash",
    workspace: "/opt/.openclaw-ess/workspace-seo",
    status: "live",
    skills: [
      { name: "keyword-research", signature: "keyword-research(area, topic)", desc: "primary + 5 long-tail keywords with rough volumes" },
      { name: "optimize-meta", signature: "optimize-meta(article)", desc: "meta title (≤60) + description (≤160)" },
      { name: "schema-markup", signature: "schema-markup(article)", desc: "Article + BreadcrumbList + Event/LocalBusiness when applicable" },
      { name: "internal-link", signature: "internal-link(article, candidates)", desc: "pick 3-5 same-area or same-topic links" },
      { name: "competitor-gap", signature: "competitor-gap(area, topic)", desc: "what benchmarks rank for that we don't" },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-seo/scripts/optimize-meta.mjs"
  },
  {
    id: "imager",
    name: "Imager",
    role: "Image generation via Imagen 3 — hero + inline + alt text",
    model: "Imagen 3.0",
    workspace: "/opt/.openclaw-ess/workspace-imager",
    status: "live",
    skills: [
      { name: "generate-hero", signature: "generate-hero(article)", desc: "1 hero image, 16:9, 1920×1080, photographic" },
      { name: "generate-inline", signature: "generate-inline(article, n)", desc: "N inline images, varied compositions" },
      { name: "regenerate", signature: "regenerate(article, feedback)", desc: "re-prompt with human feedback" },
      { name: "alt-text", signature: "alt-text(image, article)", desc: "SEO-friendly descriptive alt (10-15 words)" },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-imager/scripts/generate-hero.mjs"
  },
  {
    id: "crawler",
    name: "Crawler",
    role: "Benchmark research across the 4 reference sites",
    model: "Node fetch + Gemini for analysis",
    workspace: "/opt/.openclaw-ess/workspace-crawler",
    status: "live",
    skills: [
      { name: "discover", signature: "discover(area, topic, site?)", desc: "list candidate URLs (≤10) from honeycombers/whatsnew/nowbali/balibible" },
      { name: "analyze", signature: "analyze(url)", desc: "extract title, h1/h2/h3, paragraphs, hero, links, word count" },
      { name: "trend-scan", signature: "trend-scan(area)", desc: "merge candidates across sources, sort by recency" },
      { name: "gap-report", signature: "gap-report(area, topic)", desc: "what they cover that we don't" },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-crawler/scripts/crawl-benchmark.mjs",
  },
  {
    id: "scraper",
    name: "Scraper",
    role: "Deterministic data extraction — xlsx, Google Docs, listings",
    model: "Python + openpyxl + Google APIs",
    workspace: "/opt/.openclaw-ess/workspace-scraper",
    status: "live",
    skills: [
      { name: "read-articles-xlsx", signature: "read-articles-xlsx(month?, status?)", desc: "parse Essential Bali Proofread.xlsx tracker → row JSON" },
      { name: "pull-xlsx-from-drive", signature: "pull-xlsx-from-drive(name?)", desc: "download tracker from Drive (auto-export Sheets)" },
      { name: "read-google-doc", signature: "read-google-doc(url)", desc: "fetch Doc body as Markdown (must be shared with ai@gaiada.com)" },
      { name: "check-doc-access", signature: "check-doc-access()", desc: "for each Draft Link, report if accessible to ai@gaiada.com" },
      { name: "process-inbox", signature: "process-inbox(--pull?, --month?, --status?)", desc: "end-to-end: xlsx → optional doc body → article-ready records (never skips a row)" },
      { name: "fetch", signature: "fetch(url)", desc: "HTTP GET with UA + rate limit + retry" },
      { name: "extract-jsonld", signature: "extract-jsonld(html)", desc: "pull all structured data blobs" },
      { name: "geocode", signature: "geocode(query)", desc: "place name → lat/lng (cached)" },
    ],
    invoker: "python3 /opt/.openclaw-ess/workspace-scraper/scripts/...",
  },
];


export default function TalkToElliotView() {
  const [activeAgent, setActiveAgent] = useState<string>("main");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "elliot",
      text:
        "I'm Elliot — orchestrator for Essential Bali content. I plan production across 64 (area × topic) cells, dispatch to copywriter / web-manager / seo / imager / crawler / scraper, and push approved drafts to Payload. Pick a sub-agent on the left to see its skills, or ask me anything.",
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

  const agent = AGENTS.find((a) => a.id === activeAgent) || AGENTS[0];

  return (
    <div style={shell}>
      <a
        href="/admin"
        style={{
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
        }}
      >
        ← Back to Payload admin
      </a>
      <header style={head}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <span style={dot} />
          <div>
            <div style={title}>Talk to Elliot</div>
            <div style={sub}>
              Orchestrator + 6 sub-agents · Vertex Gemini · Mission Control{" "}
              <a
                href="https://ess.gaiada0.online"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--theme-text)", textDecoration: "underline" }}
              >
                ess.gaiada0.online
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Agent picker + skill detail */}
      <div style={twoCol}>
        <aside style={agentList}>
          <div style={listLabel}>Agents</div>
          {AGENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveAgent(a.id)}
              style={{
                ...agentBtn,
                background:
                  a.id === activeAgent
                    ? "var(--theme-elevation-100)"
                    : "transparent",
                borderColor:
                  a.id === activeAgent
                    ? "var(--theme-elevation-200)"
                    : "transparent",
              }}
            >
              <span style={{ fontWeight: 500 }}>{a.name}</span>
              <span style={statusPill(a.status)}>{a.status}</span>
            </button>
          ))}
        </aside>

        <section style={skillPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.4rem" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{agent.name}</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.7, marginTop: "0.2rem" }}>{agent.role}</div>
            </div>
            <span style={statusPill(agent.status)}>{agent.status}</span>
          </div>
          <div style={{ marginTop: "0.85rem", display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.35rem 0.85rem", fontSize: "0.74rem", opacity: 0.85 }}>
            <span style={metaKey}>Model</span>
            <span>{agent.model}</span>
            <span style={metaKey}>Workspace</span>
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.72rem" }}>{agent.workspace}</span>
            {agent.invoker ? (
              <>
                <span style={metaKey}>Invoke</span>
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.72rem" }}>{agent.invoker}</span>
              </>
            ) : null}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={listLabel}>Skills ({agent.skills.length})</div>
            <ul style={skillList}>
              {agent.skills.map((s) => (
                <li key={s.name} style={skillItem}>
                  <code style={skillSig}>{s.signature}</code>
                  <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: "0.2rem", lineHeight: 1.5 }}>{s.desc}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Chat */}
      <div style={chatLabel}>Chat with Elliot</div>
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
        <button type="button" onClick={send} disabled={busy || !input.trim()} style={sendBtn}>
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
  maxWidth: 1100,
  margin: "0 auto",
  padding: "1.5rem 1.75rem 2rem",
  color: "var(--theme-text)",
};
const head: React.CSSProperties = {
  paddingBottom: "0.85rem",
  borderBottom: "1px solid var(--theme-elevation-150)",
  marginBottom: "1rem",
};
const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "var(--theme-success-500, #16a34a)",
};
const title: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 600 };
const sub: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.8,
};


const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(160px, 200px) 1fr",
  gap: "1rem",
  marginBottom: "1.4rem",
};
const agentList: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.3rem" };
const listLabel: React.CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  opacity: 0.55,
  marginBottom: "0.4rem",
};
const agentBtn: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.55rem 0.7rem",
  borderRadius: "var(--style-radius-s, 4px)",
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--theme-text)",
  fontSize: "0.85rem",
  cursor: "pointer",
  textAlign: "left",
};
const skillPanel: React.CSSProperties = {
  padding: "1rem 1.2rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "var(--style-radius-s, 4px)",
};
const metaKey: React.CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  opacity: 0.55,
};
const skillList: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0.5rem 0 0",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};
const skillItem: React.CSSProperties = {
  padding: "0.55rem 0.7rem",
  background: "var(--theme-bg, transparent)",
  borderLeft: "2px solid var(--theme-elevation-200)",
  borderRadius: "0 var(--style-radius-s, 4px) var(--style-radius-s, 4px) 0",
};
const skillSig: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.78rem",
  background: "var(--theme-elevation-100)",
  padding: "0.15rem 0.4rem",
  borderRadius: 3,
  color: "var(--theme-text)",
};
const statusPill = (status: Agent["status"]): React.CSSProperties => {
  const colors = {
    live: { bg: "rgba(22,163,74,0.15)", fg: "#16a34a" },
    scaffolded: { bg: "rgba(217,119,6,0.15)", fg: "#d97706" },
    wip: { bg: "rgba(220,38,38,0.15)", fg: "#dc2626" },
  } as const;
  const c = colors[status];
  return {
    fontSize: "0.62rem",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "0.18rem 0.5rem",
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
  };
};

const chatLabel: React.CSSProperties = { ...listLabel, marginTop: "0.5rem", marginBottom: "0.6rem" };
const msgs: React.CSSProperties = {
  maxHeight: "40vh",
  minHeight: 180,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "var(--style-radius-s, 4px)",
  padding: "0.85rem",
  background: "var(--theme-bg)",
};
const row: React.CSSProperties = { display: "flex" };
const bubbleBase: React.CSSProperties = {
  maxWidth: "78%",
  padding: "0.65rem 0.9rem",
  borderRadius: 12,
  fontSize: "0.86rem",
  border: "1px solid var(--theme-elevation-150)",
};
const bubbleUser: React.CSSProperties = { ...bubbleBase, background: "var(--theme-elevation-100)", color: "var(--theme-text)" };
const bubbleElliot: React.CSSProperties = { ...bubbleBase, background: "var(--theme-elevation-50)", color: "var(--theme-text)" };
const whoLabel: React.CSSProperties = {
  fontSize: "0.6rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.6,
  marginBottom: "0.2rem",
};

const composeWrap: React.CSSProperties = {
  display: "flex",
  gap: "0.6rem",
  alignItems: "flex-end",
  paddingTop: "0.85rem",
};
const textarea: React.CSSProperties = {
  flex: 1,
  resize: "vertical",
  padding: "0.55rem 0.75rem",
  borderRadius: "var(--style-radius-s, 4px)",
  border: "1px solid var(--theme-elevation-200)",
  background: "var(--theme-input-bg, var(--theme-bg))",
  color: "var(--theme-text)",
  fontSize: "0.86rem",
  fontFamily: "inherit",
  outline: "none",
};
const sendBtn: React.CSSProperties = {
  padding: "0.6rem 1.3rem",
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
