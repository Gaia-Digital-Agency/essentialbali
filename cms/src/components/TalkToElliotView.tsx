"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "elliot"; text: string; ts: number };

type Skill = {
  name: string;
  signature: string;
  desc: string;
  status: "live" | "scaffolded";
};
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

// Mirrors docs/user_guide.md — every skill listed, with explicit
// live/scaffolded status. Total: 39 skills across 7 entities.
const AGENTS: Agent[] = [
  {
    id: "main",
    name: "Elliot",
    role: "Orchestrator — plans content waves, dispatches the chain, gates quality before submit",
    model: "Anthropic Claude Haiku 4.5  ·  fallback Gemini 2.5 Flash",
    workspace: "/opt/.openclaw-ess/workspace-main",
    status: "live",
    skills: [
      { status: "live",       name: "plan-wave",        signature: "plan-wave(--limit?, --execute?, --dry-run?, --gap?)", desc: "Reads Payload counts per (area, topic), computes per-cell deficit vs the 20-per-cell target, picks persona + brief from rotating templates, emits prioritised dispatch queue. --execute fires at 1/min default." },
      { status: "live",       name: "dispatch-article", signature: "dispatch-article({area, topic, persona, brief, target_words?, research_url?, skip_imager?})", desc: "Full chain: copywriter → seo → imager → web-manager. Hash-locked (Path B) so accidental re-runs of the same brief are blocked." },
      { status: "scaffolded", name: "review-gate",      signature: "review-gate(article)", desc: "Pre-flight checks before submit: word count, persona match, hero present, SEO non-empty, banned phrases, source.hash dedupe. Currently runs as part of dispatch-article — not a standalone skill yet." },
      { status: "live",       name: "status-report",    signature: "status-report(--table?, --status?)", desc: "Per-cell snapshot of every status (published/approved/pending_review/draft/rejected). Default JSON; --table prints an ASCII grid; --status=<one> focuses on a single column." },
      { status: "scaffolded", name: "maintenance-pass", signature: "maintenance-pass()", desc: "Find stale Events past their date or News > 30 days old, queue refreshes." },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-main/scripts/{plan-wave,dispatch-article}.mjs",
  },
  {
    id: "copywriter",
    name: "Copywriter",
    role: "Writes article body in a persona voice (Maya / Komang / Putu / Sari)",
    model: "Vertex Gemini 2.5 Flash (response bound to JSON schema)",
    workspace: "/opt/.openclaw-ess/workspace-copywriter",
    status: "live",
    skills: [
      { status: "live",       name: "draft-article",     signature: "draft-article({area, topic, persona, brief, target_words?, research?})", desc: "Drafts title + body_markdown + sub_title + meta + sources, in chosen persona's voice. Banned-phrase regex enforced in-script." },
      { status: "live",       name: "rewrite-article",   signature: "rewrite-article(--id, --instruction)", desc: "Take existing article + instruction, produce fresh draft with augmented brief. source.hash gets _v2 / _v3 / ... suffix so it replaces, not duplicates." },
      { status: "live",       name: "regenerate-title",  signature: "regenerate-title(--id)", desc: "Produces 5 alternative titles (≤60 chars), each with an editorial angle (numbered list, question hook, lead with dish, etc). Vertex Gemini schema-bound, temperature 0.7." },
      { status: "scaffolded", name: "persona-check",     signature: "persona-check(text, persona)", desc: "Score voice match 0–10 against persona guidelines, suggest fixes." },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-copywriter/scripts/draft-article.mjs",
  },
  {
    id: "seo",
    name: "SEO",
    role: "Search optimization — keywords, meta, schema, internal links",
    model: "Vertex Gemini 2.5 Flash (single source: cms/src/lib/seo-agent.ts)",
    workspace: "/opt/.openclaw-ess/workspace-seo",
    status: "live",
    skills: [
      { status: "live",       name: "optimize-meta",    signature: "POST /api/seo-optimize {area, topic, title, bodyText?, subTitle?, existingMetaTitle?}", desc: "Returns meta_title (≤60), meta_description (≤160), internal_link_anchors[]." },
      { status: "live",       name: "keyword-research", signature: "(included in optimize-meta response)", desc: "primary_keyword + 3–5 long-tail variants returned alongside meta." },
      { status: "live",       name: "schema-markup",    signature: "(emitted server-side at render time)", desc: "Schema.org Article JSON-LD computed from the published article fields." },
      { status: "live",       name: "internal-link",    signature: "(included in optimize-meta response)", desc: "3–5 short noun-phrase anchors as inbound link bait." },
      { status: "scaffolded", name: "competitor-gap",   signature: "competitor-gap(area, topic)", desc: "Diff: what benchmarks rank for that we don't. Crawler feeds the data; SEO ranks gaps." },
    ],
    invoker: "POST https://essentialbali.gaiada.online/api/seo-optimize (JWT)",
  },
  {
    id: "imager",
    name: "Imager",
    role: "Image generation via Imagen 3 — hero + inline + alt text",
    model: "Vertex Imagen 3 (imagen-3.0-generate-002)",
    workspace: "/opt/.openclaw-ess/workspace-imager",
    status: "live",
    skills: [
      { status: "live",       name: "generate-hero",   signature: "generate-hero({area, topic, title, summary?, persona?, out_dir?})", desc: "One 16:9 hero (Imagen native ~1408×768). Per-area visual cues + per-topic composition cues + persona hint. Uploads to GCS via /api/media when wired into dispatch." },
      { status: "live",       name: "generate-inline", signature: "generate-hero(... --inline=N)", desc: "N square 1024×1024 inline images (max 4), varied compositions." },
      { status: "scaffolded", name: "regenerate",      signature: "regenerate(article, feedback)", desc: "Re-prompt with extra negative + adjusted summary based on human feedback." },
      { status: "live",       name: "alt-text",        signature: "(auto-emitted per file)", desc: "{title} — {area} {topic} editorial photograph — written automatically into the media doc." },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-imager/scripts/generate-hero.mjs",
  },
  {
    id: "web-manager",
    name: "Web Manager",
    role: "Bridge to Payload CMS — pushes drafts, uploads media, manages comments + ads",
    model: "Payload REST + JWT (elliot@gaiada.com, role ai-agent)",
    workspace: "/opt/.openclaw-ess/workspace-web-manager",
    status: "live",
    skills: [
      { status: "live", name: "submit-article",      signature: "POST /api/articles", desc: "Idempotent via source.hash. Always sets status=pending_review on submit." },
      { status: "live", name: "upload-media",        signature: "POST /api/media (multipart)", desc: "Uploads file to GCS bucket gda-essentialbali-media; returns Payload media doc with public GCS URL." },
      { status: "live", name: "link-hero",           signature: "PATCH /api/articles/{id} {hero: mediaId}", desc: "Sets Article.hero to the uploaded media id." },
      { status: "live", name: "submit-comment",      signature: "POST /api/comments", desc: "Used by Elliot if it generates a persona-style first-comment seed." },
      { status: "live", name: "toggle-hero-ad",      signature: "PATCH /api/hero-ads/{id} {active: bool}", desc: "Flip an ad slot on/off. Same endpoint your Hero Ads grid hits." },
      { status: "live", name: "fetch-status",        signature: "GET /api/articles/{id}", desc: "Read the current article status (review / approved / published / rejected)." },
      { status: "live", name: "list-pending-review", signature: "GET /api/articles?where[status][equals]=pending_review", desc: "What's in your review queue. Drives Elliot's status-report." },
    ],
    invoker: "JWT login at https://essentialbali.gaiada.online/api/users/login",
  },
  {
    id: "crawler",
    name: "Crawler",
    role: "Benchmark research across 4 reference sites — research only, never republished",
    model: "Node fetch + Gemini for analysis",
    workspace: "/opt/.openclaw-ess/workspace-crawler",
    status: "live",
    skills: [
      { status: "live",       name: "discover",   signature: "discover({area, topic, site?})", desc: "List up to 10 candidate URLs from one of honeycombers / whatsnew / nowbali / balibible for a given (area, topic)." },
      { status: "live",       name: "analyze",    signature: "analyze(url)", desc: "Fetch one URL, extract title + h1/h2/h3 + paragraphs + hero + outbound links + word count. JSON to stdout." },
      { status: "scaffolded", name: "trend-scan", signature: "trend-scan(area)", desc: "Merge candidates across all 4 sources, sort by recency. \"What's getting written about Bali this week.\"" },
      { status: "scaffolded", name: "gap-report", signature: "gap-report(area, topic)", desc: "What benchmarks cover that we don't (cell-level). Pairs with SEO competitor-gap." },
    ],
    invoker: "node /opt/.openclaw-ess/workspace-crawler/scripts/crawl-benchmark.mjs",
  },
  {
    id: "scraper",
    name: "Scraper",
    role: "Deterministic data extraction — xlsx, Google Docs, listings (no LLM)",
    model: "Python venv + openpyxl + requests + bs4",
    workspace: "/opt/.openclaw-ess/workspace-scraper",
    status: "live",
    skills: [
      { status: "live", name: "read-articles-xlsx",   signature: "read-articles-xlsx(month?, status?)", desc: "Parse Essential Bali Proofread.xlsx tracker → row JSON ready to ingest." },
      { status: "live", name: "pull-xlsx-from-drive", signature: "pull-xlsx-from-drive(name?)", desc: "Download tracker from Google Drive (auto-exports Sheets to xlsx)." },
      { status: "live", name: "read-google-doc",      signature: "read-google-doc(url)", desc: "Fetch Doc body as Markdown. Doc must be shared with ai@gaiada.com." },
      { status: "live", name: "check-doc-access",     signature: "check-doc-access()", desc: "Per-row report of which Draft Links are reachable for ai@gaiada.com." },
      { status: "live", name: "process-inbox",        signature: "process-inbox(--pull?, --month?, --status?)", desc: "End-to-end pipeline. Never skips a row — falls back to xlsx metadata when Doc isn't shared." },
      { status: "live", name: "fetch",                signature: "fetch(url)", desc: "HTTP GET with proper UA + rate limit + retry. Helper used by other skills." },
      { status: "live", name: "extract-article",      signature: "extract-article(html)", desc: "title, dateline, body, hero, author, tags from arbitrary HTML." },
      { status: "live", name: "extract-listing",      signature: "extract-listing(html, selectors)", desc: "List items per CSS/XPath selectors." },
      { status: "live", name: "extract-jsonld",       signature: "extract-jsonld(html)", desc: "Pull all Schema.org JSON-LD blobs from a page." },
      { status: "live", name: "geocode",              signature: "geocode(query)", desc: "Place name → lat/lng via Google Geocoding API, cached aggressively." },
    ],
    invoker: "python3 /opt/.openclaw-ess/workspace-scraper/scripts/{...}.py",
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
            <div style={listLabel}>
              Skills ({agent.skills.length})
              {" — "}
              <span style={{ color: "#16a34a", fontWeight: 600 }}>
                {agent.skills.filter((s) => s.status === "live").length} live
              </span>
              {agent.skills.some((s) => s.status === "scaffolded") && (
                <>
                  {" · "}
                  <span style={{ color: "#d97706", fontWeight: 600 }}>
                    {agent.skills.filter((s) => s.status === "scaffolded").length} scaffolded
                  </span>
                </>
              )}
            </div>
            <ul style={skillList}>
              {agent.skills.map((s) => (
                <li key={s.name} style={skillItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        ...skillStatusPill,
                        background:
                          s.status === "live" ? "rgba(22,163,74,0.18)" : "rgba(217,119,6,0.18)",
                        color: s.status === "live" ? "#16a34a" : "#d97706",
                        borderColor:
                          s.status === "live" ? "rgba(22,163,74,0.45)" : "rgba(217,119,6,0.45)",
                      }}
                    >
                      {s.status === "live" ? "● LIVE" : "○ scaffolded"}
                    </span>
                    <code style={skillSig}>{s.signature}</code>
                  </div>
                  <div style={{ fontSize: "0.78rem", opacity: 0.85, marginTop: "0.3rem", lineHeight: 1.5 }}>{s.desc}</div>
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
const skillStatusPill: React.CSSProperties = {
  fontSize: "0.62rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  padding: "0.12rem 0.45rem",
  borderRadius: 999,
  border: "1px solid",
  whiteSpace: "nowrap",
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
