import articleTemplatingService from "../services/article_templating.service.js";
import { response, errResponse } from "../helpers/response.js";


export default {
  async getAllTemplates(req, res) {
    try {
      // console.log("masuk getAllTemplates")
      const vaData = await articleTemplatingService.getAllTemplates();
      return response(res, 200, vaData || []);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async createNewTemplate(req, res) {
    try {
      // console.log("masuk createNewTemplate")
      const vaData = await articleTemplatingService.createNewTemplate(req);
      return response(res, 200, vaData);
    } catch (error) {
      console.log(error)
      errResponse(error, res);
    }
  },

  async getTemplateByID(req, res) {
    try {
      // console.log("masuk getTemplateByID")
      const vaData = await articleTemplatingService.getTemplateByID(req.params.id);
      if (!vaData) return response(res, 404, "No Template Found");
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async editTemplate(req, res) {
    try {
      // console.log("masuk editTemplate")
      const vaData = await articleTemplatingService.editTemplate(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async softDeleteTemplate(req, res) {
    try {
      // console.log("masuk softDeleteTemplate")
      const vaData = await articleTemplatingService.softDeleteTemplate(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getTemplateByQuery(req, res) {
    try {
      // console.log("masuk getTemplateByQuery")
      const vaData = await articleTemplatingService.getTemplateByQuery(req);
      return response(res, 200, vaData || null);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async restoreTemplate(req, res) {
    try {
      // console.log("masuk restoreTemplate")
      const vaData = await articleTemplatingService.restoreTemplate(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

};