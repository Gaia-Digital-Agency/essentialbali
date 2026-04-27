import { SITE } from "@/lib/payload";

export function GET() {
  const body = `User-agent: *
Disallow: /admin
Disallow: /api/
Allow: /

Sitemap: ${SITE.baseUrl}/sitemap.xml
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
