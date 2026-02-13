import { response, errResponse } from "../helpers/response.js";
import service from "../services/timezone.service.js";

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
};
