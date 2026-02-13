import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { toSlug } from "../helpers/article.js";
import { response } from "../helpers/response.js";
import { encrypt } from "../helpers/crypto.js";
const { ConfigSMTP, SMTPProvider, sequelize } = db;

export default {
  async getSetupSMTP(req) {
    try {
      const vaQuery = req.query;
      const isView = parseInt(vaQuery.view);
      const cSQL = `SELECT
                    c.id, sp.provider_name as provider_name, c.host, 
                    c.port, c.secure, c.username, c.password, 
                    c.from_name, c.from_email, c.is_active, 
                    c.created_at AS createdAt, c.updated_at AS updatedAt
                  FROM
                    config_smtp AS c
                    LEFT JOIN smtp_providers sp ON sp.id = c.provider_name 
                  WHERE
                    c.id = :id;`;
      const [dbData, metadata] = await sequelize.query(cSQL, {
        replacements: { id: 1 },
      });
      const vaData = dbData[0];
      // const vaData = await ConfigSMTP.findOne({raw : true});
      if (!vaData) {
        const err = new Error("Data not found");
        err.status = 404;
        throw err;
      }

      if (isView) {
        vaData.password = encrypt(vaData.password);
      }

      vaData.secure = vaData.secure ? true : false;
      return vaData;
    } catch (err) {
      console.error(":: ERROR at Service getSetupSMTP :: \n", err);
      throw err;
    }
  },

  async setupSMTP(req) {
    try {
      const vaBody = req.body;

      /*
      vaBody.provider_name = vaBody.provider_id ;
      const vaInsert = {
        id : 1,
        ...vaBody
      }
      const newSetting = await ConfigSMTP.upsert(vaInsert);
      if(!newSetting){
        const err = new Error("Failed to update setting");
        err.status = 400;
        throw err;
      }
      */

      // Ambil record lama dulu
      const existingConfig = await ConfigSMTP.findByPk(1);
      if (!existingConfig) {
        // Kalau belum ada, buat baru saja
        const newConfig = await ConfigSMTP.create({
          id: 1,
          ...vaBody,
        });
        return newConfig;
      }

      // Filter hanya field yang dikirim (tidak undefined atau null)
      const updatedFields = {};
      for (const key in vaBody) {
        const value = vaBody[key];
        if (value !== undefined && value !== null && value !== "") {
          updatedFields[key] = value;
        }
      }

      // Update hanya field yang diubah
      await existingConfig.update(updatedFields);

      const cSQL = `SELECT
                    c.id, sp.provider_name as provider_name, c.host, 
                    c.port, c.secure, c.username, c.password, 
                    c.from_name, c.from_email, c.is_active, 
                    c.created_at AS createdAt, c.updated_at AS updatedAt
                  FROM
                    config_smtp AS c
                    LEFT JOIN smtp_providers sp ON sp.id = c.provider_name 
                  WHERE
                    c.id = :id;`;
      const [vaData, metadata] = await sequelize.query(cSQL, {
        replacements: { id: 1 },
      });
      if (!vaData) {
        const err = new Error("Data not found");
        err.status = 404;
        throw err;
      }

      return vaData;
    } catch (error) {
      console.error(":: ERROR at Service getSetupSMTP :: \n", error);
      throw error;
    }
  },

  async getSMTPProviders() {
    try {
      const vaData = await SMTPProvider.findAll({
        attributes: ["id", "provider_name", "host", "port", "secure"],
      });
      return vaData;
    } catch (err) {
      console.error(":: ERROR at Service getSMTPProviders :: \n", err);
      throw err;
    }
  },

  async getSMTPProviderByID(id) {
    try {
      if (!id) {
        const err = new Error("ID is required");
        err.status = 400;
        throw err;
      }

      const vaData = await SMTPProvider.findByPk(id);
      if (!vaData) {
        const err = new Error("SMTP Provider not found");
        err.status = 404;
        throw err;
      }
      return vaData;
    } catch (err) {
      console.error(":: ERROR at Service getSMTPProviderByID :: \n", err);
      throw err;
    }
  },
};
