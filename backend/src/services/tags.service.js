import db from "../models/index.js";
import { decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { toSlug } from "../helpers/article.js";
import logger from "../helpers/logger.js";
const { Tags, sequelize } = db;

export default {
  async getAll() {
    const [results, metadata] = await sequelize.query(
      `SELECT t.id, t.name, t.slug, a.path as icon
        FROM tags t
        LEFT JOIN asset_media a ON a.id = t.icon
        WHERE t.isActive = :isActive
        ORDER BY t.createdAt DESC;`,
        {
          replacements: { isActive : true}
        }
    );
    if (results.length < 1) throw new Error("Tags not found");
    return results;
  },

  async getById(id) {
    const [results, metadata] = await sequelize.query(
      `SELECT t.id, t.name, t.slug, a.path as icon
        FROM tags t
        LEFT JOIN asset_media a ON a.id = t.icon
        WHERE t.id = :id AND t.isActive = :isActive ;`,
      {
        replacements: { id, isActive: true },
      }
    );
    if (results.length < 1) throw new Error("Tags not found");
    return results;
  },

  async create(data) {
    try {
      const vaBody = data.body;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      vaBody.slug = !vaBody.slug ? toSlug(vaBody.name) : toSlug(vaBody.slug);
      vaBody.createdBy = decodedToken.user_id;
      vaBody.updatedBy = decodedToken.user_id;
      await Tags.create(vaBody);
      return vaBody;
    } catch (error) {
      logger.error("Failed to create tag", { error: error.message });
      throw error;
    }
  },

  async update(data) {
    try {
      const id = data.params.id;
      const vaBody = data.body;
      const vaCookies = data.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      vaBody.slug = !vaBody.slug ? toSlug(vaBody.name) : toSlug(vaBody.slug);
      vaBody.updatedBy = decodedToken.user_id;
      await Tags.update(vaBody, { where: { id } });
      return { id, ...vaBody };
    } catch (error) {
      logger.error("Failed to update tag", { id: data.params.id, error: error.message });
      throw error;
    }
  },

  async softDelete(id) {
    try {
      const result = await Tags.update({ isActive: false }, { where: { id } });
      return result;
    } catch (error) {
      throw error || new Error("Failed to delete category");
    }
  },

  async reActivateTags(id){
    try {
      const result = await Tags.update({ isActive: true }, { where: { id , isActive: false} });
      return result;
    } catch (error) {
      throw error || new Error("Failed to delete category");
    }
  }
};
