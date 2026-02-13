import locationService from "../services/location.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async getAllLocation(req, res) {
    try {
      const vaData = await locationService.getAllLocation();
      return response(res, 200, vaData);
    } catch (error) {
      console.error(error);
      errResponse(error, res);
    }
  },

  async getAllCountry(req, res) {
    try {
      const vaData = await locationService.getCountry();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getLocation(req, res) {
    try {
      let vaData = [];
      const { type } = req.params;
      const { id_parent } = req.query;

      // mapping handler
      const handler = {
        country: () => locationService.getCountry(),
        city: () => locationService.getCity(id_parent),
        region: () => locationService.getRegion(id_parent),
      };

      if (handler[type]) {
        vaData = await handler[type]();
      }
      
      // console.log(vaData);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getLocationById(req, res) {
    try {
      const vaData = await locationService.getLocationById(req.params);
      if(!vaData) return response(res, 404, "No Data Found");
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async addLocation(req, res) {
    try {
      const vaBody = req.body;
      const vaParam = req.params;
      const vaData = {
        ...vaBody,
        ...vaParam,
      };
      // console.log(vaData);
      const doFunct = await locationService.addLocation(vaData);
      return response(res, 200, doFunct);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async editLocation(req, res) {
    try {
      const doFunct = await locationService.editLocation(req);
      return response(res, 200, doFunct);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async deleteLocation(req, res) {
    try {
      const doFunct = await locationService.deleteLocation(req);
      return response(res, 200, doFunct);
    } catch (error) {
      errResponse(error, res);
    }
  },
};
