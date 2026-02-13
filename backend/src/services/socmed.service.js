import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { toSlug } from "../helpers/article.js";
const { SocialMedia, AssetMedia, sequelize } = db;

export default {
  async getAll() {
    const [results, metadata] = await sequelize.query(
      `SELECT sm.id, sm.platform , a.path as icon, sm.url, sm.isActive
          FROM social_media sm
          LEFT JOIN asset_media a ON a.id = sm.icon
          Where sm.isActive = :isActive`,
      {
        replacements: { isActive: 1 },
      }
    );
    return results;
  },

  async getDataById(id) {
    const [results, metadata] = await sequelize.query(
      `SELECT sm.id, sm.platform , a.path as icon, sm.url, sm.isActive
          FROM social_media sm
          LEFT JOIN asset_media a ON a.id = sm.icon
          WHERE sm.id = :id;`,
      {
        replacements: { id },
      }
    );
    return results;
  },

  async create(data) {
    const vaBody = data.body;
    const vaCookies = data.cookies;
    const decodedToken = await decodeTokenFromCookie(vaCookies.token);
    vaBody.createdBy = decodedToken.user_id;
    vaBody.updatedBy = decodedToken.user_id;
    const vaInsert = {
      platform: vaBody.platform_name,
      icon: vaBody.icon,
      url: vaBody.url,
    };
    return await SocialMedia.create(vaInsert);
  },

  async update(data) {
    const id = data.params.id;
    const vaBody = data.body;
    const vaHeader = data.headers;
    const vaCookies = data.cookies ;
    const decodedToken = await decodeTokenFromCookie(vaCookies.token);
    const vaUpdate = {
      platform: vaBody.platform_name,
      icon: vaBody.icon,
      url: vaBody.url,
      updatedBy: decodedToken.user_id,
    };
    await SocialMedia.update(vaUpdate, { where: { id } });
    return { id, ...vaUpdate };
  },

  async softDelete(id) {
    try {
      const result = await SocialMedia.update({ isActive: false }, { where: { id } });
      return result;
    } catch (error) {
      throw error || new Error("Failed to delete category");
    }
  }
};
