import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { toSlug } from "../helpers/article.js";
import { response } from "../helpers/response.js";
import { sendDynamicEmail } from "../helpers/mailer.js";
const { Articles, JobApplication, ConfigSMTP, sequelize } = db;

export default {
  async applyJob(idArticle, vaDataApplicant) {
    try {
      const vaArticle = await Articles.findOne({
        where: { id: idArticle, status: "published" },
        attributes: ["meta_data"],
        raw: true,
      });

      if (!vaArticle) {
        const error = new Error("Article not found");
        error.status = 404;
        throw error;
      }

      const vaMetaData =
        typeof vaArticle.meta_data === "string"
          ? JSON.parse(vaArticle.meta_data)
          : vaArticle.meta_data;
      const cCompanyName = vaMetaData.company_name;
      const cCompanyEmail = vaMetaData.company_email;

      // TODO: simpan data ke database
      const vaDataEntry = {
        id_article: idArticle,
        phone: vaDataApplicant.phone,
        applicant_email: vaDataApplicant.applicant_email,
        file: vaDataApplicant.file,
      };
      await JobApplication.create(vaDataEntry);

      if (cCompanyEmail) {
        // TODO: kirim email
        const cSubject =
          "Job Application from essentialbali to " + cCompanyName;
        const cBody =
          "Ada pelamar kerja baru dari essentialbali, ini alamat email pelamar: " +
          vaDataApplicant.applicant_email +
          " phone number " +
          vaDataApplicant.phone;
        await sendDynamicEmail(cCompanyEmail, cSubject, cBody, cBody, [
          { filename: "applicant.pdf", path: vaDataApplicant.file },
        ]);
      }

      return vaDataApplicant;
    } catch (error) {
      console.error(":: ERROR at Service applyJob :: \n", error);
      throw error;
    }
  },

  async getAllApplicant_1() {
    try {
      const vaData = await JobApplication.findAll({
        attributes: ["id", "id_article", "applicant_email", "phone", "file"],
        include: [
          {
            model: Articles, // Pastikan model Artikel telah diimpor
            as: "article", // Sesuaikan dengan alias dalam asosiasi
            attributes: ["title", "meta_data"],
            required: false, // LEFT JOIN (jika true = INNER JOIN)
          },
        ],
      });

      return vaData;
    } catch (error) {
      console.error(":: ERROR at Service getAllApplicant :: \n", error);
      throw error;
    }
  },

  async getAllApplicant_2() {
    try {
      const vaData = await JobApplication.findAll({
        attributes: [
          "id",
          "applicant_email",
          "phone",
          "file",
          ["id_article", "article_id"],
          [sequelize.col("article.title"), "article_title"],
          [sequelize.col("article.meta_data"), "article_meta_data"],
        ],
        include: [
          {
            model: Articles,
            as: "article",
            attributes: [],
            required: false,
          },
        ],
        raw: true, // Menghasilkan objek biasa
      });

      return vaData;
    } catch (error) {
      console.error(":: ERROR at Service getAllApplicant :: \n", error);
      throw error;
    }
  },

  async getAllApplicant(page = 1, limit = 10) {
    try {
      // Validasi dan konversi parameter
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      // Kueri dengan paginasi
      const { count, rows } = await JobApplication.findAndCountAll({
        attributes: [
          "id",
          "applicant_email",
          "phone",
          "file",
          ["id_article", "article_id"],
          [sequelize.col("article.title"), "article_title"],
          [sequelize.col("article.meta_data"), "article_meta_data"],
        ],
        include: [
          {
            model: Articles,
            as: "article",
            attributes: [],
            required: false,
          },
        ],
        limit: limitNumber,
        offset: offset,
        raw: true,
      });

      // Hitung total halaman
      const totalPages = Math.ceil(count / limitNumber);

      // Format respons
      return {
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: count,
          totalPages: totalPages,
        },
        applicant: rows,
      };
    } catch (error) {
      console.error(":: ERROR at Service getAllApplicant :: \n", error);
      throw error;
    }
  },
};
