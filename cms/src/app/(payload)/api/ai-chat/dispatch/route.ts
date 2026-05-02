/**
 * /api/ai-chat/dispatch — Elliot's "Execute" endpoint.
 *
 * Body: { spec: { type, area, topic, persona, brief, target_words? } }
 *
 * The chat surface (TalkToElliotView) parses <spec>{...}</spec> blocks
 * out of Gemini's response and renders each as a card with an Execute
 * button. Click → POST here → we shell out to the openclaw-ess agent
 * host and run the existing dispatch-article.mjs orchestrator. Pipe
 * the spec via stdin (same contract dispatch-article uses for its
 * other callers).
 *
 * Auth: requires admin / staff / ai-agent. Same gate as
 * /api/regenerate-hero (path of least surprise).
 *
 * Why SSH to gda-ai01 instead of replicating the orchestrator here?
 * Reuse. dispatch-article.mjs already does
 *   crawler? → copywriter → imager → seo → submit
 * with the right Vertex creds + the right Payload login. Replicating
 * it inside this route would be ~600 lines of duplicated agent
 * orchestration. The SSH bridge is one extra hop that buys us all of
 * that for free.
 *
 * Sec note: spec is user-supplied (operator pasted Gemini's response,
 * clicked Execute). We pass it as stdin JSON to the script — NOT as
 * shell args — so injection via brief content is structurally
 * impossible. The spec object is also schema-validated below.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { spawn } from "node:child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const AGENT_HOST = "gda-ai01";
const DISPATCH_SCRIPT =
  "/opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs";

const VALID_AREAS = [
  "canggu",
  "kuta",
  "ubud",
  "jimbaran",
  "denpasar",
  "kintamani",
  "singaraja",
  "nusa-penida",
] as const;
const VALID_TOPICS = [
  "events",
  "news",
  "featured",
  "dine",
  "health-wellness",
  "nightlife",
  "activities",
  "people-culture",
] as const;

interface EventDetails {
  start_date?: string;        // YYYY-MM-DD
  end_date?: string;
  start_time?: string;        // HH:MM (24h)
  end_time?: string;
  time_of_day?: "morning" | "afternoon" | "night" | "all-day";
  venue_name?: string;
  venue_address?: string;
  venue_lat?: number;
  venue_lng?: number;
  ticket_url?: string;
  recurrence?: "one-off" | "weekly" | "monthly" | "annual";
}

interface DispatchSpec {
  type?: string;
  area?: string;
  topic?: string;
  persona?: string;
  brief?: string;
  target_words?: number;
  research_url?: string;

  // — Editorial controls (all optional) —
  status?: "draft" | "pending_review" | "approved" | "published";
  group?: "mostPopular" | "trending" | "ultimateGuide" | "overseas" | "spotlight";
  tags?: string[];            // tag slugs
  published_at?: string;      // ISO date or YYYY-MM-DD

  // — Event-only metadata (consumed when topic = events) —
  event_details?: EventDetails;

  // — Generation hints —
  headline_style?: string;
  force_regenerate?: boolean;
}

const VALID_STATUSES = ["draft", "pending_review", "approved", "published"] as const;
const VALID_GROUPS = [
  "mostPopular",
  "trending",
  "ultimateGuide",
  "overseas",
  "spotlight",
] as const;
const VALID_TIME_OF_DAY = ["morning", "afternoon", "night", "all-day"] as const;
const VALID_RECURRENCE = ["one-off", "weekly", "monthly", "annual"] as const;

const RX_DATE = /^\d{4}-\d{2}-\d{2}(?:T[\d:.\-+Z]*)?$/;
const RX_TIME = /^\d{1,2}:\d{2}$/;
const RX_TAG_SLUG = /^[a-z0-9][a-z0-9-]{0,40}$/;

function validateEventDetails(raw: unknown): EventDetails | { _error: string } {
  if (raw == null) return {};
  if (typeof raw !== "object") return { _error: "event_details must be an object" };
  const e = raw as Record<string, unknown>;
  const out: EventDetails = {};

  for (const k of ["start_date", "end_date"] as const) {
    const v = e[k];
    if (v == null || v === "") continue;
    const s = String(v);
    if (!RX_DATE.test(s)) return { _error: `event_details.${k} must be YYYY-MM-DD` };
    out[k] = s;
  }
  for (const k of ["start_time", "end_time"] as const) {
    const v = e[k];
    if (v == null || v === "") continue;
    const s = String(v);
    if (!RX_TIME.test(s)) return { _error: `event_details.${k} must be HH:MM (24h)` };
    out[k] = s.length === 4 ? `0${s}` : s;
  }
  if (e.time_of_day != null && e.time_of_day !== "") {
    const s = String(e.time_of_day);
    if (!VALID_TIME_OF_DAY.includes(s as (typeof VALID_TIME_OF_DAY)[number])) {
      return {
        _error: `event_details.time_of_day must be one of: ${VALID_TIME_OF_DAY.join(", ")}`,
      };
    }
    out.time_of_day = s as EventDetails["time_of_day"];
  }
  if (typeof e.venue_name === "string" && e.venue_name.trim()) {
    out.venue_name = e.venue_name.trim().slice(0, 200);
  }
  if (typeof e.venue_address === "string" && e.venue_address.trim()) {
    out.venue_address = e.venue_address.trim().slice(0, 500);
  }
  for (const k of ["venue_lat", "venue_lng"] as const) {
    const v = e[k];
    if (v == null || v === "") continue;
    const n = Number(v);
    if (!Number.isFinite(n)) return { _error: `event_details.${k} must be a number` };
    out[k] = n;
  }
  if (typeof e.ticket_url === "string" && e.ticket_url.startsWith("http")) {
    out.ticket_url = e.ticket_url.slice(0, 500);
  }
  if (e.recurrence != null && e.recurrence !== "") {
    const s = String(e.recurrence);
    if (!VALID_RECURRENCE.includes(s as (typeof VALID_RECURRENCE)[number])) {
      return {
        _error: `event_details.recurrence must be one of: ${VALID_RECURRENCE.join(", ")}`,
      };
    }
    out.recurrence = s as EventDetails["recurrence"];
  }
  return out;
}

function validate(spec: unknown): { ok: true; spec: DispatchSpec } | { ok: false; error: string } {
  if (!spec || typeof spec !== "object") return { ok: false, error: "spec must be an object" };
  const s = spec as Record<string, unknown>;
  const area = String(s.area || "").toLowerCase();
  const topic = String(s.topic || "").toLowerCase();
  const brief = String(s.brief || "").trim();
  const persona = String(s.persona || "").toLowerCase();

  if (!VALID_AREAS.includes(area as (typeof VALID_AREAS)[number])) {
    return { ok: false, error: `area must be one of: ${VALID_AREAS.join(", ")}` };
  }
  if (!VALID_TOPICS.includes(topic as (typeof VALID_TOPICS)[number])) {
    return { ok: false, error: `topic must be one of: ${VALID_TOPICS.join(", ")}` };
  }
  if (!brief || brief.length < 30) {
    return { ok: false, error: "brief is required and must be at least 30 characters" };
  }
  if (brief.length > 4000) {
    return { ok: false, error: "brief must be at most 4000 characters" };
  }
  if (!persona) {
    return { ok: false, error: "persona slug is required" };
  }

  const targetWordsRaw = s.target_words;
  let target_words: number | undefined;
  if (targetWordsRaw != null) {
    const n = Number(targetWordsRaw);
    if (Number.isFinite(n) && n >= 200 && n <= 1500) {
      target_words = Math.round(n);
    }
  }

  // status
  let status: DispatchSpec["status"] | undefined;
  if (s.status != null && s.status !== "") {
    const v = String(s.status);
    if (!VALID_STATUSES.includes(v as (typeof VALID_STATUSES)[number])) {
      return { ok: false, error: `status must be one of: ${VALID_STATUSES.join(", ")}` };
    }
    status = v as DispatchSpec["status"];
  }

  // group
  let group: DispatchSpec["group"] | undefined;
  if (s.group != null && s.group !== "") {
    const v = String(s.group);
    if (!VALID_GROUPS.includes(v as (typeof VALID_GROUPS)[number])) {
      return { ok: false, error: `group must be one of: ${VALID_GROUPS.join(", ")}` };
    }
    group = v as DispatchSpec["group"];
  }

  // tags — array of tag slugs
  let tags: string[] | undefined;
  if (s.tags != null) {
    if (!Array.isArray(s.tags)) {
      return { ok: false, error: "tags must be an array of slug strings" };
    }
    const cleaned = s.tags
      .map((t) => String(t).trim().toLowerCase())
      .filter(Boolean);
    for (const t of cleaned) {
      if (!RX_TAG_SLUG.test(t)) {
        return { ok: false, error: `tag slug "${t}" must be lowercase a-z0-9- (max 40 chars)` };
      }
    }
    if (cleaned.length > 12) {
      return { ok: false, error: "tags max 12 entries" };
    }
    if (cleaned.length) tags = Array.from(new Set(cleaned));
  }

  // published_at — accept YYYY-MM-DD or ISO datetime
  let published_at: string | undefined;
  if (s.published_at != null && s.published_at !== "") {
    const v = String(s.published_at);
    if (!RX_DATE.test(v)) {
      return { ok: false, error: "published_at must be YYYY-MM-DD or ISO datetime" };
    }
    const d = new Date(v.length === 10 ? `${v}T00:00:00Z` : v);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "published_at could not be parsed as a date" };
    }
    published_at = d.toISOString();
  }

  // event_details — only meaningful when topic = events, but accept on
  // any topic (the field group is just ignored by non-events templates).
  let event_details: EventDetails | undefined;
  if (s.event_details != null) {
    const result = validateEventDetails(s.event_details);
    if ("_error" in result) return { ok: false, error: result._error };
    if (Object.keys(result).length) event_details = result;
  }

  // headline_style — free-form copywriter hint
  let headline_style: string | undefined;
  if (typeof s.headline_style === "string" && s.headline_style.trim()) {
    headline_style = s.headline_style.trim().slice(0, 300);
  }

  const force_regenerate = !!s.force_regenerate;

  const cleaned: DispatchSpec = {
    type: typeof s.type === "string" ? s.type : "article",
    area,
    topic,
    persona,
    brief,
    ...(target_words ? { target_words } : {}),
    ...(typeof s.research_url === "string" && s.research_url.startsWith("http")
      ? { research_url: s.research_url }
      : {}),
    ...(status ? { status } : {}),
    ...(group ? { group } : {}),
    ...(tags ? { tags } : {}),
    ...(published_at ? { published_at } : {}),
    ...(event_details ? { event_details } : {}),
    ...(headline_style ? { headline_style } : {}),
    ...(force_regenerate ? { force_regenerate } : {}),
  };
  return { ok: true, spec: cleaned };
}

interface SshResult {
  code: number | null;
  stdout: string;
  stderr: string;
  json: unknown;
}

function runDispatchOverSsh(spec: DispatchSpec): Promise<SshResult> {
  return new Promise((resolve) => {
    // ssh gda-ai01 'node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs'
    // The remote script reads JSON from stdin if process.stdin.isTTY is false.
    const proc = spawn(
      "ssh",
      [
        "-o", "ConnectTimeout=10",
        "-o", "StrictHostKeyChecking=no",
        "-o", "BatchMode=yes",
        AGENT_HOST,
        `node ${DISPATCH_SCRIPT}`,
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.stdin.write(JSON.stringify(spec));
    proc.stdin.end();
    proc.on("close", (code) => {
      let json: unknown = null;
      try {
        json = JSON.parse(stdout || "{}");
      } catch {
        // dispatch-article failed before emitting JSON — leave json null
      }
      resolve({ code, stdout, stderr: stderr.slice(0, 4000), json });
    });
    proc.on("error", (err) => {
      resolve({
        code: -1,
        stdout: "",
        stderr: String(err?.message || err),
        json: null,
      });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const me = await payload
      .auth({ headers: req.headers as unknown as Headers })
      .catch(() => null);
    const user = me?.user as unknown as { role?: string } | null;
    if (!user) {
      return NextResponse.json({ error: "auth required" }, { status: 401 });
    }
    const role = user.role || "";
    if (!["admin", "staff", "ai-agent"].includes(role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as { spec?: unknown } | null;
    if (!body?.spec) {
      return NextResponse.json({ error: "missing spec" }, { status: 400 });
    }

    const v = validate(body.spec);
    if (v.ok === false) {
      return NextResponse.json({ error: v.error }, { status: 400 });
    }

    const result = await runDispatchOverSsh(v.spec);

    if (result.code !== 0 || !result.json) {
      return NextResponse.json(
        {
          error: "dispatch failed",
          exit_code: result.code,
          stderr_tail: result.stderr.split("\n").slice(-10).join("\n"),
        },
        { status: 502 },
      );
    }

    // dispatch-article emits a JSON envelope:
    //   { status, article_id, article_url, copywriter, seo, imager,
    //     skipped, hash, area, topic }
    const j = result.json as Record<string, unknown>;
    const articleId = j.article_id as number | undefined;
    const articleUrl = j.article_url as string | undefined;
    const status = j.status as string | undefined;

    if (status === "skipped_hash_locked") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        existing_id: j.existing_id,
        existing_status: j.existing_status,
        message: "An article with this brief already exists — re-run after deleting the old draft if you want a fresh one.",
      });
    }

    return NextResponse.json({
      ok: true,
      article_id: articleId,
      article_url: articleUrl,
      copywriter: j.copywriter,
      seo: j.seo,
      imager: j.imager,
      hash: j.hash,
      area: j.area,
      topic: j.topic,
    });
  } catch (err) {
    console.error("[/api/ai-chat/dispatch] error:", err);
    return NextResponse.json(
      { error: "internal error", detail: String((err as Error)?.message || err) },
      { status: 500 },
    );
  }
}
