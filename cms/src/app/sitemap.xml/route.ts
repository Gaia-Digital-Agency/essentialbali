/**
 * /sitemap.xml — sitemap index (no URLs, only references to sub-sitemaps).
 *
 * Sub-sitemaps:
 *   /sitemap-areas.xml      — 8 area landing pages
 *   /sitemap-topics.xml     — 8 topic landing pages
 *   /sitemap-articles.xml   — every published article
 */
const SITE = process.env.SITE_BASE_URL || "https://essentialbali.gaiada.online";

const SUB = [
  { loc: `${SITE}/sitemap-areas.xml`, freq: "weekly" },
  { loc: `${SITE}/sitemap-topics.xml`, freq: "weekly" },
  { loc: `${SITE}/sitemap-articles.xml`, freq: "daily" },
];

export const dynamic = "force-dynamic";

export function GET() {
  const now = new Date().toISOString();
  const items = SUB.map(
    (s) =>
      `<sitemap><loc>${s.loc}</loc><lastmod>${now}</lastmod></sitemap>`,
  ).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
