import db from "../models/index.js";

const { AssetMedia } = db;

export default {
  async saveMedia(fileData, vaData) {
    const vaInsert = { ...vaData, ...fileData };
    const media = await AssetMedia.create(vaInsert);
    return media;
  },

  async getAllMedia(vaReq) {
    const vaQuery = vaReq.query;
    if (Object.keys(vaQuery).length > 0) {
      const pageNum = parseInt(vaQuery.page, 10) || 1;
      const limitNum = parseInt(vaQuery.limit, 10) || 20; // Default 20 item per halaman
      const offset = (pageNum - 1) * limitNum;

      const { count, rows } = await AssetMedia.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit: limitNum,
        offset: offset,
      });

      if (count === 0) {
        const cErrMsg = "Assets not found";
        const error = new Error(cErrMsg);
        error.status = 404;
        throw error;
      }

      const hasMore = offset + rows.length < count;
      if (vaQuery) {
        return {
          hasMore: hasMore, // boolean (true/false)
          media: rows, // Data media untuk halaman ini
        };
      }
    } else {
      const vaData = await AssetMedia.findAll({
        order: [["createdAt", "DESC"]],
      });

      let cErrMsg;
      if (!vaData || vaData.length < 1) {
        cErrMsg = "Assets not found";
        const error = new Error(cErrMsg);
        error.status = 404;
        throw error;
      }

      return vaData;
    }
  },

  async editMedia(id, vaData) {
    try {
      const asset = await AssetMedia.findByPk(id);
      let cErrMsg;
      if (!asset) {
        cErrMsg = "Asset not found";
        const error = new Error(cErrMsg);
        error.status = 404;
        throw error;
      }
      await asset.update(vaData);
      return asset;
    } catch (error) {
      throw error;
    }
  },

  async getMediaByID(id) {
    try {
      const asset = await AssetMedia.findByPk(id);
      let cErrMsg;
      if (!asset) {
        cErrMsg = "Asset not found";
        const error = new Error(cErrMsg);
        error.status = 404;
        throw error;
      }
      return asset;
    } catch (error) {
      throw error;
    }
  },
};
