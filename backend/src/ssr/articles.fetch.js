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

  // Event metadata is surfaced at TWO keys:
  //   eventDetails — the modern shape (matches the Payload field group)
  //   meta_data    — back-compat shape for the legacy templates that
  //                  still read meta_data.start_date etc. Mapped from
  //                  eventDetails so EventsV3 + SingleEventV2 keep
  //                  working both before and after their rewrite.
  // (We also fold the SEO group into meta_data so the existing SEO
  // helmets aren't broken — the legacy code reads meta_data.metaTitle
  // etc.)
  const ed = a.eventDetails || null;
  const metaData = {
    ...(a.seo || {}),
    ...(ed
      ? {
          start_date: ed.startDate || null,
          end_date: ed.endDate || null,
          start_time: ed.startTime || null,
          end_time: ed.endTime || null,
          time_of_day: ed.timeOfDay || null,
          venue_name: ed.venueName || null,
          venue_address: ed.venueAddress || null,
          venue_lat: ed.venueLat ?? null,
          venue_lng: ed.venueLng ?? null,
          ticket_url: ed.ticketUrl || null,
          recurrence: ed.recurrence || null,
        }
      : {}),
  };

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
    eventDetails: ed,
    meta_data: metaData,
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
    // Translate legacy query keys → Payload `where[…]` filters so the
    // database does the work and `limit` returns the right N. The legacy
    // SSR (content.fetch.js) passes either:
    //   - query.id_country = <numeric area id>  (from baseQuery)
    //   - query.category   = <numeric topic id>  (single match)
    //   - query.category   = [<id>, <id>, …]    (exclude-slugs → include set)
    //   - query.country / query.category = <slug string>  (other call sites)
    if (query.id_country != null) {
      params["where[area][equals]"] = query.id_country;
    } else if (typeof query.country === "string" && query.country) {
      params["where[area.slug][equals]"] = query.country;
    }
    // Slug filter — pass through so getArticleBySlug() in the SPA
    // PathResolver can correctly determine "is the URL last-segment
    // an article?". Without this, the handler returned the full set
    // and PathResolver mis-routed every listing URL to ARTICLE_PAGE
    // once any article was published.
    if (typeof query.slug === "string" && query.slug.trim()) {
      params["where[slug][equals]"] = query.slug.trim();
    }

    // Phase 0 v4 — homepage `group` filter (5-value enum on articles).
    // The HomeTemplate v4 calls fetchArticlesData with { group: "<X>" }
    // for each homepage section.
    if (typeof query.group === "string" && query.group) {
      params["where[group][equals]"] = query.group;
    }

    if (Array.isArray(query.category) && query.category.length > 0) {
      params["where[topic][in]"] = query.category.join(",");
    } else if (query.category != null && query.category !== "") {
      const numeric =
        typeof query.category === "number" ||
        /^\d+$/.test(String(query.category));
      params[numeric ? "where[topic][equals]" : "where[topic.slug][equals]"] =
        query.category;
    }

    // Event-only filters used by the EventsV3 listing template.
    // Passed through as legacy keys (metaData_start_date / _end_date /
    // _start_time / _end_time) by the frontend service layer; here we
    // translate them to the new eventDetails.* Payload where-clauses.
    if (query.metaData_start_date) {
      params["where[eventDetails.startDate][greater_than_equal]"] =
        query.metaData_start_date;
    }
    if (query.metaData_end_date) {
      params["where[eventDetails.startDate][less_than_equal]"] =
        query.metaData_end_date;
    }
    if (query.metaData_start_time) {
      params["where[eventDetails.startTime][greater_than_equal]"] =
        query.metaData_start_time;
    }
    if (query.metaData_end_time) {
      params["where[eventDetails.startTime][less_than_equal]"] =
        query.metaData_end_time;
    }
    if (query.metaData_time_of_day) {
      params["where[eventDetails.timeOfDay][equals]"] =
        query.metaData_time_of_day;
    }

    const res = await payload.find("articles", params);
    const articles = (res?.docs || []).map(mapPayloadArticle).filter(Boolean);
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

/**
 * SSR-inject the daily homepage-feed (the 4×4 grid backing
 * <DailyEssentials>). Reading the same /api/home-daily-feed endpoint
 * the React component would otherwise hit client-side, but resolving
 * it during SSR so the populated grid lands in __INITIAL_DATA__ and
 * the component renders cards directly — no skeleton-to-loaded swap,
 * no CLS event.
 *
 * Returns the doc shape Payload returns: { id, date, slots: [{ slotIndex, article, topic }] }
 * — already expanded to depth=2 so article.hero is a Media object.
 *
 * Falls back to null on any error; the React component then runs its
 * normal client-side fetch and the page shows the skeleton briefly.
 */
export const fetchDailyFeed = async () => {
  try {
    const res = await payload.find("home-daily-feed", {
      limit: 1,
      sort: "-date",
      depth: 2,
    });
    return (res?.docs || [])[0] || null;
  } catch (e) {
    console.error("[ssr/articles.fetch:fetchDailyFeed]", e?.message || e);
    return null;
  }
};

/**
 * For LCP preload: return the homepage hero-ad image URL when the
 * initial route is LISTING_HOME, else false. The SSR template
 * (backend/app.js) injects a <link rel="preload" as="image"
 * fetchpriority="high"> for whatever URL we return here, so the
 * browser starts downloading the LCP image in parallel with JS
 * parsing instead of after HeroBanner hydrates and fires its own
 * fetch.
 *
 * Resolves the homepage default (area=NULL, topic=NULL, active=true)
 * via Payload REST. Falls back to false on any failure — preload is
 * a hint, not a hard requirement; an empty hint is safe.
 */
export const getInitialArticleHeroImage = async (initialRoute) => {
  if (!initialRoute || initialRoute.type !== "LISTING_HOME") return false;
  try {
    const res = await payload.find("hero-ads", {
      "where[area][exists]": false,
      "where[topic][exists]": false,
      "where[active][equals]": true,
      depth: 2,
      limit: 1,
    });
    const doc = (res?.docs || [])[0];
    const c = doc?.creative;
    if (!c || typeof c !== "object") return false;
    // Prefer the card-size variant (768x432) — that's what HeroBanner
    // will end up rendering on mobile + most desktops, so preloading
    // the same URL avoids a double-fetch.
    return c?.sizes?.card?.url || c?.url || false;
  } catch (e) {
    console.error("[ssr/articles.fetch:getInitialArticleHeroImage]", e?.message || e);
    return false;
  }
};
