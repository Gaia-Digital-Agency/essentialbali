/**
 * Seed 64 placeholder Articles (1 per area × topic). All draft so they never go public.
 * Idempotent — uses source.hash = `placeholder:{area}:{topic}` to skip if already seeded.
 *
 * Run once: `pnpm tsx src/seed-articles-placeholders.ts`
 */
import { getPayload } from "payload";
import config from "./payload.config.js";

const AREAS = [
  "canggu",
  "kuta",
  "ubud",
  "jimbaran",
  "denpasar",
  "kintamani",
  "singaraja",
  "nusa-penida",
];
const TOPICS = [
  "events",
  "news",
  "featured",
  "dine",
  "health-wellness",
  "nightlife",
  "activities",
  "people-culture",
];

// Minimal valid Lexical body with a single text node.
const buildBody = (areaName: string, topicName: string) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: "ltr",
        children: [
          {
            type: "text",
            version: 1,
            mode: "normal",
            style: "",
            text: `Placeholder for ${areaName} — ${topicName}.`,
            detail: 0,
            format: 0,
          },
        ],
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  },
});

async function main() {
  const payload = await getPayload({ config });
  const areasRes = await payload.find({ collection: "areas", limit: 100, depth: 0 });
  const topicsRes = await payload.find({ collection: "topics", limit: 100, depth: 0 });
  const areaBySlug = new Map<string, any>(areasRes.docs.map((a: any) => [a.slug, a]));
  const topicBySlug = new Map<string, any>(topicsRes.docs.map((t: any) => [t.slug, t]));

  let created = 0,
    skipped = 0;
  for (const aSlug of AREAS) {
    for (const tSlug of TOPICS) {
      const area = areaBySlug.get(aSlug);
      const topic = topicBySlug.get(tSlug);
      if (!area || !topic) continue;

      const hash = `placeholder:${aSlug}:${tSlug}`;
      const existing = await payload.find({
        collection: "articles",
        where: { "source.hash": { equals: hash } },
        limit: 1,
      });
      if (existing.docs.length) {
        skipped++;
        continue;
      }
      const title = `${area.name} — ${topic.name} (placeholder)`;
      const slug = `placeholder-${aSlug}-${tSlug}`;
      await payload.create({
        collection: "articles",
        data: {
          title,
          slug,
          area: area.id as any,
          topic: topic.id as any,
          status: "draft",
          body: buildBody(area.name, topic.name) as any,
          source: { hash },
          subTitle: `Placeholder slot for ${area.name} ${topic.name} content`,
        },
      });
      created++;
    }
  }

  console.log(`✅ Articles placeholders: ${created} created, ${skipped} already existed (target: 64)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ failed:", err);
  process.exit(1);
});
