/**
 * /api/_internal/seo-optimize — server-side SEO agent endpoint.
 *
 * Single source of truth for the SEO logic. Used by:
 *   - Articles.beforeChange hook (in-process, via direct optimizeSeo() call)
 *   - Elliot dispatch-article.mjs orchestrator (HTTP, this endpoint)
 *
 * Auth: requires a Payload JWT (Authorization: JWT <token>) belonging
 * to a user with role = ai-agent (Elliot) or staff. CORS-restricted
 * via Payload config.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { optimizeSeo, type SeoOptimizeInput } from "@/lib/seo-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("JWT ")) {
    return NextResponse.json({ error: "missing JWT bearer" }, { status: 401 });
  }
  // Verify token with Payload — only ai-agent / staff role allowed.
  const payload = await getPayload({ config });
  const me = await payload.auth({ headers: req.headers as any }).catch(() => null);
  const user = me?.user;
  if (!user) return NextResponse.json({ error: "auth invalid" }, { status: 401 });
  const role = (user as any).role;
  if (role !== "ai-agent" && role !== "staff" && role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Partial<SeoOptimizeInput> | null;
  if (!body || !body.area || !body.topic || !body.title) {
    return NextResponse.json(
      { error: "required: area, topic, title" },
      { status: 400 },
    );
  }
  try {
    const out = await optimizeSeo(body as SeoOptimizeInput);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "seo agent failed" },
      { status: 502 },
    );
  }
}
