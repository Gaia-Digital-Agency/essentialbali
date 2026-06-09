/**
 * /api/ai-chat/dispatch — execute an Elliot dispatch-article spec.
 *
 * Called by the "▶ Execute" button in TalkToElliotView when Elliot returns
 * a <spec>{...}</spec> block. SSHes to gda-ai01 and runs
 *   node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs
 * with the spec piped as JSON on stdin.
 *
 * Auth: requires authenticated Payload session (admin, staff, or ai-agent role).
 *
 * Request body: { spec: { area, topic, persona, brief, ...optional } }
 * Success: { ok: true, article_id, article_url, status, skipped, ... }
 * Failure: { ok: false, error: string, stderr_tail: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { createPayloadRequest } from "payload";
import config from "@payload-config";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// No maxDuration needed — self-hosted Next.js; the SSH timeout below is the real gate.

const DISPATCH_SCRIPT =
  "/opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs";
// 4.5 minutes: full chain (copywriter → seo → imager → web-manager)
const DISPATCH_TIMEOUT_MS = 270_000;

interface DispatchSpec {
  type?: string;
  area?: string;
  topic?: string;
  persona?: string;
  brief?: string;
  target_words?: number;
  research_url?: string;
  skip_imager?: boolean;
  force_regenerate?: boolean;
  status?: string;
  group?: string;
  tags?: string[];
  event_details?: Record<string, unknown>;
  published_at?: string;
}

function sshDispatch(specJson: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // SSH config at ~/.ssh/config already defines the gda-ai01 host alias
    // (HostName 34.143.206.68, User azlan, IdentityFile ~/.ssh/id_ed25519_gaia).
    const proc = spawn(
      "ssh",
      ["-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "gda-ai01", `node ${DISPATCH_SCRIPT}`],
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    const out: Buffer[] = [];
    const err: Buffer[] = [];
    proc.stdout.on("data", (d: Buffer) => out.push(d));
    proc.stderr.on("data", (d: Buffer) => err.push(d));

    proc.stdin.write(specJson);
    proc.stdin.end();

    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      reject({ stdout: "", stderr: "dispatch timed out", code: -1 });
    }, DISPATCH_TIMEOUT_MS);

    proc.on("close", (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(out).toString("utf8");
      const stderr = Buffer.concat(err).toString("utf8");
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject({ stdout, stderr, code });
      }
    });

    proc.on("error", (e) => {
      clearTimeout(timer);
      reject({ stdout: "", stderr: String(e), code: -1 });
    });
  });
}

/** Extract the last JSON object line from stdout (the script may emit progress logs too). */
function extractJson(stdout: string): Record<string, unknown> | null {
  for (const line of stdout.split("\n").reverse()) {
    const t = line.trim();
    if (t.startsWith("{") && t.endsWith("}")) {
      try {
        return JSON.parse(t) as Record<string, unknown>;
      } catch {
        // not valid JSON, keep looking
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  // Auth — same pattern as regenerate-hero
  const payloadReq = await createPayloadRequest({ config, request: req });
  const user = payloadReq.user;
  if (!user) return NextResponse.json({ ok: false, error: "auth required" }, { status: 401 });
  const role = (user as { role?: string }).role;
  if (role !== "admin" && role !== "staff" && role !== "ai-agent") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { spec?: DispatchSpec } | null = null;
  try {
    body = (await req.json()) as { spec?: DispatchSpec };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const spec = body?.spec;
  if (!spec || typeof spec !== "object") {
    return NextResponse.json({ ok: false, error: "missing spec" }, { status: 400 });
  }

  const { area, topic, persona, brief } = spec;
  if (!area || !topic || !persona || !brief) {
    return NextResponse.json(
      { ok: false, error: "spec requires: area, topic, persona, brief" },
      { status: 400 },
    );
  }

  const specJson = JSON.stringify({ type: "article", ...spec });

  try {
    const { stdout } = await sshDispatch(specJson);
    const result = extractJson(stdout);
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "dispatch returned no JSON output", stderr_tail: stdout.slice(-500) },
        { status: 502 },
      );
    }
    // Normalise: skipped_hash_locked → skipped: true with a human message
    const isSkipped = result.status === "skipped_hash_locked";
    return NextResponse.json({
      ok: true,
      ...result,
      skipped: isSkipped,
      message: isSkipped
        ? `Already exists (hash-locked). Review at ${result.article_url ?? ""}`
        : undefined,
    });
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    const combined = [e.stdout, e.stderr].filter(Boolean).join("\n").trim();
    const stderr_tail = combined
      .split("\n")
      .filter((l) => l.trim() && !l.includes("DeprecationWarning") && !l.startsWith("(node:"))
      .slice(-8)
      .join("\n");
    return NextResponse.json(
      { ok: false, error: "dispatch failed", stderr_tail },
      { status: 502 },
    );
  }
}
