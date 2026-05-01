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
  heroImage: {
    // articles: [0,0,0],
    rules: {
      limit: 3,
    },
    query: {
      useRoute: true,
      // pinned: 1,
      category: {
        slug: "people-culture",
      },
    },
  },
  trending: {
    // articles: [0,0,0,0,0],
    rules: {
      limit: 5,
    },
    query: {
      useRoute: true,
      category: {
        // Exclude topics that have their own dedicated section below so
        // a "trending across everything else" feed doesn't double-up.
        exclude_slugs: ["featured", "news", "events"],
      },
    },
  },
  mostPopular: {
    // 8 -> 5 (Phase-0 content campaign): matches the 5 featured articles
    // we generate. Restore to 8 once the campaign scales up.
    rules: {
      limit: 5,
    },
    query: {
      useRoute: true,
      category: {
        // "Most Popular" was a legacy MySQL curation bucket that no longer
        // exists. Closest match in the Payload topic set is "Featured"
        // (editorial picks). Revisit when product confirms section intent.
        slug: "featured",
      },
    },
  },
  events: {
    // 4 -> 3 (Phase-0 content campaign): matches the 3 events generated.
    rules: {
      limit: 3,
    },
    query: {
      useRoute: true,
      category: {
        slug: "events",
      },
    },
  },
  ultimateGuide: {
    // 6 -> 4 (Phase-0 content campaign): matches the 4 news articles.
    rules: {
      limit: 4,
    },
    query: {
      useRoute: true,
      category: {
        // "Ultimate Guide" was a legacy long-form bucket. Mapping to "News"
        // as the closest Payload topic for depth/journalism content.
        // Revisit when product confirms section intent.
        slug: "news",
      },
    },
  },
  overseas: {
    // articles: [0,0,0,0,0,0,0,0],
    rules: {
      limit: 8,
    },
    query: {
      useRoute: false,
    },
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
  let res = { ...HomeTemplate };

  const categories = taxonomies?.categories ?? [];

  for (const key of Object.keys(res)) {
    logger.info("Processing section:", key);

    const sectionConfig = res[key];

    // ===============================
    // 1️⃣ Resolve category by slug
    // ===============================
    let categoryId = null;

    const slugCategory = sectionConfig?.query?.category?.slug;

    if (slugCategory) {
      const foundCategory = categories.find(
        (cat) => cat.slug_title === slugCategory
      );

      categoryId = foundCategory?.id ?? null;
    }

    logger.info(categoryId);

    // ===============================
    // 2️⃣ Build query base
    // ===============================
    let query = {
      limit: sectionConfig?.rules?.limit ?? 5,
    };

    // ===============================
    // 3️⃣ Exclude categories
    // ===============================
    const excludeSlugs = sectionConfig?.query?.category?.exclude_slugs;

    if (excludeSlugs?.length) {
      const includedCategories = categories
        .filter((cat) => !excludeSlugs.includes(cat.slug_title))
        .map((cat) => cat.id);

      query.category = includedCategories;
    }

    // ===============================
    // 4️⃣ Pinned filter
    // ===============================
    if (sectionConfig?.query?.pinned) {
      query.pinned = true;
    }

    // ===============================
    // 5️⃣ Merge baseQuery
    // ===============================
    if (key !== "overseas") {
      query = { ...baseQuery, ...query };
    }

    // ===============================
    // 6️⃣ Override category if single slug used
    // ===============================
    if (categoryId) {
      query.category = categoryId;
    }

    // ===============================
    // 7️⃣ Fetch articles
    // ===============================
    const getArticle = await fetchArticlesData(query);

    res[key].articles = getArticle?.articles ?? [];
  }

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
