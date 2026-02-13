import articleService from "../services/article.service.js"

export const fetchArticleData = async (slug, ip) => {
    const getArticle = await articleService.getArticlesNew({query: {slug: slug}, headers: {"x-forwarded-for": ip}})
    return getArticle
}

export const fetchArticlesData = async (query) => {
    const getArticle = await articleService.getArticlesNew({query: {...query, status: 'published'}, headers: {"x-forwarded-for": "system"}})
    return getArticle
}

export const fetchArticleDataByKeyword = async (q) => {
    const getArticle = articleService.searchArticles({query: {keyword: q, limit: 7, page: 1}})
    return getArticle
}

export const getInitialArticleHeroImage = (route, template = null) => {
    const SINGLE_ARTICLES_ROUTES = ['ARTICLE_EVENT', 'ARTICLE_PAGE']

    // if(route.type == 'LISTING_HOME') {
    //     if(template.template?.heroImage?.articles[0]) {
    //         return template.template?.heroImage.articles[0].featured_image_url
    //     }
    // }

    // if(SINGLE_ARTICLES_ROUTES.includes(route.type)) {
    //     if(template?.article?.featured_image_url) return template.article.featured_image_url
    // }

    return false
}