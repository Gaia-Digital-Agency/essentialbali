import CategoryService from "../services/category.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async getAll(req, res) {
    try {
      const categories = await CategoryService.getAll();
      return response(res, 200, categories);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getById(req, res) {
    try {
      const category = await CategoryService.getById(req.params.id, req.query);
      return response(res, 200, category);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async create(req, res) {
    try {
      const category = await CategoryService.create(req);
      return response(res, 201, category);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async update(req, res) {
    try {
      const category = await CategoryService.update(req.params.id, req);
      return response(res, 200, category);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async delete(req, res) {
    try {
      const result = await CategoryService.delete(req.params.id);
      return response(res, 200, result);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getCategoryDescByLocation(req, res) {
    try {
      const category = await CategoryService.getCategoryDescByLocation(req);
      return response(res, 200, category);
    } catch (err) {
      errResponse(err, res);
    }
  },
};
