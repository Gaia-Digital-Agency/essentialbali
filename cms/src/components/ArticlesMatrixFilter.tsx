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
  { slug: "health-wellness", name: "Health" },
  { slug: "nightlife", name: "Nightlife" },
  { slug: "activities", name: "Activities" },
  { slug: "people-culture", name: "Culture" },
];

const STATUSES: Array<{ key: string; label: string; color: string }> = [
  { key: "", label: "All", color: "#374151" },
  { key: "pending_review", label: "Pending Review", color: "#d97706" },
  { key: "draft", label: "Drafts", color: "#6b7280" },
  { key: "approved", label: "Approved", color: "#2563eb" },
  { key: "published", label: "Published", color: "#16a34a" },
  { key: "rejected", label: "Rejected", color: "#dc2626" },
];

const TARGET = 20; // target articles per cell

/**
 * Renders ABOVE the Articles list table (Payload `beforeListTable` component).
 * - Status filter chips
 * - 8 × 8 matrix with per-cell counts; clicking a cell filters the list below
 *   via URL params Payload understands (`where[and][0][area][equals]=…`).
 *
 * Color logic per cell (vs target):
 *   0          → red tint
 *   1..target-1 → yellow tint
 *   ≥ target   → green tint
 */
export default async function ArticlesMatrixFilter() {
  const payload = await getPayload({ config });

  const [areasRes, topicsRes, articlesRes] = await Promise.all([
    payload.find({ collection: "areas", limit: 100, depth: 0 }),
    payload.find({ collection: "topics", limit: 100, depth: 0 }),
    payload.find({
      collection: "articles",
      limit: 5000,
      depth: 0,
      pagination: false,
    }),
  ]);

  const areaBySlug = new Map<string, any>(areasRes.docs.map((a: any) => [a.slug, a]));
  const topicBySlug = new Map<string, any>(topicsRes.docs.map((t: any) => [t.slug, t]));

  type Counts = { total: number; published: number; pending: number; draft: number };
  const cell: Record<string, Counts> = {};
  for (const a of articlesRes.docs as any[]) {
    const aId = typeof a.area === "object" ? a.area?.id : a.area;
    const tId = typeof a.topic === "object" ? a.topic?.id : a.topic;
    const k = `${aId}__${tId}`;
    if (!cell[k]) cell[k] = { total: 0, published: 0, pending: 0, draft: 0 };
    cell[k].total++;
    if (a.status === "published") cell[k].published++;
    else if (a.status === "pending_review") cell[k].pending++;
    else if (a.status === "draft") cell[k].draft++;
  }

  const cellBg = (n: number): string =>
    n === 0
      ? "rgba(220, 38, 38, 0.06)"
      : n < TARGET
        ? "rgba(217, 119, 6, 0.08)"
        : "rgba(22, 163, 74, 0.10)";

  const cellBorder = (n: number): string =>
    n === 0
      ? "rgba(220, 38, 38, 0.22)"
      : n < TARGET
        ? "rgba(217, 119, 6, 0.22)"
        : "rgba(22, 163, 74, 0.30)";

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.85rem" }}>
        <span style={chipLabelStyle}>STATUS</span>
        {STATUSES.map((s) => {
          const href = s.key
            ? `/admin/collections/articles?where[and][0][status][equals]=${s.key}`
            : "/admin/collections/articles";
          return (
            <Link key={s.key || "all"} href={href} style={chipStyle(s.color)}>
              {s.label}
            </Link>
          );
        })}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, position: "sticky", left: 0, background: "#fafafa", textAlign: "left" }}>
                Area / Topic
              </th>
              {TOPICS.map((t) => (
                <th key={t.slug} style={thStyle} title={t.name}>
                  {t.name}
                </th>
              ))}
              <th style={{ ...thStyle, fontWeight: 600 }}>Σ</th>
            </tr>
          </thead>
          <tbody>
            {AREAS.map((a) => {
              const area = areaBySlug.get(a.slug);
              let rowSum = 0;
              const cells = TOPICS.map((t) => {
                const topic = topicBySlug.get(t.slug);
                if (!area || !topic)
                  return (
                    <td key={t.slug} style={tdStyle}>
                      <span style={{ color: "#aaa" }}>—</span>
                    </td>
                  );
                const k = `${area.id}__${topic.id}`;
                const c = cell[k] || { total: 0, published: 0, pending: 0, draft: 0 };
                rowSum += c.total;
                const href = `/admin/collections/articles?where[and][0][area][equals]=${area.id}&where[and][1][topic][equals]=${topic.id}`;
                return (
                  <td key={t.slug} style={{ ...tdStyle, padding: 0 }}>
                    <Link
                      href={href}
                      style={{
                        display: "block",
                        padding: "0.45rem 0.4rem",
                        textDecoration: "none",
                        color: "var(--theme-text)",
                        background: cellBg(c.total),
                        borderLeft: `2px solid ${cellBorder(c.total)}`,
                      }}
                      title={`${a.name} · ${t.name}\n${c.total} total — ${c.published} published, ${c.pending} pending, ${c.draft} draft (target ${TARGET})`}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                        {c.total}
                        <span style={{ opacity: 0.6, fontWeight: 400 }}> / {TARGET}</span>
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "var(--theme-elevation-500, var(--theme-text))", opacity: 0.85 }}>
                        {c.published > 0 && <span style={{ color: "#16a34a" }}>{c.published}p </span>}
                        {c.pending > 0 && <span style={{ color: "#d97706" }}>{c.pending}r </span>}
                        {c.draft > 0 && <span>{c.draft}d</span>}
                      </div>
                    </Link>
                  </td>
                );
              });
              return (
                <tr key={a.slug}>
                  <th
                    style={{
                      ...thStyle,
                      position: "sticky",
                      left: 0,
                      background: "var(--theme-elevation-100)",
                      color: "var(--theme-text)",
                      textAlign: "left",
                      paddingLeft: "0.85rem",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                    }}
                  >
                    {a.name}
                  </th>
                  {cells}
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{rowSum}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "0.7rem", color: "var(--theme-elevation-500, var(--theme-text))", opacity: 0.75, margin: "0.55rem 0 0" }}>
        Click any cell to filter the list below. Cell shows <b>n / 20</b> total &middot; p=published, r=pending review, d=draft.
        Red = empty &middot; yellow = below target &middot; green = at target.
      </p>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  margin: "1rem 0 1.25rem",
  padding: "1rem 1.25rem",
  background: "var(--theme-elevation-50)",
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "var(--style-radius-s, 4px)",
  color: "var(--theme-text)",
};
const tableStyle: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  minWidth: 900,
  fontSize: "0.78rem",
  color: "var(--theme-text)",
};
const thStyle: React.CSSProperties = {
  padding: "0.45rem 0.4rem",
  textAlign: "center",
  borderBottom: "1px solid var(--theme-elevation-150)",
  fontWeight: 500,
  fontSize: "0.7rem",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.85,
};
const tdStyle: React.CSSProperties = {
  padding: "0.4rem",
  textAlign: "center",
  borderBottom: "1px solid var(--theme-elevation-100)",
  color: "var(--theme-text)",
};

const chipLabelStyle: React.CSSProperties = {
  alignSelf: "center",
  fontSize: "0.65rem",
  letterSpacing: "0.08em",
  color: "var(--theme-elevation-500, var(--theme-text))",
  opacity: 0.7,
  marginRight: "0.4rem",
};
const chipStyle = (color: string): React.CSSProperties => ({
  padding: "0.32rem 0.7rem",
  borderRadius: 999,
  background: "var(--theme-elevation-100)",
  border: `1px solid ${color}55`,
  color,
  fontSize: "0.72rem",
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
});
