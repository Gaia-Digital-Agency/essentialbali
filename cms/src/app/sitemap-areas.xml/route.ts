/**
 * /sitemap-areas.xml — 8 area landing pages.
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
    collection: "areas",
    limit: 100,
    depth: 0,
    sort: "slug",
  });
  const items = (r.docs as any[])
    .filter((a) => a.slug)
    .map((a) => {
      const lastmod = a.updatedAt || a.createdAt || new Date().toISOString();
      return (
        `<url>` +
        `<loc>${esc(`${SITE}/${a.slug}`)}</loc>` +
        `<lastmod>${esc(lastmod)}</lastmod>` +
        `<changefreq>daily</changefreq>` +
        `<priority>0.8</priority>` +
        `</url>`
      );
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
