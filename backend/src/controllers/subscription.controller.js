import service from "../services/subscription.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async test(req, res) {
    try {
      const vaData = await service.test();
      return response(res, 200, vaData);
    } catch (error) {
      console.error(error);
      errResponse(error, res);
    }
  },

  async test_post(req, res) {
    try {
      const vaData = await service.test_post(req);
      return response(res, 200, vaData);
    } catch (error) {
      console.error(error);
      errResponse(error, res);
    }
  },

  async subscribe(req, res) {
    try {
      const vaData = await service.subscribe(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async unsubscribe(req, res) {
    try {
      const vaData = await service.unsubscribe(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllsubscriber(req, res) {
    try {
      const vaData = await service.getAllsubscriber(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async exportSubscriber(req, res) {
    try {
      const vaData = await service.exportSubscriber(req, res);
      // return response(res, 200, vaData);
    } catch (error) {
      // errResponse(error, res);
      return res.status(500).json({ message: "Gagal export CSV" });
    }
  },

  async countSubscribers(req, res) {
    try {
      const vaData = await service.countSubscribers(req, res) ;
      return response(res, 200, vaData)
    } catch (error) {
      errResponse(error, res);
    }
  },
};
