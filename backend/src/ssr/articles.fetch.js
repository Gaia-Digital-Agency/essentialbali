import payload from "../lib/payload.client.js";
import { lexicalToHtml } from "../lib/lexical-to-html.js";

/**
 * Map a Payload article doc → legacy SSR article shape.
 *
 * Frontend expects fields like: id, slug_title, title, slug_country,
 * slug_category, article_post (HTML), featured_image_url, publishedAt, etc.
 *
 * Payload provides: id, slug, title, area: {slug,name,id}, topic: {slug,name,id},
 * body (Lexical), hero (media ref or expanded), publishedAt, etc.
 *
 * Body conversion: Payload v3 stores rich-text as a Lexical JSON tree.
 * The legacy frontend renders article_post via dangerouslySetInnerHTML
 * expecting an HTML string, so we serialise the tree on the server.
 */
const mapPayloadArticle = (a) => {
  if (!a) return null;
  const area = typeof a.area === "object" ? a.area : null;
  const topic = typeof a.topic === "object" ? a.topic : null;
  const persona = typeof a.persona === "object" ? a.persona : null;
  const hero = typeof a.hero === "object" ? a.hero : null;

  // Lexical → HTML for the legacy article_post field.
  // (a.body is the structured tree, kept on the wire for any future
  // client-side renderer that wants the original.)
  let bodyHtml = "";
  if (typeof a.body === "string") {
    bodyHtml = lexicalToHtml(a.body); // handles JSON-string + plain-string
  } else if (a.body) {
    bodyHtml = lexicalToHtml(a.body);
  }

  return {
    id: a.id,
    slug_title: a.slug,
    slug: a.slug,
    title: a.title,
    sub_title: a.subTitle || null,
    article_post: bodyHtml,
    body: a.body,
    status: a.status,
    slug_country: area?.slug || null,
    slug_category: topic?.slug || null,
    id_country: area?.id || null,
    id_city: null,
    id_region: null,
    category: topic?.id || null,
    parent_category_id: null,
    author: persona?.name || null,
    persona: persona ? { id: persona.id, slug: persona.slug, name: persona.name } : null,
    featured_image: hero?.id || null,
    featured_image_url: hero?.url || null,
    featured_image_4_3: null,
    featured_image_16_9: null,
    meta_data: a.seo || null,
    publishedAt: a.publishedAt || null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    pinned: false,
    tags: a.tags || [],
  };
};

export const fetchArticleData = async (slug, _ip) => {
  try {
    const res = await payload.find("articles", {
      "where[slug][equals]": slug,
      "where[status][equals]": "published",
      depth: 2,
      limit: 1,
    });
    const articles = (res?.docs || []).map(mapPayloadArticle).filter(Boolean);
    return { articles };
  } catch (e) {
    console.error("[ssr/articles.fetch:fetchArticleData] Payload error:", e.message);
    return { articles: [] };
  }
};

export const fetchArticlesData = async (query = {}) => {
  try {
    const params = {
      depth: 2,
      limit: query.limit && query.limit > 0 ? query.limit : 50,
      page: query.page || 1,
      sort: "-publishedAt",
      "where[status][equals]": "published",
    };
    // Translate legacy query.country/category slugs to Payload area/topic id filters.
    // For simplicity, we filter post-hoc when slugs are passed (low article count).
    const res = await payload.find("articles", params);
    let articles = (res?.docs || []).map(mapPayloadArticle).filter(Boolean);
    if (query.country) {
      articles = articles.filter((a) => a.slug_country === query.country);
    }
    if (query.category) {
      articles = articles.filter((a) => a.slug_category === query.category);
    }
    return {
      articles,
      pagination: {
        page: res?.page || 1,
        limit: res?.limit || 50,
        totalData: res?.totalDocs || articles.length,
        totalPages: res?.totalPages || 1,
      },
    };
  } catch (e) {
    console.error("[ssr/articles.fetch:fetchArticlesData] Payload error:", e.message);
    return { articles: [], pagination: { page: 1, limit: 50, totalData: 0, totalPages: 0 } };
  }
};

export const fetchArticleDataByKeyword = async (q) => {
  try {
    const res = await payload.find("articles", {
      "where[status][equals]": "published",
      "where[title][like]": q,
      depth: 1,
      limit: 7,
    });
    const articles = (res?.docs || []).map(mapPayloadArticle).filter(Boolean);
    return { articles };
  } catch (e) {
    console.error("[ssr/articles.fetch:fetchArticleDataByKeyword] Payload error:", e.message);
    return { articles: [] };
  }
};

export const getInitialArticleHeroImage = () => false;
