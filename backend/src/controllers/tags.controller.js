import service from "../services/tags.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async getAll(req, res) {
    try {
      const vaTags = await service.getAll();
      if (vaTags.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaTags);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getById(req, res) {
    try {
      const vaTags = await service.getById(req.params.id);
      return response(res, 200, vaTags);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async create(req, res) {
    try {
      const tag = await service.create(req);
      return response(res, 201, tag);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async update(req, res) {
    try {
      const vaTags = await service.update(req);
      response(res, 200, vaTags);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async softDelete(req, res) {
    try {
      const result = await service.softDelete(req.params.id);
      response(res, 200, result);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async reActivateTags(req, res) {
    try {
      const result = await service.reActivateTags(req.params.id);
      response(res, 200, result);
    } catch (err) {
      errResponse(err, res);
    }
  },
};
