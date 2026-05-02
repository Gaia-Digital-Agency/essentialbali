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

interface DispatchSpec {
  type?: string;
  area?: string;
  topic?: string;
  persona?: string;
  brief?: string;
  target_words?: number;
  research_url?: string;
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
