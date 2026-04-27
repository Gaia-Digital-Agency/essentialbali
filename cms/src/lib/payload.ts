import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Cached Payload local API instance for server components.
 * Uses Payload's internal database connection (no HTTP overhead).
 */
let _payload: Awaited<ReturnType<typeof getPayload>> | null = null;
export const payload = async () => {
  if (!_payload) _payload = await getPayload({ config });
  return _payload;
};

export const SITE = {
  name: "Essential Bali",
  tagline: "Bali, by area. Events, dine, wellness, nightlife — all the essentials.",
  baseUrl: process.env.SITE_BASE_URL || "https://essentialbali.gaiada.online",
};

export const TOPIC_ORDER = [
  "events",
  "news",
  "featured",
  "dine",
  "health-wellness",
  "nightlife",
  "activities",
  "people-culture",
];

export const AREA_ORDER = [
  "canggu",
  "kuta",
  "ubud",
  "jimbaran",
  "denpasar",
  "kintamani",
  "singaraja",
  "nusa-penida",
];

export type AreaDoc = {
  id: number | string;
  slug: string;
  name: string;
  intro?: string;
  hero?: { url?: string; alt?: string } | null;
};

export type TopicDoc = {
  id: number | string;
  slug: string;
  name: string;
  intro?: string;
  icon?: string | null;
};

export type ArticleDoc = {
  id: number | string;
  title: string;
  slug: string;
  subTitle?: string;
  body?: any;
  hero?: { url?: string; alt?: string } | null;
  area?: AreaDoc;
  topic?: TopicDoc;
  persona?: { name: string; slug: string };
  publishedAt?: string;
  status: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

export const fetchAreas = async () => {
  const p = await payload();
  const r = await p.find({ collection: "areas", limit: 100, depth: 1 });
  // Stable order
  const bySlug = new Map<string, AreaDoc>();
  for (const a of r.docs as AreaDoc[]) bySlug.set(a.slug, a);
  return AREA_ORDER.map((s) => bySlug.get(s)).filter(Boolean) as AreaDoc[];
};

export const fetchTopics = async () => {
  const p = await payload();
  const r = await p.find({ collection: "topics", limit: 100, depth: 0 });
  const bySlug = new Map<string, TopicDoc>();
  for (const t of r.docs as TopicDoc[]) bySlug.set(t.slug, t);
  return TOPIC_ORDER.map((s) => bySlug.get(s)).filter(Boolean) as TopicDoc[];
};

export const fetchAreaBySlug = async (slug: string) => {
  const p = await payload();
  const r = await p.find({
    collection: "areas",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return (r.docs[0] as AreaDoc) || null;
};

export const fetchTopicBySlug = async (slug: string) => {
  const p = await payload();
  const r = await p.find({
    collection: "topics",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return (r.docs[0] as TopicDoc) || null;
};

export const fetchArticles = async ({
  areaSlug,
  topicSlug,
  limit = 24,
  page = 1,
}: {
  areaSlug?: string;
  topicSlug?: string;
  limit?: number;
  page?: number;
}) => {
  const p = await payload();
  const where: any = { status: { equals: "published" } };

  if (areaSlug) {
    const area = await fetchAreaBySlug(areaSlug);
    if (!area) return { docs: [], totalDocs: 0, totalPages: 0 };
    where.area = { equals: area.id };
  }
  if (topicSlug) {
    const topic = await fetchTopicBySlug(topicSlug);
    if (!topic) return { docs: [], totalDocs: 0, totalPages: 0 };
    where.topic = { equals: topic.id };
  }
  const r = await p.find({
    collection: "articles",
    where,
    limit,
    page,
    depth: 2,
    sort: "-publishedAt",
  });
  return r;
};

export const fetchArticleBySlug = async (
  areaSlug: string,
  topicSlug: string,
  slug: string,
) => {
  const area = await fetchAreaBySlug(areaSlug);
  const topic = await fetchTopicBySlug(topicSlug);
  if (!area || !topic) return null;
  const p = await payload();
  const r = await p.find({
    collection: "articles",
    where: {
      and: [
        { slug: { equals: slug } },
        { area: { equals: area.id } },
        { topic: { equals: topic.id } },
        { status: { equals: "published" } },
      ],
    },
    limit: 1,
    depth: 2,
  });
  return (r.docs[0] as ArticleDoc) || null;
};

export const fetchHeroAd = async (areaId: any, topicId: any) => {
  const p = await payload();
  const r = await p.find({
    collection: "hero-ads",
    where: {
      and: [{ area: { equals: areaId } }, { topic: { equals: topicId } }],
    },
    limit: 1,
    depth: 2,
  });
  return r.docs[0] || null;
};
