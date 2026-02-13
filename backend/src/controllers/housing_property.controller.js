import housingService from "../services/housing_property.service.js";
import { response, errResponse } from "../helpers/response.js";

export default {
  async test(req, res) {
    try {
      const vaData = await housingService.test();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async addPropertyLocation(req, res) {
    try {
      const vaData = await housingService.addPropertyLocation(req.body);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllPropertyLocation(req, res) {
    try {
      const vaData = await housingService.getAllPropertyLocation();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async addAmenityItem(req, res) {
    try {
      const vaData = await housingService.addAmenityItem(req.body);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllAmenityItem(req, res) {
    try {
      const vaData = await housingService.getAllAmenityItem();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async addNewProperty(req, res) {
    try {
      const vaData = await housingService.addNewProperty(req);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllProperty(req, res) {
    try {
      const vaData = await housingService.getAllProperty();
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getAllPropertyByRentTypePerCity(req, res) {
    try {
      const vaParams = req.params;
      const rent_type = vaParams.rent_type;
      const id_country = vaParams.id_country;
      const id_city = vaParams.id_city;
      const vaQuery = req.query;

      const nLimit = parseInt(vaQuery.limit) || 10;
      const nOffset = (parseInt(vaQuery.page) - 1) * nLimit;

      if (nOffset < 0) {
        throw new Error("Page must be greater than 0");
      }

      const vaFilteredTags = vaQuery.rent_type;
      const vaData = await housingService.getAllPropertyByRentTypePerCity(
        rent_type,
        id_country,
        id_city,
        vaFilteredTags,
        nLimit,
        nOffset
      );
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async getPropertyByID(req, res) {
    try {
      const vaData = await housingService.getPropertyByID(req.params.id);
      return response(res, 200, vaData);
    } catch (error) {
      errResponse(error, res);
    }
  },
};
