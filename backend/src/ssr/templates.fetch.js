import templateService from "../services/article_templating.service.js"
// import ioredis from 'ioredis'
import redis from "../../redisClient.js"

export const fetchTemplateRoute = async (url) => {
    const tryRedis = await redis.get(url)
    if(tryRedis) {
        return JSON.parse(tryRedis)
    }
    const get = await templateService.getTemplateByQuery({query: {url: url}})
    if(get?.dataValues?.content) {
        // console.log(get.dataValues.content)
        redis.set(url, get.dataValues.content, "EX", 3600)
        return JSON.parse(get.dataValues.content)
    }
    return null
}

const determineLogo = (route) => {
    if(route.listingParams.region?.site_logo) return route.listingParams.region.site_logo
    if(route.listingParams.city?.site_logo) return route.listingParams.city.site_logo
    if(route.listingParams.country?.site_logo) return route.listingParams.country.site_logo
    return false
}

export const fetchTemplateContent = async (route) => {
    const getHeader = await fetchTemplateRoute('/header')
    const getFooter = await fetchTemplateRoute('/footer')
    const getLogo = await fetchTemplateRoute('/logo-header')
    const currentLogo =  determineLogo(route)
    const getAbout = await fetchTemplateRoute('/about')
    const res = {
        header: getHeader,
        footer: getFooter,
        logo: getLogo,
        currentLogo,
        about: getAbout
    }
    return res
}