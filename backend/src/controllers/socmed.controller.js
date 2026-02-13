import service from "../services/socmed.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async getAll(req, res) {
    try {
      const vaData = await service.getAll();
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getDataById(req, res) {
    try {
      const vaData = await service.getDataById(req.params.id);
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async create(req, res) {
    try {
      const vaData = await service.create(req);
      return response(res, 201, vaData);
    } catch (err) {
      console.error(err);
      errResponse(err, res);
    }
  },

  async update(req, res) {
    try {
      const vaData = await service.update(req);
      return response(res, 200, vaData);
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
};