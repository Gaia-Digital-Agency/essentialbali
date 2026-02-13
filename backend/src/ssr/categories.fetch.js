import CategoryService from "../services/category.service.js"

const isObject = (data) => {
    return !!data && data.constructor === Object;
};
export const fetchCategoriesData = async () => {
    const getCategory = await CategoryService.getAll()
    const resCategory = isObject(getCategory)
      ? getCategory
      : Array.isArray(getCategory)
      ? getCategory
      : getCategory;
    return resCategory
    // return resCategory.map(instance => instance.toJSON())
}