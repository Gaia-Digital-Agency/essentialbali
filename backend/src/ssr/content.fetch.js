import {
  fetchArticleDataByKeyword,
  fetchArticlesData,
} from "./articles.fetch.js";
import { fetchTagsData } from "./tags.fetch.js";
import { fetchTemplateRoute } from "./templates.fetch.js";
// import { HomeTemplate } from "./utils/template.js";
// import redis from "../../redisClient.js";
import { pino } from "pino";

// Single source of truth for the listing per-page size. Mirrors
// frontend/src/lib/constants.ts — kept in sync by hand. Was 9 here
// and 12 client-side before unification (Issue C from full_test.md).
const LISTING_PAGE_SIZE = 20;

const logger = pino(pino.destination("./logs/pino-content-fetch.log"));

const HomeTemplate = {
  // Phase 0 v4 — homepage is now driven by the explicit `group` field
  // on articles, not by category slug. Each of the 5 sections is one
  // group lookup with limit 4 = 20 articles total. The 20 articles get
  // their `group` value set via /admin/homepage-curation (Elliot picks
  // an initial assignment; humans override). All other articles in the
  // site have group = NULL and live on area / category pages only.
  //
  // baseQuery merging is intentionally OFF for every section (was on
  // for non-overseas in v3) — homepage queries should NOT respect any
  // area / topic filter the request might carry. Homepage = no filter.
  mostPopular: {
    rules: { limit: 4 },
    query: { group: "mostPopular" },
  },
  trending: {
    rules: { limit: 4 },
    query: { group: "trending" },
  },
  ultimateGuide: {
    rules: { limit: 4 },
    query: { group: "ultimateGuide" },
  },
  overseas: {
    rules: { limit: 4 },
    query: { group: "overseas" },
  },
  spotlight: {
    rules: { limit: 4 },
    query: { group: "spotlight" },
  },
};

const generateContentHomeTemplate_old = async (templates, baseQuery, taxonomies) => {
    // const tryRedis = false;
    // if(tryRedis) {
    //   return JSON.parse(tryRedis)
    // }
    // console.log(HomeTemplate, 'homeTemplate generate')
    let res = {...HomeTemplate}
    for (const key of Object.keys(res)) {
        let articleFill = []
        const category = res[key].query?.category?.slug
            ? { category: taxonomies.categories.find(cat => (res[key].query?.category?.slug == cat.slug_title))?.id }
            : null

        let query = {
            limit: `${res[key].rules.limit}`,
        }
        const excludeCategory = res[key].query?.category?.exclude_slugs
        if(excludeCategory) {
          const categoriesFilter = taxonomies.categories.filter(cat => (!excludeCategory.includes(cat.slug_title)))
          const categoriesIncluded = categoriesFilter.map(cat => cat.id)
          query['category'] = [...categoriesIncluded]
        }

        const isPinned = res[key].query?.pinned
        if(isPinned) {
          query['pinned'] = true
        }
        if(key != 'overseas') {
          query = {...baseQuery, ...query}
        }
        if(category) query.category = `${category.category}`
        const getArticle = await fetchArticlesData(query)
        res[key].articles = getArticle.articles
    }
    return res
}

const generateContentHomeTemplate = async (
  templates,
  baseQuery,
  taxonomies,
) => {
  // Phase 0 v4 — every section in HomeTemplate now declares
  //   query: { group: "<one-of-five>" }
  // and we fan out one fetchArticlesData() per section. Categories +
  // exclude_slugs + pinned + baseQuery are intentionally NOT merged on
  // the homepage; the group field IS the homepage placement spec. If
  // you ever need backward-compatibility with the v3 category-driven
  // sections, see generateContentHomeTemplate_old above.
  // F1 — parallelize the 5 group queries via Promise.all. Each section
  // is independent so they fan out simultaneously. Drops SSR time by
  // ~140ms (was 5 × ~35ms = 175ms sequential; now max(35ms) ≈ 35ms).
  const res = { ...HomeTemplate };
  const keys = Object.keys(res);
  const fetched = await Promise.all(
    keys.map((key) => {
      const sectionConfig = res[key];
      const group = sectionConfig?.query?.group;
      const query = { limit: sectionConfig?.rules?.limit ?? 4 };
      if (group) query.group = group;
      return fetchArticlesData(query);
    }),
  );
  keys.forEach((key, i) => {
    res[key].articles = fetched[i]?.articles ?? [];
  });

  return res;
};

const discoverArticle = async (route) => {
  const get = await fetchArticlesData({
    id_country: route.id_country,
    limit: 4,
  });
  return get.articles;
};

const relatedArticle = async (category) => {
  const get = await fetchArticlesData({
    limit: 11,
    category: category,
  });
  return get.articles;
};

