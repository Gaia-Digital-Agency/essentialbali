/**
 * Generate an area-only hero (area set, topic NULL) via Vertex Imagen.
 *
 * POST /api/hero-ads/generate-area-hero
 *   { areaSlug: string,
 *     headline?: string,        // defaults to 'Explore {Area name}'
 *     subline?: string,         // defaults to a stock area-themed line
 *     ctaText?: string,         // defaults to 'Explore {Area}'
 *     ctaUrl?: string }         // defaults to /{areaSlug}
 *
 * Auth: admin or editor only.
 *
 * What it does:
 *   1. Looks up the area row.
 *   2. Builds an Imager prompt anchored on the area cue (no topic — this
 *      is a wide editorial establishing shot of the area itself).
 *   3. Calls Vertex Imagen via the existing imager-regenerate lib —
 *      same prompt construction the admin's "🔁 Regenerate hero" uses.
 *   4. Uploads the PNG to Payload's media collection. Tagged
 *      source=imager, kind=hero, area=<slug>.
 *   5. Upserts the (area, NULL) hero_ads row — creates if missing,
 *      updates `creative + active=true + headline + subline + ctaActive
 *      + ctaText + ctaUrl + label` if existing.
 *
 * Returns: { ok, areaSlug, mediaId, heroAdId, prompt, width, height }
 *
 * Used by the area-hero-bulk caller: a small client loops through the
 * 8 area slugs and POSTs to this once each.
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { regenerateHero } from "@/lib/imager-regenerate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: req.headers });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (user as any).role;
    if (role !== "admin" && role !== "editor" && role !== "ai-agent") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      areaSlug?: string;
      headline?: string;
      subline?: string;
      ctaText?: string;
      ctaUrl?: string;
    };
    const areaSlug = String(body.areaSlug || "").trim().toLowerCase();
    if (!areaSlug) {
      return NextResponse.json({ error: "areaSlug required" }, { status: 400 });
    }

    // 1. Resolve area
    const areaRes = await payload.find({
      collection: "areas",
      where: { slug: { equals: areaSlug } },
      limit: 1,
      depth: 0,
    });
    const area = areaRes.docs[0] as any;
    if (!area) {
      return NextResponse.json(
        { error: `area '${areaSlug}' not found` },
        { status: 404 },
      );
    }

    // 2 + 3. Build prompt and call Imager.
    //    No topic → use 'featured' as the composition cue (wide editorial
    //    establishing shot — the cleanest fit for an area-anchored hero
    //    with no topic specialisation).
    const title = `${area.name} — Essential Bali`;
    const summary = `Wide editorial establishing shot of ${area.name}, capturing what makes it unmistakably this place.`;
    const result = await regenerateHero({
      area: areaSlug,
      topic: "featured",
      title,
      summary,
      persona: "putu",
      feedback: "no people in close-up, no text, no signage, on-location not generic",
    });

    // 4. Upload PNG to Payload media collection.
    //    Sets the canonical media metadata so the canonical-naming hook
    //    (N3) writes the filename `imager_hero_<area>_area-only_<title>-<nano>.webp`.
    const mediaDoc = await payload.create({
      collection: "media",
      data: {
        alt: `${area.name} — area hero`,
        source: "imager",
        kind: "hero",
        area: areaSlug,
        topic: null,
        prompt: result.prompt,
      } as any,
      file: {
        data: result.png,
        mimetype: "image/png",
        name: `area-hero-${areaSlug}.png`,
        size: result.png.byteLength,
      },
    });

    // 5. Upsert (area, NULL) hero_ads row
    const existingRes = await payload.find({
      collection: "hero-ads",
      where: {
        and: [
          { area: { equals: area.id } },
          { topic: { exists: false } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    const existing = existingRes.docs[0] as any;

    const headline = body.headline || `Explore ${area.name}`;
    const subline =
      body.subline ||
      `Curated news, events, dining, wellness, nightlife, activities, and culture from ${area.name}.`;
    const ctaText = body.ctaText || `Explore ${area.name}`;
    const ctaUrl = body.ctaUrl || `/${areaSlug}`;
    const data = {
      area: area.id,
      topic: null,
      label: `Hero > ${area.name} > (any topic)`,
      creative: mediaDoc.id,
      active: true,
      headline,
      subline,
      ctaActive: true,
      ctaText,
      ctaUrl,
      linkUrl: `/${areaSlug}`,
    };

    let heroAd: any;
    if (existing) {
      heroAd = await payload.update({
        collection: "hero-ads",
        id: existing.id,
        data: data as any,
      });
    } else {
      heroAd = await payload.create({
        collection: "hero-ads",
        data: data as any,
      });
    }

    return NextResponse.json({
      ok: true,
      areaSlug,
      mediaId: mediaDoc.id,
      heroAdId: heroAd.id,
      width: result.width,
      height: result.height,
      prompt: result.prompt,
    });
  } catch (err: any) {
    console.error("[generate-area-hero] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 },
    );
  }
}
