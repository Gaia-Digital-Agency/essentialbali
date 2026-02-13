import { fetchArticleDataByKeyword, fetchArticlesData } from "./articles.fetch.js";
import { fetchTagsData } from "./tags.fetch.js";
import { fetchTemplateRoute } from "./templates.fetch.js";
// import { HomeTemplate } from "./utils/template.js";
// import redis from "../../redisClient.js";


const HomeTemplate = {
    heroImage: {
        // articles: [0,0,0],
        rules: {
            limit: 3
        },
        query: {
            useRoute: true,
            pinned: 1,
            category: {
                slug: 'featured'
            }
        }
    },
    trending: {
        // articles: [0,0,0,0,0],
        rules: {
            limit: 5
        },
        query: {
            useRoute: true,
            category: {
                exclude_slugs: ['most-popular', 'ultimate-guide', 'events']
            }
        }
    },
    mostPopular: {
        // articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: true,
            category: {
                slug: 'most-popular'
            }
        }
    },
    events: {
        // articles: [0,0,0,0],
        rules: {
            limit: 4
        },
        query: {
            useRoute: true,
            category: {
                slug: 'events'
            }
        }
    },
    ultimateGuide: {
        // articles: [0,0,0,0,0,0],
        rules: {
            limit: 6
        },
        query: {
            useRoute: true,
            category: {
                slug: 'ultimate-guide'
            }
        }
    },
    overseas: {
        // articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: false
        }
    }
}

const generateContentHomeTemplate = async (templates, baseQuery, taxonomies) => {
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

const discoverArticle = async (route) => {
  const get = await fetchArticlesData({
    id_country: route.id_country,
    limit: 4
  })
  return get.articles
}

const relatedArticle = async (category) => {
  const get = await fetchArticlesData({
    limit: 11,
    category: category
  })
  return get.articles
}

function deleteFalsyProperties(obj) {
  for (const key in obj) {
    // Ensure the property belongs to the object itself, not its prototype chain
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Check if the property's value is falsy
      if (!obj[key]) {
        delete obj[key];
      } else {
        obj[key] = `${obj[key]}`
      }
    }
  }
  return obj;
}



const fetchContentData = async (route, taxonomy, search = undefined) => {
    // fetchTemplateRoute('/v2/')
  const _baseQuery = {
    id_country: route?.listingParams?.country ? route?.listingParams?.country.id : undefined,
    id_city: route?.listingParams?.city ? route?.listingParams?.city?.id : undefined,
    id_region: route?.listingParams?.region ? route?.listingParams?.region?.id : undefined,
  }
  const baseQuery = deleteFalsyProperties(_baseQuery)
  if(route.type == 'ARTICLE_PAGE') {
    const discover = await discoverArticle(baseQuery)
    const related = await relatedArticle(route.listingParams.category.id)
    return {
      article: route.listingParams.article,
      discover,
      related
    }
  }

  if(route.type == 'ARTICLE_EVENT') {
    const discover = await discoverArticle(baseQuery)
    const related = await relatedArticle(route.listingParams.category.id)
    const tags = await fetchTagsData(route.listingParams.article.tags)
    return {
      article: route.listingParams.article,
      discover,
      related,
      tags
    }
  }

  if(route.type == 'LISTING_DEALS') {
    let page = 1
    if(search) {
      search.split('&').forEach(params => {
        const [key, value] = params.split('=')
        if(key == 'page') {
          page = value
        }
      })
    }
    const query = {
      ...baseQuery,
      page: page,
      limit: 9
    }

    const getArticle = await fetchArticlesData(query)
    return getArticle
  }

  if(route.type == 'LISTING_CATEGORIES') {
    let page = 1
    if(search) {
      search.split('&').forEach(params => {
        const [key, value] = params.split('=')
        if(key == 'page') {
          page = value
        }
      })
    }
    const getArticle = await fetchArticlesData({
      ...baseQuery, page: page, limit: 9
    })
    return getArticle
  }

  if(route.type == 'LISTING_EVENTS') {
    let page = 1
    if(search) {
      search.split('&').forEach(params => {
        const [key, value] = params.split('=')
        if(key == 'page') page = value
      })
    }
    const getArticle = await fetchArticlesData({
      ...baseQuery, page: page, limit: 4
    })
    return getArticle
  }

  if(route.type == 'LISTING_TRENDINGS') {
    let page = 1
    if(search) {
      search.split('&').forEach(params => {
        const split = params.split('=')
        const key = split[0]
        const value = split[1]
        if(key == 'page') {
          page = value
        }
      })
    }
    const query = {
      ...baseQuery,
      isTrending: 1,
      limit: 9,
      page: page
    }
    const getArticle = await fetchArticlesData(query)
    return getArticle
  }

  if(route.type == 'LISTING_OVERSEAS') {
    let page = 1
    if(search) {
      search.split('&').forEach(params => {
        const [key, value] = params.split('=')
        if(key == 'page') page = value
      })
    }
    const getArticle = ({
      id_country: taxonomy.countries.filter(country => route.listingParams.country.id != country.id).map(country => country.id),
      limit: 9
    })
    return getArticle
  }

  if(route.type == 'LISTING_SEARCH') {
    let q = ''
    if(search) {
      search.split('&').forEach(params => {
        const [key, value] = params.split('=')
        if(key == 'q') q = value
      })
    }
    if(!q) return {articles: []}
    const getArticle = await fetchArticleDataByKeyword(q)
    return getArticle
  }

  if(route.type == 'LISTING_HOME') {
    const templateUrl = []
    if(route.listingParams.country) templateUrl.push(route.listingParams.country.slug)
    if(route.listingParams.city) templateUrl.push(route.listingParams.city.slug)
    if(route.listingParams.region) templateUrl.push(route.listingParams.region.slug)
    const template = await generateContentHomeTemplate(HomeTemplate, baseQuery, taxonomy)
    const res = {
      template: template
    }
    return res
  }

}


const fetchHeaderContentData = async (route = '/header') => {
  const get = await fetchTemplateRoute(route)
  return get || {}
}

export {fetchContentData, fetchHeaderContentData}