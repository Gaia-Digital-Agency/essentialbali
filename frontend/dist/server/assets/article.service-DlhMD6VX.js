import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
const getArticleById = async (id) => {
  try {
    const getArticle = await apiClient.get(
      `article/admin/${id}`
    );
    if (getArticle.data.status_code == 200 && getArticle.data.data) {
      return getArticle.data.data[0];
    }
  } catch (e) {
    console.log(e);
  }
};
const getArticleByFields = async (fields, params) => {
  try {
    const field = Object.entries(fields).flatMap(([key, value]) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((val) => `${key}[]=${val}`);
      }
      return [`${key}=${value}`];
    });
    const getArticles = await apiClient.get(`article/?${field.flat().join("&")}${field.length ? "&" : ""}${(params == null ? void 0 : params.toString()) ? `${params.toString()}` : ""}`);
    if (getArticles.data.status_code != 200) throw Error("cant get articles");
    return getArticles.data.data;
  } catch (e) {
    console.log(e);
  }
};
const getArticleBySlug = async (slug) => {
  var _a;
  try {
    const getArticles = await apiClient.get(`article/?slug=${slug}`);
    if (getArticles.data.status_code == 200 && ((_a = getArticles == null ? void 0 : getArticles.data.data) == null ? void 0 : _a.articles.length)) {
      return getArticles.data.data.articles[0];
    }
    throw Error(getArticles.statusText);
  } catch (e) {
    console.log(e);
  }
};
const getTop10TrendingArticle = async () => {
  try {
    const getArticles = await apiClient.get(`article?limit=10&isTrending=1`);
    if (getArticles.data.status_code === 200 && getArticles.data.data) {
      const vaRetval = getArticles.data.data;
      return vaRetval;
    }
    throw Error(getArticles.statusText);
  } catch (error) {
    console.error(error);
  }
};
const getTotalArticles = async () => {
  try {
    const response = await apiClient.get("article/count-articles");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const getArticleByKeyword = async (params) => {
  try {
    const newParams = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])));
    const response = await apiClient.get(`article/search?${newParams.toString()}`);
    if (response.data.status_code == 200 && response.data.data) {
      return response.data.data;
    }
  } catch (e) {
    console.log(e);
  }
};
const editArticleById = async (id, data) => {
  try {
    const editArticle = await apiClient.put(
      `article/admin/${id}`,
      data
    );
    if (editArticle.data.status_code != 200)
      throw Error("Unexpected error occured" + editArticle.data);
    return true;
  } catch (e) {
    console.log(e);
  }
};
const createArticle = async (object) => {
  try {
    const createArticle2 = await apiClient.post("article/admin", object);
    if (createArticle2.data.status_code != 200)
      throw Error("Unexpected error occured" + createArticle2.data);
    return createArticle2.data.data;
  } catch (e) {
    console.log(e);
  }
};
const deleteArticle = async (id) => {
  try {
    const deleteArticle2 = await apiClient.delete(
      `article/admin/${id}`
    );
    if (deleteArticle2.data.status_code != 200) throw Error("cant delete");
    return true;
  } catch (e) {
    console.log(e);
  }
};
export {
  getTotalArticles as a,
  getArticleByFields as b,
  getTop10TrendingArticle as c,
  deleteArticle as d,
  getArticleByKeyword as e,
  getArticleById as f,
  getArticleBySlug as g,
  editArticleById as h,
  createArticle as i
};
