/**
 * /api/seo-competitor-gap — server-side SEO ranker for benchmark gaps.
 *
 * Companion to /api/seo-optimize. Both wrap pure functions in
 * cms/src/lib/* (single source of truth). Used by Elliot's
 * gap-report orchestration to convert raw "themes we don't cover"
 * into a prioritised dispatch queue.
 *
 * Auth: Payload JWT (Authorization: JWT <token>) — role must be
 * ai-agent / staff / admin.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { rankCompetitorGap, type CompetitorGapInput } from "@/lib/competitor-gap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("JWT ")) {
    return NextResponse.json({ error: "missing JWT bearer" }, { status: 401 });
  }
  const payload = await getPayload({ config });
  const me = await payload.auth({ headers: req.headers as any }).catch(() => null);
  const user = me?.user;
  if (!user) return NextResponse.json({ error: "auth invalid" }, { status: 401 });
  const role = (user as any).role;
  if (role !== "ai-agent" && role !== "staff" && role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Partial<CompetitorGapInput> | null;
  if (!body || !body.area || !body.topic || !Array.isArray(body.missing_themes)) {
    return NextResponse.json(
      { error: "required: area, topic, missing_themes[]" },
      { status: 400 },
    );
  }
  if (body.missing_themes.length === 0) {
    return NextResponse.json({
      area: body.area,
      topic: body.topic,
      ranked_gaps: [],
      message: "no missing_themes provided — nothing to rank",
    });
  }

  try {
    const out = await rankCompetitorGap(body as CompetitorGapInput);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "competitor-gap ranker failed" },
      { status: 502 },
    );
  }
}
