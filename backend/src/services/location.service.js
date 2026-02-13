import db from "../models/index.js";
const { Country, City, Region, AssetMedia, Sequelize, sequelize } = db;
import { toSlug } from "../helpers/article.js";
import {
  validateDefaultIdOperation,
  DEFAULT_IDS,
} from "../config/constants.js";
import redis, { invalidateCacheByPattern } from "../../redisClient.js";
import slugify from "slugify";
import logger from "../helpers/logger.js";

export default {
  async getLocationById(params) {
    try {
      const vaParam = params;
      const vaType = vaParam.type;
      const vaID = vaParam.id;

      let vaData = null;
      if (vaType == "country") {
        vaData = await Country.findByPk(vaID, {
          attributes: [
            "id",
            "name",
            "slug",
            "timezone",
            ["site_logo", "site_logo_id"],
            ["flag_icon", "flag_icon_id"],
          ],
          include: [
            {
              model: AssetMedia,
              as: "asset",
              attributes: [["path", "site_logo"]],
            },
            {
              model: AssetMedia,
              as: "flagIcon",
              attributes: [["path", "flag_icon"]],
            },
          ],
        });
      } else if (vaType == "city") {
        vaData = await City.findByPk(vaID, {
          attributes: [
            "id",
            ["id_country", "id_parent"],
            "name",
            "slug",
            ["site_logo", "site_logo_id"],
          ],
          include: [
            {
              model: AssetMedia,
              as: "asset",
              attributes: [["path", "site_logo"]],
            },
          ],
        });
      } else if (vaType == "region") {
        vaData = await Region.findByPk(vaID, {
          attributes: [
            "id",
            ["id_city", "id_parent"],
            "name",
            "slug",
            ["site_logo", "site_logo_id"],
          ],
          include: [
            {
              model: AssetMedia,
              as: "asset",
              attributes: [["path", "site_logo"]],
            },
          ],
        });
      }

      const vaRetval = vaData.toJSON();
      if (vaRetval.asset) {
        vaRetval.site_logo = vaRetval.asset.site_logo;
      }
      if (vaRetval.flagIcon) {
        vaRetval.flag_icon = vaRetval.flagIcon.flag_icon;
      }
      delete vaRetval.asset;
      delete vaRetval.flagIcon;

      return vaRetval;
    } catch (error) {
      throw error;
    }
  },

  async getAllLocation() {
    try {
      const vaData = await Country.findAll({
        attributes: ["id", "name", "slug", "timezone", "site_logo"],
        include: [
          {
            model: AssetMedia,
            as: "asset",
            attributes: ["path"],
          },
          {
            model: City,
            as: "cities",
            attributes: ["id", "name", "slug", "site_logo"],
            include: [
              {
                model: AssetMedia,
                as: "asset",
                attributes: ["path"],
              },
              {
                model: Region,
                as: "regions",
                attributes: ["id", "name", "slug", "site_logo"],
                include: [
                  {
                    model: AssetMedia,
                    as: "asset",
                    attributes: ["path"],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Transform to replace site_logo IDs with paths
      const result = vaData.map((country) => {
        const countryJson = country.toJSON();
        if (countryJson.asset?.path) {
          countryJson.site_logo = countryJson.asset.path;
        }
        delete countryJson.asset;

        if (countryJson.cities) {
          countryJson.cities = countryJson.cities.map((city) => {
            if (city.asset?.path) {
              city.site_logo = city.asset.path;
            }
            delete city.asset;

            if (city.regions) {
              city.regions = city.regions.map((region) => {
                if (region.asset?.path) {
                  region.site_logo = region.asset.path;
                }
                delete region.asset;
                return region;
              });
            }
            return city;
          });
        }
        return countryJson;
      });

      return result;
    } catch (error) {
      logger.error("Failed to get all locations", { error: error.message });
      throw error;
    }
  },

  async getCountry() {
    try {
      const cacheKey = "location_all_country";
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug("Cache hit for countries");
        return JSON.parse(cachedData);
      }

      const countries = await Country.findAll({
        attributes: ["id", "name", "slug", "timezone", "site_logo"],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: AssetMedia,
            as: "asset",
            attributes: [["path", "site_logo"]],
          },
        ],
      });

      const vaRetval = countries.map((c) => c.toJSON());

      vaRetval.map((c) => {
        if (c.asset) {
          c.site_logo = c.asset.site_logo;
        }
        delete c.asset;

        return c;
      });

      await redis.set(cacheKey, JSON.stringify(vaRetval), "EX", 3600);
      logger.debug("Countries cached to Redis");

      return vaRetval;
    } catch (error) {
      logger.error("Failed to get countries", { error: error.message });
      throw error;
    }
  },

  async getCity(cIDCountry = 0) {
    try {
      const cacheKey = `location_all_city_${cIDCountry}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug("Cache hit for cities", { countryId: cIDCountry });
        return JSON.parse(cachedData);
      }

      const cWhere = cIDCountry ? `WHERE c.id_country = ${cIDCountry}` : "";
      const [vaData] = await sequelize.query(
        `SELECT c.id, c.id_country as id_parent, c.name, n.name as name_parent, c.slug, m.path as site_logo
        FROM city c
        LEFT JOIN country n ON n.id = c.id_country
        LEFT JOIN asset_media m ON m.id = c.site_logo
        ${cWhere};`
      );

      await redis.set(cacheKey, JSON.stringify(vaData), "EX", 3600);
      logger.debug("Cities cached to Redis", { countryId: cIDCountry });

      return vaData;
    } catch (error) {
      logger.error("Failed to get cities", { countryId: cIDCountry, error: error.message });
      throw error;
    }
  },

  async getRegion(cIDCity = 0) {
    try {
      const cacheKey = `location_all_region_${cIDCity}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug("Cache hit for regions", { cityId: cIDCity });
        return JSON.parse(cachedData);
      }

              const cWhere = cIDCity ? `WHERE r.id_city = ${cIDCity}` : "";
            const [vaData] = await sequelize.query(
              `SELECT r.id, r.id_city as id_parent, r.name, c.name as name_parent, r.slug, m.path as site_logo
              FROM region r
              LEFT JOIN city c ON c.id = r.id_city
              LEFT JOIN asset_media m ON m.id = r.site_logo
              ${cWhere};`
            );
      await redis.set(cacheKey, JSON.stringify(vaData), "EX", 3600);
      logger.debug("Regions cached to Redis", { cityId: cIDCity });

      return vaData;
    } catch (error) {
      logger.error("Failed to get regions", { cityId: cIDCity, error: error.message });
      throw error;
    }
  },

  async addLocation(vaData) {
    try {
      if (!vaData.name) {
        const error = new Error("Name is required");
        error.status = 400;
        throw error;
      }

      if (vaData.type !== "country" && !vaData.id_parent) {
        const error = new Error("Parent is required");
        error.status = 400;
        throw error;
      }

      if (!vaData.slug) {
        vaData.slug = slugify(vaData.name);
      }

      const handler = {
        country: () =>
          Country.create({
            name: vaData.name,
            slug: vaData.slug,
            timezone: vaData.timezone,
            site_logo: vaData.site_logo,
            flag_icon: vaData.flag_icon,
          }),
        city: () =>
          City.create({
            id_country: vaData.id_parent,
            name: vaData.name,
            slug: vaData.slug,
            site_logo: vaData.site_logo,
          }),
        region: () =>
          Region.create({
            id_city: vaData.id_parent,
            name: vaData.name,
            slug: vaData.slug,
            site_logo: vaData.site_logo,
          }),
      };

      const vaNewData = await handler[vaData.type]();
      const cacheKeyPrefix = "location";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);

      // if (handler[vaData.type]) {
      //   return handler[vaData.type]();
      // }

      return vaNewData;
    } catch (error) {
      logger.error("Failed to add location", { type: vaData.type, error: error.message });
      throw error;
    }
  },

  async editLocation(req) {
    try {
      const vaParam = req.params;
      const vaBody = req.body;

      const cType = vaParam.type;
      const cID = vaParam.id;

      validateDefaultIdOperation(cID, cType, "edit");

      if (cType == "country") {
        await Country.update(
          {
            name: vaBody.name,
            timezone: vaBody.timezone,
            slug: vaBody.slug,
            site_logo: vaBody.site_logo,
            flag_icon: vaBody.flag_icon,
          },
          { where: { id: cID } }
        );
      } else if (cType == "city") {
        await City.update(
          {
            name: vaBody.name,
            id_country: vaBody.id_parent,
            slug: vaBody.slug,
            site_logo: vaBody.site_logo,
          },
          { where: { id: cID } }
        );
      } else if (cType == "region") {
        await Region.update(
          {
            name: vaBody.name,
            id_city: vaBody.id_parent,
            slug: vaBody.slug,
            site_logo: vaBody.site_logo,
          },
          { where: { id: cID } }
        );
      }

      const cacheKeyPrefix = "location";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);

      return "Success";
    } catch (error) {
      logger.error("Failed to edit location", { type: req.params.type, id: req.params.id, error: error.message });
      throw error;
    }
  },

  async deleteLocation(req) {
    const transaction = await sequelize.transaction();
    try {
      const vaParam = req.params;
      const vaType = vaParam.type;
      const vaID = vaParam.id;

      // Validasi default ID
      validateDefaultIdOperation(vaID, vaType, "delete");

      // Fallback mapping berdasarkan tipe
      const fallbackMap = {
        country: DEFAULT_IDS.COUNTRY,
        city: DEFAULT_IDS.CITY,
        region: DEFAULT_IDS.REGION,
      };

      const fallbackId = fallbackMap[vaType];

      // Update articles to fallback
      if (vaType === "country") {
        await sequelize.query(
          `UPDATE articles 
           SET id_country = :fallbackId 
           WHERE id_country = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await sequelize.query(
          `UPDATE property 
           SET id_country = :fallbackId 
           WHERE id_country = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await Country.destroy({ where: { id: vaID }, transaction });
      } else if (vaType === "city") {
        await sequelize.query(
          `UPDATE articles 
           SET id_city = :fallbackId 
           WHERE id_city = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await sequelize.query(
          `UPDATE property 
           SET id_city = :fallbackId 
           WHERE id_city = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await City.destroy({ where: { id: vaID }, transaction });
      } else if (vaType === "region") {
        await sequelize.query(
          `UPDATE articles 
           SET id_region = :fallbackId 
           WHERE id_region = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await sequelize.query(
          `UPDATE property 
           SET id_region = :fallbackId 
           WHERE id_region = :id`,
          {
            replacements: { id: vaID, fallbackId },
            transaction,
          }
        );

        await Region.destroy({ where: { id: vaID }, transaction });
      }

      const cacheKeyPrefix = "location";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);
      await transaction.commit();
      return `Successfully deleted and moved related data to default ${vaType}`;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
