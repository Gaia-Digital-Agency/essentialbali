/**
 * /api/regenerate-hero — server-side endpoint backing the
 * "🔁 Regenerate hero" button in the Articles admin.
 *
 * Body: { articleId: number, feedback: string }
 *
 * Steps:
 *   1. Auth via Payload session cookie (admin user).
 *   2. Fetch the article (depth=1) to read area/topic/title/persona.
 *   3. Call regenerateHero() in cms/src/lib/imager-regenerate.ts.
 *   4. Create a Payload Media doc with the new PNG (auto-uploads to GCS
 *      via the existing storage adapter).
 *   5. PATCH the article's hero field to point at the new media id.
 *   6. Return { mediaId, url } so the client can show a preview.
 *
 * Auth: requires authenticated Payload admin session OR JWT.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { regenerateHero } from "@/lib/imager-regenerate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const me = await payload.auth({ headers: req.headers as any }).catch(() => null);
  const user = me?.user;
  if (!user) return NextResponse.json({ error: "auth required" }, { status: 401 });
  const role = (user as any).role;
  if (role !== "ai-agent" && role !== "staff" && role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    articleId?: number | string;
    feedback?: string;
  } | null;
  if (!body || !body.articleId || !body.feedback) {
    return NextResponse.json(
      { error: "required: articleId, feedback" },
      { status: 400 },
    );
  }
  const feedback = String(body.feedback).trim().slice(0, 400);
  if (!feedback) {
    return NextResponse.json({ error: "feedback may not be empty" }, { status: 400 });
  }

  // 1. Fetch article context.
  const article = (await payload
    .findByID({ collection: "articles", id: body.articleId as any, depth: 1 })
    .catch(() => null)) as any;
  if (!article) {
    return NextResponse.json({ error: "article not found" }, { status: 404 });
  }
  const areaSlug = typeof article.area === "object" ? article.area?.slug : null;
  const topicSlug = typeof article.topic === "object" ? article.topic?.slug : null;
  const personaSlug = typeof article.persona === "object" ? article.persona?.slug : null;
  if (!areaSlug || !topicSlug || !article.title) {
    return NextResponse.json(
      { error: "article missing area / topic / title" },
      { status: 422 },
    );
  }

  // 2. Generate new hero PNG via Vertex Imagen.
  let result;
  try {
    result = await regenerateHero({
      area: areaSlug,
      topic: topicSlug,
      title: String(article.title),
      summary: article.subTitle || undefined,
      persona: personaSlug || undefined,
      feedback,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `imager failed: ${e?.message || "unknown"}` },
      { status: 502 },
    );
  }

  // 3. Create a Payload media doc — Payload's GCS storage adapter
  //    handles upload + sized variants automatically.
  const slugBase = String(article.title)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const filename = `${slugBase}-hero-${Date.now()}.png`;
  const altText = `${article.title} — ${areaSlug} ${topicSlug} editorial photograph`;
  let mediaDoc: any;
  try {
    mediaDoc = await payload.create({
      collection: "media",
      data: {
        alt: altText,
        generatedBy: "imager",
        prompt: result.prompt,
      },
      file: {
        data: result.png,
        mimetype: "image/png",
        name: filename,
        size: result.png.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `media create failed: ${e?.message || "unknown"}` },
      { status: 502 },
    );
  }

  // 4. PATCH article.hero to point at the new media doc.
  try {
    await payload.update({
      collection: "articles",
      id: article.id,
      data: { hero: mediaDoc.id },
      depth: 0,
      overrideAccess: true,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: `article hero update failed: ${e?.message || "unknown"}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    article_id: article.id,
    new_media_id: mediaDoc.id,
    new_media_url: mediaDoc.url,
    width: result.width,
    height: result.height,
    prompt: result.prompt,
    negative_prompt: result.negativePrompt,
  });
}
