import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import redis from "../../redisClient.js";

const { ArticleTemplating } = db;

const EXCLUDE_URL = ['/about', '/logo-header', '/footer', '/header']

async function updateHomeTemplateRedis(key, content) {
  if(EXCLUDE_URL.includes(key)) return
  return
  redis.set(key, content)
}

export default {
  async getAllTemplates() {
    const data = await ArticleTemplating.findAll({
      where: { isActive: true },
      raw: true,
    });
    return data;
  },

  async getTemplateByID(id) {
    try {
      // const data = await ArticleTemplating.findByPk(id, { raw: true });
      const data = await ArticleTemplating.findOne({
        where: { id: id, isActive: true },
      });
      return data;
    } catch (error) {
      console.log("apaini??", error);
      throw error;
    }
  },

  async createNewTemplate(data) {
    try {
      const vaBody = data.body;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const user_id = decodedToken.user_id;
      const vaInsertData = {
        ...vaBody,
        createdBy: user_id,
        updatedBy: user_id,
      };
      const setTemplate =  await ArticleTemplating.create(vaInsertData);
      if(setTemplate) {
        updateHomeTemplateRedis(vaBody.url, vaBody.content)
      }
      return setTemplate
    } catch (error) {
      throw error;
    }
  },

  async editTemplate(data) {
    try {
      const vaQuery = data.query;
      const vaBody = data.body;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const user_id = decodedToken.user_id;
      const vaUpdateData = {
        ...vaBody,
        updatedBy: user_id,
      };
      const setTemplate = await ArticleTemplating.update(vaUpdateData, {
        where: { url: vaQuery.url },
      });
      if(setTemplate) {
        updateHomeTemplateRedis(vaQuery.url, vaBody.content)
      }
      return setTemplate
    } catch (error) {
      throw error;
    }
  },

  async softDeleteTemplate(data) {
    try {
      const vaQuery = data.query;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const user_id = decodedToken.user_id;
      // const vaUpdateData = {
      //   isActive: false,
      //   updatedBy: user_id,
      // };
      return await ArticleTemplating.destroy({
        where: { url: vaQuery.url },
      });
    } catch (error) {
      throw error;
    }
  },

  async getTemplateByQuery(req) {
    try {
      const vaQuery = req.query;
      const cacheKey = `getTemplateByQuery_${vaQuery.url}`;
      console.log("function getTemplateByQuery : ", cacheKey);
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Get Data Template By Query from Cache");
        return JSON.parse(cachedData);
      }
      const data = await ArticleTemplating.findOne({
        where: vaQuery,
      });

      console.log("Data All City Cached to Redis");
      await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async restoreTemplate(req) {
    try {
      console.log(req.query);
      const vaQuery = req.query;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const user_id = decodedToken.user_id;
      const vaUpdateData = {
        isActive: true,
        updatedBy: user_id,
      };
      return await ArticleTemplating.update(vaUpdateData, {
        where: { url: vaQuery.url },
      });
    } catch (error) {
      throw error;
    }
  },
};
