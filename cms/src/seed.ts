
import { getPayload } from "payload";
import config from "./payload.config.js";

const AREAS = [
  { slug: "canggu", name: "Canggu", lat: -8.6478, lng: 115.1385 },
  { slug: "kuta", name: "Kuta", lat: -8.7233, lng: 115.1683 },
  { slug: "ubud", name: "Ubud", lat: -8.5069, lng: 115.2625 },
  { slug: "jimbaran", name: "Jimbaran", lat: -8.7905, lng: 115.1614 },
  { slug: "denpasar", name: "Denpasar", lat: -8.6705, lng: 115.2126 },
  { slug: "kintamani", name: "Kintamani", lat: -8.2725, lng: 115.36 },
  { slug: "singaraja", name: "Singaraja", lat: -8.1146, lng: 115.0884 },
  { slug: "nusa-penida", name: "Nusa Penida", lat: -8.7278, lng: 115.5444 },
];

const TOPICS = [
  // showsHero=false on Events because the events listing template
  // (EventsV3.tsx) renders its own date/time/venue header instead of
  // a generic hero image. Hero rows for events cells are skipped.
  { slug: "events", name: "Events", showsHero: false },
  { slug: "news", name: "News" },
  { slug: "featured", name: "Featured" },
  { slug: "dine", name: "Dine" },
  { slug: "health-wellness", name: "Health & Wellness" },
  { slug: "nightlife", name: "Nightlife" },
  { slug: "activities", name: "Activities" },
  { slug: "people-culture", name: "People & Culture" },
];

const PERSONAS = [
  {
    slug: "maya",
    name: "Maya",
    bio: "Local foodie who has eaten at every warung worth eating at. Warm, sensory, opinionated.",
    voiceNotes: "First-person occasionally. Names ingredients specifically. Strong opinions politely held.",
    bestForTopics: ["dine", "featured"],
  },
  {
    slug: "komang",
    name: "Komang",
    bio: "Activities and wellness guide. Practical, calm, safety-aware.",
    voiceNotes: "Clear instructions. Respect for difficulty levels. Names trails, dive sites, and instructors precisely.",
    bestForTopics: ["activities", "health-wellness"],
  },
  {
    slug: "putu",
    name: "Putu",
    bio: "Cultural insider. Anthropology background. Thoughtful, never cringe.",
    voiceNotes: "Italicizes Balinese terms on first use. Provides context for ceremonies. Avoids exoticization.",
    bestForTopics: ["people-culture", "news"],
  },
  {
    slug: "sari",
    name: "Sari",
    bio: "Nightlife and events reporter. Energetic, on-the-pulse.",
    voiceNotes: "Short paragraphs. Names DJs, venues, dates precisely. No hype-clichés.",
    bestForTopics: ["nightlife", "events"],
  },
];

async function ensureUnique<T extends { slug: string }>(
  payload: any,
  collection: string,
  items: T[],
): Promise<Record<string, string | number>> {
  const ids: Record<string, string | number> = {};
  for (const item of items) {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: item.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      ids[item.slug] = existing.docs[0].id;
      continue;
    }
    const created = await payload.create({ collection, data: item });
    ids[item.slug] = created.id;
    console.log(`  ✓ created ${collection}/${item.slug}`);
  }
  return ids;
}

async function main() {
  console.log("→ Connecting to Payload...");
  const payload = await getPayload({ config });

  // 1. Admin user (idempotent)
  console.log("\n1. Admin user");
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "azlan@gaiada.com";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  const existingAdmin = await payload.find({
    collection: "users",
    where: { email: { equals: adminEmail } },
    limit: 1,
  });
  if (!existingAdmin.docs.length) {
    await payload.create({
      collection: "users",
      data: { email: adminEmail, password: adminPass, name: "Azlan", role: "admin" },
    });
    console.log(`  ✓ created admin ${adminEmail}  (password: ${adminPass} — change after first login)`);
  } else {
    console.log(`  ✓ admin ${adminEmail} already exists`);
  }

  // 2. Areas
  console.log("\n2. Areas");
  const areaIds = await ensureUnique(payload, "areas", AREAS);

  // 3. Topics
  console.log("\n3. Topics");
  const topicIds = await ensureUnique(payload, "topics", TOPICS);

  // 4. Personas
  console.log("\n4. Personas");
  for (const p of PERSONAS) {
    const existing = await payload.find({
      collection: "personas",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      console.log(`  ✓ persona ${p.slug} already exists`);
      continue;
    }
    await payload.create({
      collection: "personas",
      data: {
        slug: p.slug,
        name: p.name,
        bio: p.bio,
        voiceNotes: p.voiceNotes,
        topics: p.bestForTopics.map((t) => topicIds[t]),
      },
    });
    console.log(`  ✓ created persona/${p.slug}`);
  }

  // 5. Hero-ad placeholders for cells whose topic has showsHero=true.
  //    Topics with showsHero=false (e.g. Events) are skipped — their
  //    listing template handles its own header layout. Default count
  //    today: 8 areas × 7 topics = 56 cell rows + 1 homepage = 57.
  const heroTopics = TOPICS.filter((t) => t.showsHero !== false);
  console.log(`\n5. Hero ad placeholders (${AREAS.length} × ${heroTopics.length} = ${AREAS.length * heroTopics.length} cells)`);
  let created = 0,
    existed = 0;
  for (const area of AREAS) {
    for (const topic of heroTopics) {
      const existing = await payload.find({
        collection: "hero-ads",
        where: {
          and: [
            { area: { equals: areaIds[area.slug] } },
            { topic: { equals: topicIds[topic.slug] } },
          ],
        },
        limit: 1,
      });
      if (existing.docs.length) {
        existed++;
        continue;
      }
      await payload.create({
        collection: "hero-ads",
        data: {
          area: areaIds[area.slug] as any,
          topic: topicIds[topic.slug] as any,
          active: false,
          label: `Ads space > ${area.name} > ${topic.name}`,
        },
      });
      created++;
    }
  }
  console.log(`  ✓ ${created} created, ${existed} already existed (target: 64)`);

  console.log("\n✅ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
