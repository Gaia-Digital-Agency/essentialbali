import service from "../services/job_vacancy.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async applyJob(req, res) {
    try {
      const id = req.params.id; // article id
      const { applicant_email, phone } = req.body;
      const fileCV = req.file;

      // console.log(fileCV); return response(res, 200, fileCV); 

      if (!applicant_email || !fileCV){
        return response(res, 400, "Email and CV are required");
      }

      const vaDataApplicant = {
        applicant_email,
        phone,
        file : fileCV.path,
      };
      
      // console.log(vaDataApplicant);
      const vaData = await service.applyJob(id, vaDataApplicant);
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },

  async getAllApplicant(req, res) {
    try {
      const vaQuery = req.query;
      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 10;
      
      const vaData = await service.getAllApplicant(nPage, nLimit);
      if (vaData.length < 1) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (err) {
      errResponse(err, res);
    }
  },
};
