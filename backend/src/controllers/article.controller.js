import articleService from "../services/article.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async test(req, res) {
    try {
      const vaData = await articleService.testIP(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async addNewArticle(req, res) {
    try {
      const vaData = await articleService.addNewArticles(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async nonActivateArticle(req, res) {
    try {
      const vaData = await articleService.nonActivateArticle(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllUnpublishedArticlesAdmin(req, res) {
    try {
      const vaData = await articleService.getAllUnpublishedArticlesAdmin(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async editCurrentArticle(req, res) {
    try {
      const vaData = await articleService.editCurrentArticle(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async publishArticle(req, res) {
    try {
      const vaData = await articleService.publishArticle(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getArticleByCategoryIDPerCity(req, res) {
    try {
      const vaParams = req.params;
      const vaQuery = req.query;

      const id_category = vaParams.id_category;
      const id_country = vaParams.id_country;
      const id_city = vaParams.id_city;

      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 10;
      const nOffset = (nPage - 1) * nLimit;

      if (nOffset < 0) {
        throw new Error("Page must be greater than 0");
      }

      const cFilteredTags = vaQuery.filtered_tags;
      const vaFilteredTags = cFilteredTags
        .split(",")
        .map((item) => parseInt(item));

      const vaData = await articleService.getArticleByCategoryIDPerCity(
        id_category,
        id_country,
        id_city,
        vaFilteredTags,
        nLimit,
        nOffset,
        nPage
      );
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getArticles(req, res) {
    try {
      const vaData = await articleService.getArticles(req);
      return response(res, 200, vaData || []);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getArticlesNew(req, res) {
    try {
      const vaData = await articleService.getArticlesNew(req);
      return response(res, 200, vaData || []);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getArticleByID(req, res) {
    try {
      const id = req.params.id;
      const vaQuery = req.query;
      const vaData = await articleService.getArticleByID(id, vaQuery);
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async pinArticle(req, res) {
    try {
      const vaData = await articleService.pinArticle(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async searchArticles(req, res) {
    try {
      const vaData = await articleService.searchArticles(req);
      return response(res, 200, vaData || []);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async countArticles(req, res) {
    try {
      const vaData = await articleService.countArticles();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async countArticlesPerCountry(req, res) {
    try {
      const vaData = await articleService.countArticlesPerCountry();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },
};
