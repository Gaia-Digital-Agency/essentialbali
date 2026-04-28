/**
 * /sitemap-articles.xml — every published article.
 *
 * If the article count grows beyond ~50,000, this should split further into
 * /sitemap-articles-1.xml, /sitemap-articles-2.xml, etc. (Google's per-file
 * limit is 50,000 URLs / 50 MB.)
 */
import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";

const SITE = process.env.SITE_BASE_URL || "https://essentialbali.gaiada.online";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPayload({ config });
  const r = await payload.find({
    collection: "articles",
    where: { status: { equals: "published" } },
    limit: 50000,
    depth: 1,
    pagination: false,
    sort: "-publishedAt",
  });

  const items: string[] = [];
  // home + bare-area + bare-topic combos already covered in /sitemap-areas.xml
  // and /sitemap-topics.xml — keep this file articles-only.
  for (const a of r.docs as any[]) {
    if (!a.slug) continue;
    const areaSlug = typeof a.area === "object" ? a.area?.slug : null;
    const topicSlug = typeof a.topic === "object" ? a.topic?.slug : null;
    if (!areaSlug || !topicSlug) continue;
    const lastmod = a.updatedAt || a.publishedAt || new Date().toISOString();
    items.push(
      `<url>` +
        `<loc>${esc(`${SITE}/${areaSlug}/${topicSlug}/${a.slug}`)}</loc>` +
        `<lastmod>${esc(lastmod)}</lastmod>` +
        `<changefreq>weekly</changefreq>` +
        `<priority>0.7</priority>` +
        `</url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.join("")}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