function deleteFalsyProperties(obj) {
  for (const key in obj) {
    // Ensure the property belongs to the object itself, not its prototype chain
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Check if the property's value is falsy
      if (!obj[key]) {
        delete obj[key];
      } else {
        obj[key] = `${obj[key]}`;
      }
    }
  }
  return obj;
}

const fetchContentData = async (route, taxonomy, search = undefined) => {
  // fetchTemplateRoute('/v2/')
  const _baseQuery = {
    id_country: route?.listingParams?.country
      ? route?.listingParams?.country.id
      : undefined,
    id_city: route?.listingParams?.city
      ? route?.listingParams?.city?.id
      : undefined,
    id_region: route?.listingParams?.region
      ? route?.listingParams?.region?.id
      : undefined,
  };
  // console.log("\n")
  // console.log("\n")
  // console.log("CONTENT FETCH =>>>", route.type)
  // console.log("\n")
  // console.log("\n")
  const baseQuery = deleteFalsyProperties(_baseQuery);
  if (route.type == "ARTICLE_PAGE") {
    const discover = await discoverArticle(baseQuery);
    const related = await relatedArticle(route.listingParams.category.id);
    return {
      article: route.listingParams.article,
      discover,
      related,
    };
  }

  if (route.type == "ARTICLE_EVENT") {
    const discover = await discoverArticle(baseQuery);
    const related = await relatedArticle(route.listingParams.category.id);
    const tags = await fetchTagsData(route.listingParams.article.tags);
    return {
      article: route.listingParams.article,
      discover,
      related,
      tags,
    };
  }

  if (route.type == "LISTING_DEALS") {
    let page = 1;
    if (search) {
      search.split("&").forEach((params) => {
        const [key, value] = params.split("=");
        if (key == "page") {
          page = value;
        }
      });
    }
    const query = {
      ...baseQuery,
      page: page,
      limit: 9,
    };

    const getArticle = await fetchArticlesData(query);
    return getArticle;
  }

  if (route.type == "LISTING_CATEGORIES") {
    let page = 1;
    if (search) {
      search.split("&").forEach((params) => {
        const [key, value] = params.split("=");
        if (key == "page") {
          page = value;
        }
      });
    }
    const getArticle = await fetchArticlesData({
      ...baseQuery,
      category: route?.listingParams?.category?.id,
      page: page,
      limit: LISTING_PAGE_SIZE,
    });
    return getArticle;
  }

  if (route.type == "LISTING_EVENTS") {
    let page = 1;
    if (search) {
      search.split("&").forEach((params) => {
        const [key, value] = params.split("=");
        if (key == "page") page = value;
      });
    }
    const getArticle = await fetchArticlesData({
      ...baseQuery,
      category: route?.listingParams?.category?.id,
      page: page,
      limit: LISTING_PAGE_SIZE,
    });
    return getArticle;
  }

  if (route.type == "LISTING_TRENDINGS") {
    let page = 1;
    if (search) {
      search.split("&").forEach((params) => {
        const split = params.split("=");
        const key = split[0];
        const value = split[1];
        if (key == "page") {
          page = value;
        }
      });
    }
    const query = {
      ...baseQuery,
      isTrending: 1,
      limit: 9,
      page: page,
    };
    const getArticle = await fetchArticlesData(query);
    return getArticle;
  }

  if (route.type == "LISTING_OVERSEAS") {
    let page = 1;
    if (search) {
      search.split("&").forEach((params) => {
        const [key, value] = params.split("=");
        if (key == "page") page = value;
      });
    }
    const query = {
      id_country: taxonomy.countries
        .filter((country) => 
          route.listingParams.country ? route.listingParams.country.id != country.id : true
        )
        .map((country) => country.id),
      limit: 9,
      page: page,
    };
    const getArticle = await fetchArticlesData(query);
    return getArticle;
  }

  if (route.type == "LISTING_SEARCH") {
    let q = "";
    if (search) {
      search.split("&").forEach((params) => {
        const [key, value] = params.split("=");
        if (key == "q") q = value;
      });
    }
    if (!q) return { articles: [] };
    const getArticle = await fetchArticleDataByKeyword(q);
    return getArticle;
  }

  if (route.type == "LISTING_HOME") {
    const templateUrl = [];
    if (route.listingParams.country)
      templateUrl.push(route.listingParams.country.slug);
    if (route.listingParams.city)
      templateUrl.push(route.listingParams.city.slug);
    if (route.listingParams.region)
      templateUrl.push(route.listingParams.region.slug);
    const template = await generateContentHomeTemplate(
      HomeTemplate,
      baseQuery,
      taxonomy,
    );
    const res = {
      template: template,
    };
    return res;
  }
};

const fetchHeaderContentData = async (route = "/header") => {
  const get = await fetchTemplateRoute(route);
  return get || {};
};

export { fetchContentData, fetchHeaderContentData };
