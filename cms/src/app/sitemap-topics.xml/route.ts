/**
 * /sitemap-topics.xml — 8 topic landing pages + 64 area×topic pages.
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
  const [topics, areas] = await Promise.all([
    payload.find({ collection: "topics", limit: 100, depth: 0, sort: "slug" }),
    payload.find({ collection: "areas", limit: 100, depth: 0, sort: "slug" }),
  ]);

  const now = new Date().toISOString();
  const items: string[] = [];

  // topic landings
  for (const t of topics.docs as any[]) {
    if (!t.slug) continue;
    items.push(
      `<url><loc>${esc(`${SITE}/${t.slug}`)}</loc><lastmod>${esc(t.updatedAt || now)}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`,
    );
  }

  // area × topic combos
  for (const a of areas.docs as any[]) {
    if (!a.slug) continue;
    for (const t of topics.docs as any[]) {
      if (!t.slug) continue;
      items.push(
        `<url><loc>${esc(`${SITE}/${a.slug}/${t.slug}`)}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>`,
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items.join("")}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
