import React from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";

const AREAS = [
  { slug: "canggu", name: "Canggu" },
  { slug: "kuta", name: "Kuta" },
  { slug: "ubud", name: "Ubud" },
  { slug: "jimbaran", name: "Jimbaran" },
  { slug: "denpasar", name: "Denpasar" },
  { slug: "kintamani", name: "Kintamani" },
  { slug: "singaraja", name: "Singaraja" },
  { slug: "nusa-penida", name: "Nusa Penida" },
];

const TOPICS = [
  { slug: "events", name: "Events" },
  { slug: "news", name: "News" },
  { slug: "featured", name: "Featured" },
  { slug: "dine", name: "Dine" },
  { slug: "health-wellness", name: "Health & Wellness" },
  { slug: "nightlife", name: "Nightlife" },
  { slug: "activities", name: "Activities" },
  { slug: "people-culture", name: "People & Culture" },
];

/**
 * 8 × 8 matrix dashboard — the "64 groups" view.
 * Each cell links to:
 *   - Articles list filtered by that (area, topic)
 *   - The Hero Ad slot for the same (area, topic)
 * Article counts show the current published / pending / draft per cell.
 */
export default async function MatrixDashboard() {
  const payload = await getPayload({ config });

  // Resolve area + topic IDs by slug
  const [areasRes, topicsRes] = await Promise.all([
    payload.find({ collection: "areas", limit: 100, depth: 0 }),
    payload.find({ collection: "topics", limit: 100, depth: 0 }),
  ]);
  const areaBySlug = new Map<string, any>(areasRes.docs.map((a: any) => [a.slug, a]));
  const topicBySlug = new Map<string, any>(topicsRes.docs.map((t: any) => [t.slug, t]));

  // Counts per cell — single query, group in JS
  const allArticles = await payload.find({
    collection: "articles",
    limit: 5000,
    depth: 0,
    pagination: false,
  });
  const counts: Record<string, { published: number; pending: number; draft: number; total: number }> = {};
  for (const a of allArticles.docs as any[]) {
    const areaId = typeof a.area === "object" ? a.area?.id : a.area;
    const topicId = typeof a.topic === "object" ? a.topic?.id : a.topic;
    const key = `${areaId}__${topicId}`;
    if (!counts[key]) counts[key] = { published: 0, pending: 0, draft: 0, total: 0 };
    counts[key].total++;
    if (a.status === "published") counts[key].published++;
    else if (a.status === "pending_review") counts[key].pending++;
    else if (a.status === "draft") counts[key].draft++;
  }

  // Hero Ads — to render activate state
  const heroAdsRes = await payload.find({
    collection: "hero-ads",
    limit: 200,
    depth: 0,
    pagination: false,
  });
  const adByCell: Record<string, any> = {};
  for (const ad of heroAdsRes.docs as any[]) {
    const areaId = typeof ad.area === "object" ? ad.area?.id : ad.area;
    const topicId = typeof ad.topic === "object" ? ad.topic?.id : ad.topic;
    adByCell[`${areaId}__${topicId}`] = ad;
  }

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 1400 }}>
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Essential Bali — Content Matrix</h1>
        <p style={{ color: "rgba(0,0,0,0.55)", marginTop: "0.25rem", fontSize: "0.85rem" }}>
          8 areas × 8 topics. Click any cell to open its filtered Articles list. Tap the small ad
          dot to manage the hero ad slot.
        </p>
      </header>

      <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, background: "#fff" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100, fontSize: "0.78rem" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 110, position: "sticky", left: 0, background: "#fafafa" }}>Area / Topic</th>
              {TOPICS.map((t) => (
                <th key={t.slug} style={thStyle}>{t.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AREAS.map((a) => {
              const area = areaBySlug.get(a.slug);
              return (
                <tr key={a.slug}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#fafafa", textAlign: "left", paddingLeft: "1rem" }}>
                    {a.name}
                  </th>
                  {TOPICS.map((t) => {
                    const topic = topicBySlug.get(t.slug);
                    if (!area || !topic) {
                      return <td key={t.slug} style={tdStyle}>—</td>;
                    }
                    const cellKey = `${area.id}__${topic.id}`;
                    const c = counts[cellKey] || { published: 0, pending: 0, draft: 0, total: 0 };
                    const ad = adByCell[cellKey];
                    const articlesHref = `/admin/collections/articles?where[and][0][area][equals]=${area.id}&where[and][1][topic][equals]=${topic.id}`;
                    const adHref = ad ? `/admin/collections/hero-ads/${ad.id}` : `/admin/collections/hero-ads`;
                    return (
                      <td key={t.slug} style={tdStyle}>
                        <Link href={articlesHref} style={cellStyle}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{c.total}</span>
                          <span style={{ display: "block", fontSize: "0.65rem", color: "rgba(0,0,0,0.5)", marginTop: 2 }}>
                            {c.published}p · {c.pending}r · {c.draft}d
                          </span>
                        </Link>
                        <Link
                          href={adHref}
                          title={ad?.active ? "Active hero ad" : "Hero ad placeholder"}
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            marginTop: 6,
                            borderRadius: "50%",
                            background: ad?.active ? "#2ecc71" : "#bbb",
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "rgba(0,0,0,0.5)" }}>
        Cell shows total articles · <b>p</b>ublished · pending <b>r</b>eview · <b>d</b>raft. Dot:
        green = hero ad active, grey = placeholder.
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "0.55rem 0.4rem",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  fontWeight: 600,
  fontSize: "0.72rem",
  color: "rgba(0,0,0,0.65)",
};
const tdStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "0.4rem",
  borderBottom: "1px solid rgba(0,0,0,0.04)",
  borderRight: "1px solid rgba(0,0,0,0.04)",
};
const cellStyle: React.CSSProperties = {
  display: "block",
  padding: "0.35rem",
  borderRadius: 4,
  textDecoration: "none",
  color: "inherit",
};
