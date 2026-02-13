// import { ArticleProps } from "../../types/article.type";

// export const pathResolve = (articleStatus: {isArticle: boolean, category: string | null, article?: ArticleProps}) => {
//     const listingSlugs = articleStatus.isArticle ? slugs.slice(0, -1) : slugs;
//     const listingParams = parseListingParams(listingSlugs, taxonomies);

//     if (articleStatus.isArticle) {
//         if (articleStatus.category === 'job-listing') {
//             setRenderState({
//             type: 'ARTICLE_JOB',
//             listingParams: listingParams,
//             articleSlug: lastSlug,
//             });
//         } else if (articleStatus.category === 'events') {
//             setRenderState({
//             type: 'ARTICLE_EVENTS',
//             listingParams: listingParams,
//             articleSlug: lastSlug
//             })
//         } else {
//             setRenderState({
//             type: 'ARTICLE_PAGE',
//             articleSlug: lastSlug,
//             listingParams: {...listingParams, article: lastSlug}
//             });
//         }
//     } else {
//         const listParam = {...listingParams, article: undefined}
//         if(lastSlug == 'trending') {
//             setRenderState({
//             type: 'LISTING_TRENDING_ONLY',
//             listingParams: listParam,
//             })
//         } else if (listingParams?.category?.slug_title == 'events') {
//             setRenderState({
//             type: 'LISTING_EVENTS',
//             listingParams: listParam
//             })
//         } else if (listingParams?.category?.slug_title == 'job-listing') {
//             setRenderState({
//             type: 'LISTING_JOB',
//             listingParams: listParam
//             })
//         } else if (listingParams?.category?.slug_title == 'deals') {
//             setRenderState({
//             type: 'LISTING_DEALS',
//             listingParams: listParam
//             })
//         } else if (listingParams?.category) {
//             setRenderState({
//             type: "LISTING_CATEGORY",
//             listingParams: listParam
//             })
//         } else {
//             setRenderState({
//             type: 'LISTING_HOME',
//             listingParams: listParam,
//             });
//         }
//     }
// }