import tagsService from "../services/tags.service.js"

export const fetchTagsData = async (tags) => {
    if(!Array.isArray(tags)) return
    const get = await tagsService.getById(tags.join(','))
    return get
}