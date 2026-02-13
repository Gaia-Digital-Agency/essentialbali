import { c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
const API_URL = "http://34.124.244.233/essentialbali";
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const useArticle = () => {
  const { getCountryById, getCategoryById, getRegionById, getCityById, taxonomies } = useTaxonomies();
  const DUMMY_ADMIN_ARTICLE = {
    title: "this will fill automatically",
    sub_title: "you only see this on admin page, user wont see this"
  };
  const getCategory = (article) => {
    return getCategoryById(article.category_id);
  };
  const getPermalink = (article) => {
    var _a, _b;
    return `/${(_a = getCountryById(article.id_country)) == null ? void 0 : _a.slug}/${(_b = getCategory(article)) == null ? void 0 : _b.slug_title}/${article.slug}`;
  };
  const _getArticleByFields = async (field) => {
    const urlParams = new URLSearchParams();
    Object.keys(field).forEach((key) => {
      var _a;
      const ke = key;
      if (!field[ke]) return;
      if (ke == "exclude_category") {
        const slugsToId = field[ke].map((cat) => {
          var _a2, _b;
          return (_b = (_a2 = taxonomies.categories) == null ? void 0 : _a2.find((tax) => tax.slug_title == cat)) == null ? void 0 : _b.id;
        });
        const filterCats = (_a = taxonomies.categories) == null ? void 0 : _a.filter((cat) => {
          var _a2;
          return !((_a2 = field[ke]) == null ? void 0 : _a2.includes(cat.slug_title));
        });
        filterCats == null ? void 0 : filterCats.filter((cat) => !slugsToId.includes(cat == null ? void 0 : cat.id_parent)).forEach((cat) => {
          urlParams.append("category[]", `${cat.id}`);
        });
      } else if (Array.isArray(field[ke])) {
        field[ke].forEach((k) => {
          if (!k) return;
          urlParams.append(`${key}[]`, `${k}`);
        });
      } else {
        urlParams.append(key, `${field[ke]}`);
      }
    });
    const get = await getArticleByFields({}, urlParams);
    if (get == null ? void 0 : get.articles) {
      return get.articles;
    }
  };
  const getFeaturedImageUrl = (article, ratio = null) => {
    if (!article) return "";
    if (ratio && article[`featured_image_${ratio}_url`]) {
      return `${IMAGE_URL}/${article[`featured_image_${ratio}_url`]}`;
    }
    if (article.featured_image_url) return `${IMAGE_URL}/${article.featured_image_url}`;
    return `${API_URL}/logo.png`;
  };
  const getDeepestLocation = (article, limit) => {
    if (!article) return;
    let temp = [];
    if (limit == "city") {
      const articleCity2 = getCityById(article.id_city);
      temp.push(articleCity2);
      const articleCountry2 = getCountryById(article.id_country);
      temp.push(articleCountry2);
      return temp.filter(Boolean)[0];
    }
    const articleRegion = getRegionById(article.id_region);
    temp.push(articleRegion);
    const articleCity = getCityById(article.id_city);
    temp.push(articleCity);
    const articleCountry = getCountryById(article.id_country);
    temp.push(articleCountry);
    return temp.filter(Boolean)[0];
  };
  const generateContent = async ({ content, admin = false, query = {} }) => {
    if (!content.filter((con) => con == 0).length) return content;
    const limit = content.length;
    let articleFill = [];
    const existingIds = content.filter((article) => !!article).map((article) => article.id);
    if (admin) {
      for (let i = 0; limit > i; i++) {
        articleFill.push(DUMMY_ADMIN_ARTICLE);
      }
    } else {
      const get = await _getArticleByFields({ ...query, limit, status: ["published"] });
      if (get) {
        articleFill = get.filter((article) => !existingIds.includes(article.id));
      }
    }
    return content.map((con) => {
      if (con) return con;
      return articleFill.shift() ?? void 0;
    });
  };
  return { getCategory, getPermalink, getFeaturedImageUrl, generateContent, getDeepestLocation };
};
export {
  useArticle as u
};
