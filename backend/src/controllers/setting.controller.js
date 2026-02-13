import service from "../services/setting.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async getSetupSMTP(req, res) {
    try {
      const vaData = await service.getSetupSMTP(req);
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async setupSMTP(req, res){
    try {
      const doSetup = await service.setupSMTP(req);
      return response(res, 200, doSetup);
    } catch (error) {
      console.error(":: ERROR at setupSMTP :: \n" ,error);
      errResponse(error, res);
    }
  },

  async getSMTPProviders(req, res) {
    try {
      const vaData = await service.getSMTPProviders();
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getSMTPProviderByID(req, res) {
    try {
      const vaData = await service.getSMTPProviderByID(req.params.id);
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  }
};
