import { fetchLocationsData } from "../locations.fetch.js";
import { fetchCategoriesData } from "../categories.fetch.js";

const parseListingParams = (slugs, taxonomies) => {
    const params = { country: undefined, city: undefined, region: undefined, category: undefined };
    slugs.forEach(slug => {
      const findCountry = taxonomies?.countries?.find(tax => (tax.slug == slug))
      const findCity = taxonomies?.cities?.find(tax => (tax.slug == slug))
      const findRegion = taxonomies?.regions?.find(tax => (tax.slug == slug))
      const findCategory = taxonomies?.categories?.find(tax => (tax.slug_title == slug))
      if (findCountry) params.country = findCountry
      else if (findCity) params.city = findCity
      else if (findRegion) params.region = findRegion
      else if (findCategory) params.category = findCategory
    });
    return params;
};

const fetchTaxonomyData = async () => {
  const locationData = await fetchLocationsData()
  const categoryData = await fetchCategoriesData()
  return {
    countries: locationData.country,
    cities: locationData.city,
    regions: locationData.region,
    categories: categoryData
  }
}

export {parseListingParams, fetchTaxonomyData}