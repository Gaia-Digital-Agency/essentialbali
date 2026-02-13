import db from "../models/index.js";
import { decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { errResponse } from "../helpers/response.js";
import logger from "../helpers/logger.js";

const { User, sequelize } = db;

export const authorizer_article =
  (allowedRoles = []) =>
  async (req, res, next) => {
    try {
      const body = req.body;
      const vaCookies = req.cookies;
      const decoded = await decodeTokenFromCookie(vaCookies.token);
      const cIDCountryUser = decoded.id_country;
      const cIDCityUser = decoded.id_city;

      const user = await User.findByPk(decoded.user_id, {
        attributes: ["user_level"],
        raw: true,
      });

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      const cUserLevel = user.user_level;

      if (!allowedRoles.includes(cUserLevel)) {
        const error = new Error("You do not have access to this action");
        error.status = 403;
        throw error;
      }

      const cIDCountryBody = body.id_country;
      const cIDCityBody = body.id_city;
      const cIDRegionBody = body.id_region;

      const dbCityListByUserCountry = await sequelize.query(
        `SELECT c.id as id_city, c.name as nama_kota
         FROM city c
         LEFT JOIN country n ON n.id = c.id_country
         WHERE n.id = :countryID;`,
        { replacements: { countryID: cIDCountryUser } }
      );
      const vaAllowedCity = dbCityListByUserCountry[0].map((c) => c.id_city);

      if (cUserLevel === "admin_city") {
        if (!cIDCityBody) {
          logger.warn("Authorization failed: City ID not provided", { userId: decoded.user_id });
          const error = new Error("You need set city id");
          error.status = 403;
          throw error;
        }

        if (!vaAllowedCity.includes(cIDCityBody)) {
          logger.warn("Authorization failed: City not in allowed list", { userId: decoded.user_id, cityId: cIDCityBody });
          const error = new Error("Invalid city for this user");
          error.status = 403;
          throw error;
        }

        if (cIDCountryUser !== cIDCountryBody || cIDCityUser !== cIDCityBody) {
          logger.warn("Authorization failed: Location mismatch", { userId: decoded.user_id });
          const error = new Error("You do not have access to this action");
          error.status = 403;
          throw error;
        }

        const dbRegionListByUserCityCountry = await sequelize.query(
          `SELECT r.id as id_region, r.name as nama_region
           FROM region r
           LEFT JOIN city c ON c.id = r.id_city
           LEFT JOIN country n ON n.id = c.id_country
           WHERE r.id_city = :cityID AND n.id = :countryID;`,
          { replacements: { cityID: cIDCityUser, countryID: cIDCountryUser } }
        );
        const vaAllowedRegion = dbRegionListByUserCityCountry[0].map(
          (r) => r.id_region
        );

        if (cIDRegionBody) {
          if (!vaAllowedRegion.includes(cIDRegionBody)) {
            const error = new Error("Invalid region for this user");
            error.status = 403;
            throw error;
          }
        }

      } else if (cUserLevel === "admin_country") {
        const dbRegionListByUserCityCountry = await sequelize.query(
          `SELECT r.id as id_region, r.name as nama_region 
           FROM region r 
           LEFT JOIN city c ON c.id = r.id_city   
           LEFT JOIN country n ON n.id = c.id_country  
           WHERE c.id_country = :countryID;`,
          { replacements: { countryID: cIDCountryUser } }
        );

        const vaAllowedRegion = dbRegionListByUserCityCountry[0].map(
          (r) => r.id_region
        );

        if (cIDRegionBody) {
          if (!vaAllowedRegion.includes(cIDRegionBody)) {
            const error = new Error("Invalid region for this user");
            error.status = 403;
            throw error;
          }
        }

        if (cIDCityBody) {
          if (!vaAllowedCity.includes(cIDCityBody)) {
            const error = new Error("Invalid city for this user");
            error.status = 403;
            throw error;
          }
        }

        if (cIDCountryUser !== cIDCountryBody) {
          const error = new Error("Invalid country for this user");
          error.status = 403;
          throw error;
        }
      } else if (cUserLevel === "super_admin") {
        // super_admin bebas akses apa aja
      } else {
        // throw new Error("Your role does not have access");
        const error = new Error("Your role does not have access");
        error.status = 403;
        throw error;
      }

      // kalau lolos semua, lanjut ke controller
      next();
    } catch (err) {
      return errResponse(err, res);
    }
  };
