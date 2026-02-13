import db from "../models/index.js";
import { decodeTokenFromCookie } from "../helpers/jwtoken.js";
import redis from "../../redisClient.js";
import slugify from "slugify";
import { invalidateCacheByPattern } from "../../redisClient.js";
import logger from "../helpers/logger.js";
const {
  Category,
  CategoryDescription,
  TagCategory,
  Region,
  City,
  Country,
  Tags,
  sequelize,
} = db;

export default {
  async getAll() {
    try {
      const cacheKey = "category_all";
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug("Cache hit for categories");
        return JSON.parse(cachedData);
      }
      const categories = await Category.findAll({
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "title",
          "sub_title",
          "slug_title",
          "description",
          "icon",
          "is_child",
          "id_parent",
          "template_name",
        ],
        raw: true,
      });

      const categoryMap = new Map();
      categories.forEach((cat) => categoryMap.set(cat.id, cat));

      categories.forEach((cat) => {
        if (cat.is_child && cat.id_parent) {
          const parent = categoryMap.get(cat.id_parent);
          cat.parent = parent ? parent.title : "";
        } else {
          cat.parent = "";
        }
      });

      const tagLinks = await TagCategory.findAll({
        attributes: ["id_category", "id_tag"],
        include: [
          {
            model: Tags,
            as: "tag",
            attributes: ["id", "name", "slug", "icon"],
          },
        ],
        raw: true,
        nest: true,
      });

      const tagMap = new Map();
      categories.forEach((cat) => tagMap.set(cat.id, []));

      tagLinks.forEach((link) => {
        const arr = tagMap.get(link.id_category);
        if (arr) arr.push(link.tag);
      });

      categories.forEach((cat) => {
        cat.tags = tagMap.get(cat.id) || [];
      });

      await redis.set(cacheKey, JSON.stringify(categories), "EX", 3600);
      logger.debug("Categories cached to Redis");

      return categories;
    } catch (error) {
      logger.error("Failed to get all categories", { error: error.message });
      throw error;
    }
  },

  async getById(id, vaQuery) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        const error = new Error("Category not found");
        error.status = 404;
        throw error;
      }

      let vaDataDesc = null;
      let rows = null;
      if (vaQuery) {
        const { id_country, id_city, id_region } = vaQuery;
        // Priority: region → city → country
        if (id_country && id_city && id_region) {
          [rows] = await sequelize.query(
            `SELECT id, id_country , id_city , id_region , category_id , description , sub_title FROM category_description 
           WHERE category_id = :id 
           AND id_country = :id_country 
           AND id_city = :id_city 
           AND id_region = :id_region
           LIMIT 1`,
            {
              replacements: { id, id_country, id_city, id_region },
            }
          );
          vaDataDesc = rows?.[0] || null;
        }

        // If not found, fall back to city
        if ((!vaDataDesc || vaDataDesc.length === 0) && id_country && id_city) {
          [rows] = await sequelize.query(
            `SELECT id, id_country , id_city , id_region , category_id , description , sub_title FROM category_description 
           WHERE category_id = :id 
           AND id_country = :id_country 
           AND id_city = :id_city 
           AND id_region IS NULL
           LIMIT 1`,
            { replacements: { id, id_country, id_city } }
          );
          vaDataDesc = rows?.[0] || null;
        }

        // If not found, fall back to country
        if ((!vaDataDesc || vaDataDesc.length === 0) && id_country) {
          [rows] = await sequelize.query(
            `SELECT id, id_country , id_city , id_region , category_id , description , sub_title FROM category_description 
           WHERE category_id = :id 
           AND id_country = :id_country 
           AND id_city IS NULL 
           AND id_region IS NULL
           LIMIT 1`,
            { replacements: { id, id_country } }
          );
          vaDataDesc = rows?.[0] || null;
        }
      }

      const vaDataRelatedTag = await TagCategory.findAll({
        where: { id_category: id },
        attributes: ["id_tag"],
        include: [
          {
            model: Tags,
            as: "tag",
            attributes: ["id", "name", "slug", "icon"],
          },
        ],
      });

      const relatedTags = vaDataRelatedTag.map((item) => {
        return {
          id: item.tag.id,
          name: item.tag.name,
          slug: item.tag.slug,
          icon: item.tag.icon,
        };
      });

      // const vaResults = {
      //   ...category.dataValues,
      //   sub_title:
      //     vaDataDesc && vaDataDesc.length > 0
      //       ? vaDataDesc[0].sub_title
      //       : category.sub_title || null,
      //   description:
      //     vaDataDesc && vaDataDesc.length > 0
      //       ? vaDataDesc[0].description
      //       : category.description || null,
      //   tags: relatedTags || [],
      // };

      const vaResults = {
        ...category.dataValues,
        sub_title: vaDataDesc?.sub_title ?? category.sub_title ?? null,
        description: vaDataDesc?.description ?? category.description ?? null,
        tags: relatedTags || [],
      };

      return vaResults;
    } catch (error) {
      logger.error("Failed to get category by ID", { id, error: error.message });
      throw error;
    }
  },

  async create(data) {
    try {
      const vaBody = data.body;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      let createdBy = decodedToken.user_id;
      let updatedBy = decodedToken.user_id;

      let idCountry = vaBody.id_country;
      let idCity = vaBody.id_city;
      let idRegion = vaBody.id_region;
      let cTitle = vaBody.title;
      let cSlug = vaBody.slug_title;
      let cSubTitle = vaBody.sub_title;
      let cDescription = vaBody.description;
      let cTemplateName = vaBody.template_name;
      let cParentID = vaBody.id_parent;
      let vaRelatedTags = vaBody.tag;

      /** Location Filter START */
      let isSaveDescLocation = false;

      if (idCountry || idCity || idRegion) {
        isSaveDescLocation = true;
      }

      if (idCountry) {
        const dbCountry = await Country.findOne({ where: { id: idCountry } });
        if (!dbCountry) {
          const error = new Error(
            "Invalid location, please check your Bali area input"
          );
          error.status = 404;
          throw error;
        }

        idCity = null;
        idRegion = null;
      }

      if (idCity) {
        const dbCity = await City.findOne({ where: { id: idCity } });
        if (!dbCity) {
          const error = new Error(
            "Invalid Location, Please Check Your City Input"
          );
          error.status = 404;
          throw error;
        }
        idCountry = dbCity.dataValues.id_country;
        idRegion = null;
      }

      if (idRegion) {
        let isRegionExist = true;

        const dbRegion = await Region.findOne({ where: { id: idRegion } });
        if (!dbRegion) {
          isRegionExist = false;
        }
        idCity = dbRegion.dataValues.id_city;

        const dbCity = await City.findOne({ where: { id: idCity } });
        if (!dbCity) {
          isRegionExist = false;
        }
        idCountry = dbCity.dataValues.id_country;

        if (!isRegionExist) {
          const error = new Error(
            "Invalid Location, Please Check Your Region Input"
          );
          error.status = 404;
          throw error;
        }
      }

      /** Location Filter END */

      if (!cTitle) {
        const error = new Error("Title is required");
        error.status = 400;
        throw error;
      }

      if (!cTemplateName) {
        const error = new Error("Template Name is required");
        error.status = 400;
        throw error;
      }

      let isChild = false;
      if (cParentID) {
        const vaParent = await Category.findByPk(cParentID);
        if (!vaParent) {
          const error = new Error("Parent Category not found");
          error.status = 404;
          throw error;
        }
        isChild = true;
      }

      cSlug = !cSlug
        ? slugify(cTitle, { lower: true, remove: /[*+~.()'"!:@]/g })
        : slugify(cSlug, { lower: true, remove: /[*+~.()'"!:@]/g });

      const vaInputCategory = {
        title: cTitle,
        slug_title: cSlug,
        sub_title: isSaveDescLocation ? "" : cSubTitle,
        description: isSaveDescLocation ? "" : cDescription,
        template_name: cTemplateName,
        is_child: isChild,
        id_parent: cParentID,
        createdBy: createdBy,
        updatedBy: updatedBy,
      };

      const doCategory = await Category.create(vaInputCategory);

      if (isSaveDescLocation) {
        const vaBodyDescLoc = {
          category_id: doCategory.id,
          id_country: idCountry,
          id_city: idCity,
          id_region: idRegion,
          title: cTitle,
          sub_title: cSubTitle,
          description: cDescription,
        };
        await CategoryDescription.create(vaBodyDescLoc);
      }

      if (vaRelatedTags.length > 0) {
        let insertDataRelatedTag = [];
        vaRelatedTags.forEach((element) => {
          element = parseInt(element);
          const vaBodyTag = {
            id_category: doCategory.id,
            id_tag: element,
          };
          insertDataRelatedTag.push(vaBodyTag);
        });
        await TagCategory.bulkCreate(insertDataRelatedTag);
      }

      const cacheKeyPrefix = "category";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);

      return doCategory;
    } catch (error) {
      logger.error("Failed to create category", { error: error.message });
      throw error;
    }
  },

  async update(id, req) {
    try {
      if (parseInt(id) === 999) {
        const error = new Error("Cannot edit default category");
        error.status = 403;
        throw error;
      }

      const data = req.body;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const category = await Category.findByPk(id);
      const cDescDB = category.description;
      const cSubTitleDB = category.sub_title;
      if (!category) {
        const error = new Error("Category not found");
        error.status = 404;
        throw error;
      }

      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      let createdBy = decodedToken.user_id;
      let updatedBy = decodedToken.user_id;

      let idCountry = data.id_country;
      let idCity = data.id_city;
      let idRegion = data.id_region;
      let cTitle = data.title;
      let cSlug = data.slug_title;
      let cSubTitle = data.sub_title;
      let cDescription = data.description;
      let cTemplateName = data.template_name;
      let vaRelatedTags = data.tag;

      let cParentID = data.id_parent;
      let isChild = false;
      if (cParentID) {
        const vaParent = await Category.findByPk(cParentID);
        if (!vaParent) {
          const error = new Error("Parent Category not found");
          error.status = 404;
          throw error;
        }
        isChild = true;
      } else {
        cParentID = null;
      }

      if (!cTitle) {
        const error = new Error("Title is required");
        error.status = 400;
        throw error;
      }

      if (!data.template_name) {
        const error = new Error("Template Name is required");
        error.status = 400;
        throw error;
      }

      cSlug = !cSlug ? slugify(cTitle) : slugify(cSlug);

      const isLocationAvailable =
        idCountry || idCity || idRegion ? true : false;
      if (isLocationAvailable) {
        // Set location id group
        if (idCountry) {
          const dbCountry = await Country.findOne({ where: { id: idCountry } });
          if (!dbCountry) {
            const error = new Error(
              "Invalid location, please check your Bali area input"
            );
            error.status = 404;
            throw error;
          }

          idCity = null;
          idRegion = null;
        }

        if (idCity) {
          const dbCity = await City.findOne({ where: { id: idCity } });
          if (!dbCity) {
            const error = new Error(
              "Invalid Location, Please Check Your City Input"
            );
            error.status = 404;
            throw error;
          }
          idCountry = dbCity.dataValues.id_country;
          idRegion = null;
        }

        if (idRegion) {
          let isRegionExist = true;

          const dbRegion = await Region.findOne({ where: { id: idRegion } });
          if (!dbRegion) {
            isRegionExist = false;
          }
          idCity = dbRegion.dataValues.id_city;

          const dbCity = await City.findOne({ where: { id: idCity } });
          if (!dbCity) {
            isRegionExist = false;
          }
          idCountry = dbCity.dataValues.id_country;

          if (!isRegionExist) {
            const error = new Error(
              "Invalid Location, Please Check Your Region Input"
            );
            error.status = 404;
            throw error;
          }
        }

        let cWhere = `WHERE category_id = ${id} AND `;
        cWhere += idCountry
          ? "id_country = " + idCountry + " AND "
          : "id_country IS NULL AND ";
        cWhere += idCity
          ? "id_city = " + idCity + " AND "
          : "id_city IS NULL AND ";
        cWhere += idRegion ? "id_region = " + idRegion : "id_region IS NULL";
        const cSQL = `SELECT * FROM category_description ${cWhere};`;
        const [dbDataCategoryLoc, metadata] = await sequelize.query(cSQL);
        const dbLen = dbDataCategoryLoc.length;

        const vaData = {
          category_id: id,
          id_country: idCountry,
          id_city: idCity,
          id_region: idRegion,
          sub_title: cSubTitle,
          description: cDescription,
          createdBy: createdBy,
          createdAt: new Date(),
          updatedBy: updatedBy,
          updatedAt: new Date(),
        };

        if (dbLen > 0) {
          // Edit Sub-Title and Description Data in category_description Table
          await CategoryDescription.update(vaData, {
            where: { category_id: id },
          });
        } else {
          // Add Sub-Title and Description Data in category_description Table
          await CategoryDescription.create(vaData);
        }
      }

      const vaBody = {
        title: cTitle,
        slug_title: cSlug,
        sub_title: isLocationAvailable ? cSubTitleDB : cSubTitle,
        description: isLocationAvailable ? cDescDB : cDescription,
        template_name: cTemplateName,
        id_parent: cParentID,
        is_child: isChild,
        updatedBy: updatedBy,
        updatedAt: new Date(),
      };
      await category.update(vaBody, { where: { id } });

      if (vaRelatedTags) {
        await TagCategory.destroy({
          where: {
            id_category: id,
          },
        });
        const vaDataInsert = [];
        vaRelatedTags.forEach(async (element) => {
          const vaData = {
            id_category: id,
            id_tag: element,
          };
          vaDataInsert.push(vaData);
        });
        await TagCategory.bulkCreate(vaDataInsert);
      }

      const cacheKeyPrefix = "category";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);

      return category;
    } catch (error) {
      logger.error("Failed to update category", { id, error: error.message });
      throw error;
    }
  },

  async delete(id) {
    const transaction = await sequelize.transaction();
    try {
      const categoryId = parseInt(id);

      // Prevents deletion of the default category (ID 999)
      if (categoryId === 999) {
        const error = new Error("Cannot delete default category");
        error.status = 403;
        throw error;
      }

      const category = await Category.findByPk(id);
      if (!category) {
        const error = new Error("Category not found");
        error.status = 404;
        throw error;
      }

      // Before deleting, update all articles to revert to the default category
      await sequelize.query(
        `UPDATE articles SET category = 999, parent_category_id = NULL WHERE category = :id OR parent_category_id = :id`,
        {
          replacements: { id: categoryId },
          transaction,
        }
      );

      await category.destroy({
        where: {
          id: id,
        },
        transaction,
      });
      await transaction.commit();

      const cacheKeyPrefix = "category";
      await invalidateCacheByPattern(`${cacheKeyPrefix}`);

      return { message: "Category deleted" };
    } catch (error) {
      await transaction.rollback();
      if (error.name === "SequelizeForeignKeyConstraintError") {
        const error = new Error(
          "Cannot delete category because it is still used by some articles."
        );
        error.status = 400;
        throw error;
      }

      logger.error("Failed to delete category", { id, error: error.message });
      throw error;
    }
  },

  async getCategoryDescByLocation(req) {
    try {
      const vaParam = req.params;
      const cType = vaParam.type;
      const cIDLoc = vaParam.idLocation;
      const cID = vaParam.idCategory;

      const dbCategory = await Category.findByPk(cID);
      if (!dbCategory) {
        const error = new Error("Category not found");
        error.status = 404;
        throw error;
      }

      const vaRetval = {
        sub_title: dbCategory.sub_title,
        description: dbCategory.description,
      };

      let idCountry = null;
      let idCity = null;
      let idRegion = null;

      if (cType === "country") {
        idCountry = cIDLoc;
      } else if (cType === "city") {
        idCity = cIDLoc;
      } else if (cType === "region") {
        idRegion = cIDLoc;
      }

      if (idCountry) {
        const dbCountry = await Country.findOne({ where: { id: idCountry } });
        if (!dbCountry) {
          const error = new Error(
            "Invalid location, please check your Bali area input"
          );
          error.status = 404;
          throw error;
        }

        idCity = null;
        idRegion = null;
      }

      if (idCity) {
        const dbCity = await City.findOne({ where: { id: idCity } });
        if (!dbCity) {
          const error = new Error(
            "Invalid Location, Please Check Your City Input"
          );
          error.status = 404;
          throw error;
        }
        idCountry = dbCity.dataValues.id_country;
        idRegion = null;
      }

      if (idRegion) {
        let isRegionExist = true;

        const dbRegion = await Region.findOne({ where: { id: idRegion } });
        if (!dbRegion) {
          isRegionExist = false;
        }
        idCity = dbRegion.dataValues.id_city;

        const dbCity = await City.findOne({ where: { id: idCity } });
        if (!dbCity) {
          isRegionExist = false;
        }
        idCountry = dbCity.dataValues.id_country;

        if (!isRegionExist) {
          const error = new Error(
            "Invalid Location, Please Check Your Region Input"
          );
          error.status = 404;
          throw error;
        }
      }

      let cWhere = `WHERE category_id = ${cID} AND `;
      cWhere += idCountry
        ? "id_country = " + idCountry + " AND "
        : "id_country IS NULL AND ";
      cWhere += idCity
        ? "id_city = " + idCity + " AND "
        : "id_city IS NULL AND ";
      cWhere += idRegion ? "id_region = " + idRegion : "id_region IS NULL";
      const cSQL = `SELECT * FROM category_description ${cWhere};`;

      const [dbData, metadata] = await sequelize.query(cSQL);
      if (dbData.length > 0) {
        vaRetval["sub_title"] = dbData[0].sub_title;
        vaRetval["description"] = dbData[0].description;
      }

      return vaRetval;
    } catch (error) {
      logger.error("Failed to get category description by location", { error: error.message });
      throw error;
    }
  },
};
