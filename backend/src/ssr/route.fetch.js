import { parseListingParams } from "./utils/taxonomy.js";
import {fetchArticleData} from './articles.fetch.js'

const fetchRouteData = async (url, taxonomies, ip = '::1') => {

  async function checkArticleStatus(slug) {
    const getArticle = await fetchArticleData(slug, ip)
    if(getArticle.articles?.length) {
      return {article: getArticle.articles[0], isArticle: true, category: ''}
    }
    return {isArticle: false, category: null};
  }
  const slugs = url ? url.split('/').filter(Boolean) : [];

  if (slugs.length === 0) {
    return({ type: 'LISTING_HOME', listingParams: {country: undefined, city: undefined, region: undefined, category: undefined, article: undefined} });
  }

  const lastSlug = slugs[slugs.length - 1];
  // console.log(url, 'url')
  return checkArticleStatus(lastSlug).then(articleStatus => {
    
    const listingSlugs = articleStatus.isArticle ? slugs.slice(0, -1) : slugs;
    const listingParams = parseListingParams(listingSlugs, taxonomies);
    if (articleStatus.isArticle) {
      if (articleStatus.category === 'job-listing') {
        return{
          type: 'ARTICLE_JOB',
          listingParams: {...listingParams, article: articleStatus.article},
          articleSlug: lastSlug,
        };
      } else if (articleStatus.category === 'events') {
        return{
          type: 'ARTICLE_EVENT',
          listingParams: {...listingParams, article: articleStatus.article},
          articleSlug: lastSlug
        }
      } else {
        return{
          type: 'ARTICLE_PAGE',
          articleSlug: lastSlug,
          listingParams: {...listingParams, article: articleStatus.article}
        };
      }
    } else {
      const listParam = {...listingParams, article: undefined}
      if(lastSlug == 'trending') {
        return{
          type: 'LISTING_TRENDINGS',
          listingParams: listParam,
        }
      } else if (lastSlug == 'overseas' || lastSlug == 'area-highlights') {
        return {
          type: 'LISTING_OVERSEAS',
          listingParams: listParam
        }
      } else if (lastSlug == 'search') {
        return {
          type: 'LISTING_SEARCH',
          listingParams: listParam
        }
      } else if (listingParams?.category?.slug_title == 'events') {
        return{
          type: 'LISTING_EVENTS',
          listingParams: listParam
        }
      } else if (listingParams?.category?.slug_title == 'job-listing') {
        return{
          type: 'LISTING_JOBS',
          listingParams: listParam
        }
      } else if (listingParams?.category?.slug_title == 'deals') {
        return{
          type: 'LISTING_DEALS',
          listingParams: listParam
        }
      } else if (listingParams?.category) {
        return{
          type: "LISTING_CATEGORIES",
          listingParams: listParam
        }
      } else if(!listingParams.country && !listingParams.city && !listingParams.region && !listingParams.category) {
        
        return {
          type: "NOT_FOUND",
          listingParams: {...listingParams, article: undefined},
        }
      } else {
        return{
          type: 'LISTING_HOME',
          listingParams: listParam,
        };
      }
    }
  });

}

export {fetchRouteData}
