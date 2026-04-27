import { fetchAreas, fetchTopics, fetchArticles, SITE, AREA_ORDER, TOPIC_ORDER } from "@/lib/payload";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const url = (loc: string, lastmod?: string, priority?: string, freq?: string) =>
  `<url><loc>${esc(loc)}</loc>${
    lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ""
  }${freq ? `<changefreq>${freq}</changefreq>` : ""}${
    priority ? `<priority>${priority}</priority>` : ""
  }</url>`;

export async function GET() {
  const BASE = SITE.baseUrl;

  const [areas, topics, articles] = await Promise.all([
    fetchAreas(),
    fetchTopics(),
    fetchArticles({ limit: 5000 }),
  ]);

  const items: string[] = [];
  items.push(url(`${BASE}/`, undefined, "1.0", "daily"));

  for (const a of areas) {
    items.push(url(`${BASE}/${a.slug}`, undefined, "0.8", "daily"));
    for (const t of topics) {
      items.push(url(`${BASE}/${a.slug}/${t.slug}`, undefined, "0.7", "daily"));
    }
  }
  for (const t of topics) {
    items.push(url(`${BASE}/topic/${t.slug}`, undefined, "0.6", "weekly"));
  }
  for (const article of articles.docs as any[]) {
    if (!article.area?.slug || !article.topic?.slug) continue;
    items.push(
      url(
        `${BASE}/${article.area.slug}/${article.topic.slug}/${article.slug}`,
        article.updatedAt || article.publishedAt,
        "0.7",
      ),
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
