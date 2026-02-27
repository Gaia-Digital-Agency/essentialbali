import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import { getParentCategory } from "../helpers/article.js";
import { DateTime } from "luxon";
import slugify from "slugify";
import validator from "validator";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { fn, Op, col, where } from "sequelize";
// import { errResponse } from "../helpers/response.js";

const window = new JSDOM("").window;
const createDOMPurify = DOMPurify(window);

const {
  ArticleTags,
  Articles, //new version
  ArticleVersion,
  ArticlePointScoring,
  Category,
  Tags,
  Region,
  City,
  Country,
  User,
  sequelize,
} = db;

export default {
  async test(req) {
    try {
      const dbData = await Articles.findAll({
        attributes: ["id"],
      });
      const dataLen = dbData.length;
      // console.log(dbData);
      for (let i = 0; i < dataLen; i++) {
        const id = dbData[i].id;
        const vaData = [];
        for (let j = 1; j <= 1000; j++) {
          const vaDetail = {
            id_article: id,
            description: "testing views",
            point: 1,
            ip_address: "::1",
            created_at: "2025-10-10 07:17:00",
            updated_at: "2025-10-10 07:17:00",
          };
          vaData.push(vaDetail);
        }
        await ArticlePointScoring.bulkCreate(vaData);
        // console.log(vaData) ;
      }

      return;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async testIP(req) {
    try {
      const vaQuery = req.query;
      const cID = vaQuery.id;

      // await Category.bulkCreate(vaData);
      return;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // ARTICLE VERSIONS SERVICE
  async addNewArticles(vaReq) {
    // console.log(":: addNewArticles ::");
    let transaction;
    try {
      let cErrMessage = "";
      let error = null;
      const vaBody = vaReq.body;
      const vaCookies = vaReq.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const authorName = decodedToken.name;

      transaction = await sequelize.transaction();

      const cTitle = validator.trim(vaBody.title);
      if (!cTitle) {
        cErrMessage = "Title is required";
        error = new Error(cErrMessage);
        error.status = 400;
        throw new Error(cErrMessage);
      }

      const cSlugTitle = !vaBody.slug
        ? slugify(cTitle, { lower: true, remove: /[*+~.()'"!:@]/g })
        : slugify(validator.trim(vaBody.slug), {
            lower: true,
            remove: /[*+~.()'"!:@]/g,
          }); //slugify(vaBody.slug);
      const cKategori = vaBody.category_id;
      if (!cKategori) {
        cErrMessage = "Category is required";
        error = new Error(cErrMessage);
        error.status = 400;
        throw new Error(cErrMessage);
      }

      if (!validator.isInt(String(cKategori))) {
        cErrMessage = "Category ID is invalid";
        error = new Error(cErrMessage);
        error.status = 400;
        throw new Error(cErrMessage);
      }

      const cParentKategori = await getParentCategory(cKategori);

      if (!vaBody.article_post) {
        cErrMessage = "Article Post is required";
        error = new Error(cErrMessage);
        error.status = 400;
        throw new Error(cErrMessage);
      }

      const sanitizedArticlePost = createDOMPurify.sanitize(
        vaBody.article_post || "",
      );

      if (!sanitizedArticlePost || sanitizedArticlePost.length === 0) {
        if (!vaBody.article_post) {
          cErrMessage = "Article Post is required";
          throw new Error(cErrMessage);
        }
        cErrMessage = "Article Post content is invalid or missing";
        throw new Error(cErrMessage);
      }

      const cStatus = vaBody.status;
      let publishedAt = null;
      let publishedBy = null;
      if (cStatus === "published") {
        publishedAt = new Date();
        publishedBy = userID;
      }

      const vaInsertArticle = {
        slug_title: cSlugTitle,
        author: authorName,
        category: cKategori,
        parent_category_id: cParentKategori,
        id_country: vaBody.id_country,
        id_city: vaBody.id_city,
        id_region: vaBody.id_region,
        createdBy: userID,
        pinned: vaBody.pinned,

        title: cTitle,
        sub_title: vaBody.sub_title,
        article_post: sanitizedArticlePost, //vaBody.article_post,
        tags: vaBody.tags,
        featured_image: vaBody.featured_image,
        featured_image_4_3: vaBody.featured_image_4_3,
        featured_image_16_9: vaBody.featured_image_16_9,
        meta_data: vaBody.meta_data,
        updatedBy: userID,
        status: cStatus,
        publishedAt: publishedAt,
        publishedBy: publishedBy,
        publishedBy: publishedBy,
      };
      const doInsArticle = await Articles.create(vaInsertArticle, {
        transaction,
      });

      // const cStatusCurrentArticle = (vaBody.is_published) ? 'published' : 'draft';
      const vaInsertArticleVersion = {
        article_id: doInsArticle.id,
        title: cTitle,
        sub_title: vaBody.sub_title,
        article_post: sanitizedArticlePost, //vaBody.article_post,
        tags: vaBody.tags,
        featured_image: vaBody.featured_image,
        featured_image_4_3: vaBody.featured_image_4_3,
        featured_image_16_9: vaBody.featured_image_16_9,
        meta_data: vaBody.meta_data,
        createdBy: userID,
        updatedBy: userID,
        status: cStatus,
        publishedAt: publishedAt,
        publishedBy: publishedBy,
      };
      const doInsArticleVersion = await ArticleVersion.create(
        vaInsertArticleVersion,
        { transaction },
      );

      //vaBody.tags = [1,2,3,4]
      if (vaBody.tags && Array.isArray(vaBody.tags)) {
        // const vaTags = vaBody.tags;
        const vaTags = vaBody.tags.filter((tag) =>
          validator.isInt(String(tag), { min: 1 }),
        );
        const vaInsTag = [];
        vaTags.map((tag) => {
          const vaInsertTag = {
            id_article: doInsArticle.id,
            id_tag: tag,
          };
          vaInsTag.push(vaInsertTag);
        });
        await ArticleTags.bulkCreate(vaInsTag, { transaction });
      }

      if (cStatus == "published") {
        await ArticleVersion.update(
          {
            publishedAt: new Date(),
          },
          {
            where: {
              article_id: doInsArticleVersion.id,
            },
            transaction,
          },
        );

        await Articles.update(
          {
            current_version_id: doInsArticleVersion.id,
            publishedAt: new Date(),
            publishedBy: userID,
            publishedBy: userID,
          },
          {
            where: {
              id: doInsArticle.id,
            },
            transaction,
          },
        );
      }

      await transaction.commit();
      vaBody.id = doInsArticle.id;
      return { ...vaBody, slug: cSlugTitle, category_id: cKategori };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      console.error(error);

      if (!error.status) {
        error.status = 400; // Asumsi error validasi/bisnis adalah 400 Bad Request
      }
      throw error;
    }
  },

  async getAllUnpublishedArticlesAdmin(req) {
    // USE
    try {
      /*
        super_admin 
          - Bisa melihat semua data artikel, dari semua negara, kota, dan region
        
        admin_country
          - Bisa melihat semua data artikel dari negara yang dimiliki, dan semua kota dan region di negaranya
      */

      let cWhereLocation = "";
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const vaUserRole = await User.findByPk(decodedToken.user_id, {
        attributes: ["user_level"],
        raw: true,
      });
      const cUserLevel = vaUserRole.user_level;
      const cIDCountryUser = decodedToken.id_country;
      const cIDCityUser = decodedToken.id_city;
      const cIDRegionUser = decodedToken.id_region;

      if (cUserLevel == "admin_country") {
        cWhereLocation = ` AND a.id_country = ${cIDCountryUser}`;
      }

      const [vaData, metadata] = await sequelize.query(
        `SELECT 
          av.id, av.article_id, av.title, av.sub_title, a.slug_title as slug, av.article_post, 
          av.tags, av.featured_image as featured_image_id, m.path as featured_image_url, av.meta_data, 
          av.status, av.publishedAt, av.scheduledAt, av.createdAt, av.createdBy, av.updatedAt, 
          av.updatedBy, a.author as author_name, 
          a.category as category_id, c.title as category_name, a.parent_category_id, c1.title as parent_category_name, 
          a.id_country, n.name as name_country, a.id_city, k.name as name_city, a.id_region, r.name as name_region
          FROM article_versions av 
            LEFT JOIN articles a ON a.id = av.article_id
            LEFT JOIN asset_media m ON m.id = av.featured_image
            LEFT JOIN category c ON c.id = a.category
            LEFT JOIN category c1 ON c1.id = a.parent_category_id
            LEFT JOIN country n ON n.id = a.id_country
            LEFT JOIN city k ON k.id = a.id_city
            LEFT JOIN region r ON r.id = a.id_region
          WHERE av.status <> 'published'
          ${cWhereLocation}
          ORDER BY av.updatedAt DESC;
        `,
      );
      return vaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async publishArticle(req) {
    // USE
    try {
      /**
       *
       * jika artikel sudah ada current_version_id di table articles,
       *  - update status article_version dengan id yang sama dengan current_version_id di table articles menjadi archived
       *  - update current_version_id di table articles menjadi id yang ada di param
       *
       * ambil data artikel dengan ID dari article_versions
       * jika status publish, tampilkan error
       * jika status draft di ArticleVersion, update
       *  status menjadi published
       *  update publishedAt
       *  update updatedBy
       *  update updatedAt
       *  update current_version_id pada table article isi dengan id article_versions
       */
      const vaParam = req.params;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;

      const dbArticleVersion = await ArticleVersion.findOne({
        attributes: ["id", "article_id", "status"],
        where: { id: vaParam.id },
      });

      if (dbArticleVersion.status === "published") {
        throw new Error("Article already published");
      }

      const dbArticle = await Articles.findOne({
        attributes: ["current_version_id"],
        where: { id: dbArticleVersion.article_id },
      });

      if (dbArticle.current_version_id === vaParam.id) {
        throw new Error("Article already published");
      }

      let doArchived = [];
      if (dbArticle.current_version_id) {
        // jika curr version ada, maka update status article_version
        // dengan id yang sama dengan current_version_id di table articles menjadi archived
        const vaUpdArticleVersion = {
          status: "archived",
          updatedBy: userID,
        };
        doArchived = ArticleVersion.update(vaUpdArticleVersion, {
          where: { id: dbArticle.current_version_id },
        });
      }

      const cArticleID = dbArticleVersion.article_id;

      const vaUpdArticle = {
        current_version_id: vaParam.id,
      };
      const doUpdArticle = Articles.update(vaUpdArticle, {
        where: { id: cArticleID },
      });

      const vaUpdArticleVersion = {
        status: "published",
        publishedAt: new Date(),
        updatedBy: userID,
      };
      const doUpdArticleVersion = ArticleVersion.update(vaUpdArticleVersion, {
        where: { id: vaParam.id },
      });

      await Promise.all([doArchived, doUpdArticle, doUpdArticleVersion]);
      // return "published";
      return { status: "published" };
    } catch (error) {
      // console.error(error);
      throw error;
    }
  },

  async editCurrentArticle_old(req) {
    // USE
    const t = await sequelize.transaction();
    try {
      const vaParam = req.params;
      const vaBody = req.body;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const cTitle = vaBody.title;
      // const cSlugTitle = slugify(cTitle);
      const cSlugTitle = !vaBody.slug ? slugify(cTitle) : slugify(vaBody.slug);

      /**
       * 1. Ambil data artikel dengan ID dari article_versions
       * 2. Jika artikel status = draft, update artikel saja, nanti nya status tetap draft
       * 3. Jika artikel status = publish, insert ke article_versions, dengan id_article yang sama dari article_versions
       */

      // 1. Ambil data artikel dengan ID dari article_versions
      const vaCurrentArticle = await ArticleVersion.findByPk(vaParam.id, {
        attributes: ["id", "article_id", "status"],
        lock: t.LOCK.UPDATE, // lock row biar gak race condition
        transaction: t,
      });
      const idCurrentArticle = vaCurrentArticle.id;
      const idArticle = vaCurrentArticle.article_id;
      const cStatusCurrentArticle = vaCurrentArticle.status;

      let vaDataArticleVersion,
        vaDataArticle = {};
      let doInsArticle,
        doInsArticleVersion = [];

      if (
        cStatusCurrentArticle === "draft" ||
        cStatusCurrentArticle === "archived"
      ) {
        // console.log("masuk segmen draft / archived");
        // 2. Jika artikel status = draft, update artikel saja, nanti nya status tetap draft
        vaDataArticleVersion = {
          article_id: idArticle,
          title: cTitle,
          sub_title: vaBody.sub_title,
          article_post: vaBody.article_post,
          tags: vaBody.tags,
          featured_image: vaBody.featured_image,
          meta_data: vaBody.meta_data,
          status: "draft",
          updatedBy: userID,
        };
        doInsArticleVersion = ArticleVersion.update(vaDataArticleVersion, {
          where: { id: idCurrentArticle },
          transaction: t,
        });

        const cKategori = vaBody.category_id;
        const cParentKategori = await getParentCategory(cKategori);
        vaDataArticle = {
          slug_title: cSlugTitle,
          category: cKategori,
          parent_category_id: cParentKategori,
          id_country: vaBody.id_country,
          id_city: vaBody.id_city,
          id_region: vaBody.id_region,
        };
        doInsArticle = Articles.update(vaDataArticle, {
          where: { id: idArticle },
          transaction: t,
        });
      } else if (cStatusCurrentArticle === "published") {
        // 3. Jika artikel status = publish, insert ke article_versions, dengan id_article yang sama dari article_versions
        // console.log("masuk segmen published");
        const alreadyDraft = await ArticleVersion.findOne({
          where: {
            article_id: idArticle,
            status: "draft",
          },
          transaction: t,
        });

        if (!alreadyDraft) {
          vaDataArticleVersion = {
            article_id: idArticle,
            title: cTitle,
            sub_title: vaBody.sub_title,
            article_post: vaBody.article_post,
            tags: vaBody.tags,
            featured_image: vaBody.featured_image,
            meta_data: vaBody.meta_data,
            status: "draft",
            createdBy: userID,
            updatedBy: userID,
          };

          doInsArticleVersion = ArticleVersion.create(vaDataArticleVersion, {
            transaction: t,
          });
        }
      }

      // DO INSERT / UPDATE DATABASE ;
      await Promise.all([doInsArticle, doInsArticleVersion]);
      await t.commit();
      return "success";
    } catch (error) {
      // console.error(error);
      await t.rollback();
      throw error;
    }
  },

  async editCurrentArticle_v1(req) {
    const t = await sequelize.transaction();
    try {
      const vaParam = req.params;
      const vaBody = req.body;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const cTitle = vaBody.title;
      const cSlugTitle = !vaBody.slug ? slugify(cTitle) : slugify(vaBody.slug);

      // 1. Ambil data artikel dengan ID dari article_versions
      const vaCurrentArticle = await ArticleVersion.findByPk(vaParam.id, {
        attributes: ["id", "article_id", "status"],
        lock: t.LOCK.UPDATE, // biar gak race condition
        transaction: t,
      });

      if (!vaCurrentArticle) {
        throw new Error("Article version not found");
      }

      const idCurrentArticle = vaCurrentArticle.id;
      const idArticle = vaCurrentArticle.article_id;
      const cStatusCurrentArticle = vaCurrentArticle.status;

      let vaDataArticleVersion = {
        article_id: idArticle,
        title: cTitle,
        sub_title: vaBody.sub_title,
        article_post: vaBody.article_post,
        tags: vaBody.tags,
        featured_image: vaBody.featured_image,
        meta_data: vaBody.meta_data,
        updatedBy: userID,
      };

      const cKategori = vaBody.category_id;
      const cParentKategori = await getParentCategory(cKategori);
      const vaDataArticle = {
        slug_title: cSlugTitle,
        category: cKategori,
        parent_category_id: cParentKategori,
        id_country: vaBody.id_country,
        id_city: vaBody.id_city,
        id_region: vaBody.id_region,
        pinned: vaBody.pinned,
      };

      if (["draft", "archived"].includes(cStatusCurrentArticle)) {
        // 2. Draft / Archived → update version + article
        vaDataArticleVersion.status = "draft";

        await ArticleVersion.update(vaDataArticleVersion, {
          where: { id: idCurrentArticle },
          transaction: t,
        });

        await Articles.update(vaDataArticle, {
          where: { id: idArticle },
          transaction: t,
        });
      } else if (cStatusCurrentArticle === "published") {
        // 3. Published → cek draft
        const alreadyDraft = await ArticleVersion.findOne({
          where: { article_id: idArticle, status: "draft" },
          transaction: t,
        });

        vaDataArticleVersion.status = "draft";

        if (alreadyDraft) {
          // update draft existing
          await alreadyDraft.update(vaDataArticleVersion, { transaction: t });
        } else {
          // create draft baru
          vaDataArticleVersion.createdBy = userID;
          await ArticleVersion.create(vaDataArticleVersion, { transaction: t });
        }

        // tetap update Articles
        await Articles.update(vaDataArticle, {
          where: { id: idArticle },
          transaction: t,
        });
      }

      await t.commit();

      return {
        status: "success",
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async editCurrentArticle(req) {
    // ON PROGRESS
    const t = await sequelize.transaction();
    try {
      const vaParam = req.params;
      const vaBody = req.body;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const cArticleID = vaParam.id;
      const cTitle = vaBody.title;
      const cSlugTitle = !vaBody.slug ? slugify(cTitle) : slugify(vaBody.slug);

      // 1. Check apakah ada artikel dengan ID di Articles
      const vaCurrentArticle = await Articles.findByPk(cArticleID, {
        attributes: ["id", "status"],
        lock: t.LOCK.UPDATE, // biar gak race condition
        transaction: t,
      });

      // 2. Jika artikel tidak ada, throw error
      if (!vaCurrentArticle) {
        const error = new Error("Article not found");
        error.status = 404;
        throw error;
      }

      if (vaBody.tags) {
        await ArticleTags.destroy({
          where: {
            id_article: cArticleID,
          },
          transaction: t,
        });

        let vaTags;
        if (typeof vaBody.tags === "string") {
          vaTags = JSON.parse(vaBody.tags);
        } else {
          vaTags = vaBody.tags;
        }
        // console.log("MOMENT => " , vaTags);
        if (vaTags.length > 0) {
          const vaInsTag = [];
          vaTags.map((tag) => {
            const vaInsertTag = {
              id_article: cArticleID,
              id_tag: tag,
            };
            vaInsTag.push(vaInsertTag);
          });
          // const doInsArticleTag =
          await ArticleTags.bulkCreate(vaInsTag, { transaction: t });
        }

        vaBody.tags = vaTags;
      }

      // Update Articles
      const vaDataArticle = {
        title: cTitle,
        sub_title: vaBody.sub_title,
        slug_title: cSlugTitle,
        article_post: vaBody.article_post,
        tags: vaBody.tags,
        featured_image: vaBody.featured_image,
        featured_image_4_3: vaBody.featured_image_4_3,
        featured_image_16_9: vaBody.featured_image_16_9,
        meta_data: vaBody.meta_data,
        category: vaBody.category_id,
        parent_category_id: await getParentCategory(vaBody.category_id),
        id_country: vaBody.id_country,
        id_city: vaBody.id_city,
        id_region: vaBody.id_region,
        pinned: vaBody.pinned,
        updatedBy: userID,
        updatedAt: new Date(),
        status: vaBody.status,
        pinned: vaBody.pinned,
      };

      await Articles.update(vaDataArticle, {
        where: { id: cArticleID },
        transaction: t,
      });

      //Insert Data yang terbaru ke article_versions
      const vaDataArticleVersion = {
        article_id: cArticleID,
        title: cTitle,
        sub_title: vaBody.sub_title,
        article_post: vaBody.article_post,
        tags: vaBody.tags,
        featured_image: vaBody.featured_image,
        featured_image_4_3: vaBody.featured_image_4_3,
        featured_image_16_9: vaBody.featured_image_16_9,
        meta_data: vaBody.meta_data,
        updatedBy: userID,
        status: vaBody.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userID,
      };
      await ArticleVersion.create(vaDataArticleVersion, { transaction: t });

      await t.commit();

      return {
        status: "success",
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async getArticleByCategoryIDPerCity(
    id_category,
    id_country,
    id_city,
    filtered_tags = [],
    limit = 10,
    offset = 0,
    page = 1,
  ) {
    // USE
    try {
      let vaData = [];
      const cQuery = `SELECT 
          av.id, av.article_id, av.title, av.sub_title, a.slug_title as slug, av.article_post, 
          av.tags, av.featured_image as featured_image_id, m.path as url_image, av.meta_data, 
          av.status, av.publishedAt, av.scheduledAt, av.createdAt, av.createdBy, av.updatedAt, 
          av.updatedBy, a.author as author_name, a.category as category_id, c.title as category_name, 
          a.parent_category_id, c1.title as parent_category_name, a.id_country, 
          n.name, a.id_city, k.name, a.id_region, r.name 
          FROM article_versions av 
            LEFT JOIN articles a ON a.id = av.article_id
            LEFT JOIN asset_media m ON m.id = av.featured_image
            LEFT JOIN category c ON c.id = a.category
            LEFT JOIN category c1 ON c1.id = a.parent_category_id
            LEFT JOIN country n ON n.id = a.id_country
            LEFT JOIN city k ON k.id = a.id_city
            LEFT JOIN region r ON r.id = a.id_region
          WHERE av.status = 'published'
          AND a.category = :id_category
          AND a.id_country = :id_country
          AND a.id_city = :id_city
          ORDER BY av.updatedAt DESC
          LIMIT :limit OFFSET :offset;`;

      const [vaResDB, metadata] = await sequelize.query(cQuery, {
        replacements: {
          id_category,
          id_country,
          id_city,
          limit,
          offset,
        },
      });

      vaData = vaResDB;
      if (filtered_tags.length > 0) {
        const filteredData = vaData.filter((item) =>
          item.tags.some((tag) => filtered_tags.includes(tag)),
        );
        vaData = filteredData;
      }

      const totalData = vaData.length;
      if (totalData < 1) return [];

      const vaResults = {
        pagination: {
          page,
          limit,
          totalData,
          totalPages: Math.ceil(totalData / limit),
        },
        articles: vaData,
      };

      return vaResults;
    } catch (error) {
      // console.error(error);
      throw error;
    }
  },

  async nonActivateArticle(req) {
    // USE
    try {
      // Check apakah artikel ada atau tidak
      const cIDArticle = req.params.id;
      console.log("Winters Day => ", cIDArticle);
      const dbArticle = await Articles.findOne({
        where: {
          id: cIDArticle,
          status: "published",
        },
      });

      console.log("Winters Day => ", dbArticle);

      if (!dbArticle) {
        const error = new Error("Article not found");
        error.status = 404;
        throw error;
      }
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const cIDCountryUser = decodedToken.id_country;
      const cIDCityUser = decodedToken.id_city;
      const vaUserRole = await User.findByPk(decodedToken.user_id, {
        attributes: ["user_level"],
        raw: true,
      });
      const cUserLevel = vaUserRole.user_level;

      const cIDCountryDBArticle = dbArticle.id_country;
      const cIDCityDBArticle = dbArticle.id_city;
      const cIDRegionDBArticle = dbArticle.id_region;

      // Ambil data kota berdasarkan negara user
      const dbCityListByUserCountry = await sequelize.query(
        `SELECT c.id as id_city, c.name as nama_kota from city c
        LEFT JOIN country n ON n.id = c.id_country
        where n.id = :countryID;`,
        {
          replacements: { countryID: cIDCountryUser },
        },
      );
      const vaAllowedCity = dbCityListByUserCountry[0].map((c) => c.id_city);

      if (cUserLevel == "admin_city") {
        // user hanya bisa memasukkan artikel untuk kota dan region mereka sendiri
        if (
          cIDCountryUser !== cIDCountryDBArticle ||
          cIDCityUser !== cIDCityDBArticle
        ) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }

        if (!vaAllowedCity.includes(cIDCityDBArticle)) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }

        const dbRegionListByUserCityCountry = await sequelize.query(
          `SELECT r.id as id_region, r.name as nama_region from region r
        LEFT JOIN city c ON c.id = r.id_city
        LEFT JOIN country n ON n.id = c.id_country
        where r.id_city = :cityID AND n.id = :countryID ;`,
          {
            replacements: { cityID: cIDCountryUser, countryID: cIDCountryUser },
          },
        );
        const vaAllowedRegion = dbRegionListByUserCityCountry[0].map(
          (r) => r.id_region,
        );
        // check apakah user memasukkan region sesuai dengan kota dan negara yang dimiliki
        if (!vaAllowedRegion.includes(cIDRegionDBArticle)) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }
      } else if (cUserLevel == "admin_country") {
        // user hanya bisa memasukkan artikel untuk negaranya sendiri
        if (cIDCountryUser !== cIDCountryDBArticle) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }

        // check apakah user memasukkan kota sesuai dengan negara yang dimiliki
        if (!vaAllowedCity.includes(cIDCityDBArticle)) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }

        // user hanya bisa input artikel untuk region yang ada di negaranya sendiri
        const dbRegionListByUserCityCountry = await sequelize.query(
          `SELECT r.id as id_region, r.name as nama_region from region r
          LEFT JOIN city c ON c.id = r.id_city
          LEFT JOIN country n ON n.id = c.id_country
          where r.id_city = :cityID OR n.id = :countryID ;`,
          {
            replacements: { cityID: cIDCountryUser, countryID: cIDCountryUser },
          },
        );
        const vaAllowedRegion = dbRegionListByUserCityCountry[0].map(
          (r) => r.id_region,
        );
        if (!vaAllowedRegion.includes(cIDRegionDBArticle)) {
          throw new Error("Anda tidak memiliki akses untuk artikel ini");
        }
      } else if (cUserLevel == "super_admin") {
        // user super admin bisa memasukkan semua artikel
      } else {
        throw new Error("Anda tidak memiliki akses untuk artikel ini");
      }

      await ArticleVersion.update(
        { status: "bin" },
        { where: { id: cIDArticle } },
      );

      const vaData = await Articles.update(
        { status: "bin" },
        { where: { id: cIDArticle } },
      );
      return vaData;
    } catch (error) {
      throw error;
    }
  },

  async getArticles(req) {
    // USE
    try {
      const vaQuery = req.query;

      let cWhere = " ";
      let joinTags = "";
      if (vaQuery) {
        const idQuery = vaQuery.id;
        if (idQuery) {
          const idQueryType = typeof idQuery;
          if (idQueryType == "object") {
            cWhere += `AND a.id IN (${idQuery.join(",")})`;
          } else if (idQueryType == "string") {
            cWhere += `AND a.id = ${idQuery}`;
          }
        }

        const categoryQuery = vaQuery.category;
        if (categoryQuery) {
          if (typeof categoryQuery === "string") {
            cWhere += ` AND a.category = ${categoryQuery}`;
          } else if (typeof categoryQuery === "object") {
            cWhere += ` AND a.category IN (${categoryQuery.join(",")})`;
          }
        }

        const id_countryQuery = vaQuery.id_country;
        if (id_countryQuery) {
          if (typeof id_countryQuery === "string") {
            cWhere += ` AND a.id_country = ${id_countryQuery}`;
          } else if (typeof id_countryQuery === "object") {
            cWhere += ` AND a.id_country IN (${id_countryQuery.join(",")})`;
          }
        }

        const id_cityQuery = vaQuery.id_city;
        if (id_cityQuery) {
          if (typeof id_cityQuery === "string") {
            cWhere += ` AND a.id_city = ${id_cityQuery}`;
          } else if (typeof id_cityQuery === "object") {
            cWhere += ` AND a.id_city IN (${id_cityQuery.join(",")})`;
          }
        }

        const id_regionQuery = vaQuery.id_region;
        if (id_regionQuery) {
          if (typeof id_regionQuery === "string") {
            cWhere += ` AND a.id_region = ${id_regionQuery}`;
          } else if (typeof id_regionQuery === "object") {
            cWhere += ` AND a.id_region IN (${id_regionQuery.join(",")})`;
          }
        }

        const statusQuery = vaQuery.status;
        if (statusQuery) {
          if (typeof statusQuery === "string") {
            cWhere += ` AND a.status = '${statusQuery}'`;
          } else if (typeof statusQuery === "object") {
            // status query per object diapit oleh petik
            statusQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.status IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === statusQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugTagQuery = vaQuery.slug_tag;
        if (slugTagQuery) {
          if (typeof slugTagQuery === "string") {
            const dbTag = await Tags.findOne({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            if (!dbTag) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            const idSlug = dbTag.id;
            // console.log("idSlug", idSlug);
            cWhere += ` AND JSON_CONTAINS(tags, '${idSlug}')`;
          } else if (typeof slugTagQuery === "object") {
            // console.log("slugTagQuery => ", slugTagQuery);
            const dbTag = await Tags.findAll({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            // console.log("dbTag => ", dbTag);

            if (dbTag.length < 1) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            dbTag.map((item, index) => {
              const idSlug = item.id;
              if (index === 0)
                cWhere += ` AND (JSON_CONTAINS(tags, '${idSlug}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${idSlug}')`;
              if (index === dbTag.length - 1) cWhere += ` )`;
            });
          }
        }

        const tagQuery = vaQuery.tag;
        if (tagQuery) {
          if (typeof tagQuery === "string") {
            cWhere += ` AND JSON_CONTAINS(tags, ${tagQuery})`;
          } else if (typeof tagQuery === "object") {
            // console.log(tagQuery);
            tagQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND (JSON_CONTAINS(tags, '${item}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${item}')`;
              if (index === tagQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugQuery = vaQuery.slug;
        if (slugQuery) {
          if (typeof slugQuery === "string") {
            cWhere += ` AND a.slug_title = '${slugQuery}'`;
          } else if (typeof slugQuery === "object") {
            // status query per object diapit oleh petik
            slugQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCategoryQuery = vaQuery.slug_category;
        if (slugCategoryQuery) {
          if (typeof slugCategoryQuery === "string") {
            cWhere += ` AND c.slug_title = '${slugCategoryQuery}'`;
          } else if (typeof slugCategoryQuery === "object") {
            slugCategoryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND c.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCategoryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCountryQuery = vaQuery.slug_country;
        if (slugCountryQuery) {
          if (typeof slugCountryQuery === "string") {
            cWhere += ` AND n.slug = '${slugCountryQuery}'`;
          } else if (typeof slugCountryQuery === "object") {
            slugCountryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND n.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCountryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCityQuery = vaQuery.slug_city;
        if (slugCityQuery) {
          if (typeof slugCityQuery === "string") {
            cWhere += ` AND k.slug = '${slugCityQuery}'`;
          } else if (typeof slugCityQuery === "object") {
            slugCityQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND k.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCityQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugRegionQuery = vaQuery.slug_region;
        if (slugRegionQuery) {
          if (typeof slugRegionQuery === "string") {
            cWhere += ` AND r.slug = '${slugRegionQuery}'`;
          } else if (typeof slugRegionQuery === "object") {
            slugRegionQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND r.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugRegionQuery.length - 1) cWhere += ` )`;
            });
          }
        }
      }

      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 10;
      const nOffset = (nPage - 1) * nLimit;

      if (nOffset < 0) {
        throw new Error("Page must be greater than 0");
      }

      // console.log(joinTags);
      // return;

      const cSQL = `SELECT a.id, a.title, a.sub_title, a.slug_title as slug, a.article_post,
                    a.tags as tag_json, a.featured_image as featured_image_id, m.path as featured_image_url, a.meta_data,
                    a.status, a.createdAt as publishedAt, a.createdAt, a.createdBy, a.updatedAt,
                    a.updatedBy, a.author as author_name,
                    a.category as category_id, c.title as category_name, 
                    c.slug_title as slug_category,
                    a.parent_category_id, c1.title as parent_category_name,
                    a.id_country, n.name as name_country, n.slug as slug_country,
                    a.id_city, k.name as name_city, k.slug as slug_city,
                    a.id_region, r.name as name_region, r.slug as slug_region,
                    a.pinned,n.timezone
                    FROM articles a 
                    ${joinTags}
                    LEFT JOIN asset_media m ON m.id = a.featured_image
                    LEFT JOIN category c ON c.id = a.category
                    LEFT JOIN category c1 ON c1.id = a.parent_category_id
                    LEFT JOIN country n ON n.id = a.id_country
                    LEFT JOIN city k ON k.id = a.id_city
                    LEFT JOIN region r ON r.id = a.id_region
                    LEFT JOIN Users u ON u.id = a.createdBy
                    WHERE a.title <> '' 
                    ${cWhere}
                    ORDER BY a.pinned DESC, a.updatedAt DESC ;`;
      // console.log(cSQL);
      const [vaData, metadata] = await sequelize.query(cSQL);

      // Setup timezone
      vaData.map((article) => {
        let timezone = article.timezone;
        if (!timezone) {
          timezone = "Asia/Makassar";
        }
        const createdArticleTime = article.createdAt;
        const publishedArticleTime = article.publishedAt;
        const updatedArticleTime = article.updatedAt;

        const utcTimeCreated = DateTime.fromJSDate(createdArticleTime, {
          zone: "UTC",
        });
        const utcTimePublished = DateTime.fromJSDate(publishedArticleTime, {
          zone: "UTC",
        });
        const utcTimeUpdated = DateTime.fromJSDate(updatedArticleTime, {
          zone: "UTC",
        });

        const localTimeCreated = utcTimeCreated.setZone(timezone);
        const localTimePublished = utcTimePublished.setZone(timezone);
        const localTimeUpdated = utcTimeUpdated.setZone(timezone);

        const displayTimeCreated = localTimeCreated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimePublished = localTimePublished.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimeUpdated = localTimeUpdated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );

        // article.createdAt = localTime.toJSDate();
        article.createdAt = displayTimeCreated;
        article.publishedAt = displayTimePublished;
        article.updatedAt = displayTimeUpdated;
      });

      const totalData = vaData.length;
      if (totalData < 1) return [];

      const paginatedData = vaData.slice(nOffset, nOffset + nLimit);

      let vaResPagination = {
        pagination: {
          page: nPage,
          limit: nLimit,
          totalData,
          totalPages: Math.ceil(totalData / nLimit),
        },
      };

      if (!vaQuery.page || !vaQuery.limit) {
        vaResPagination = {};
      }

      const vaResults = {
        ...vaResPagination,
        articles: paginatedData,
      };

      return vaResults;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getArticlesNew_v1(req) {
    // USE
    try {
      const vaQuery = req.query;

      let cWhere = " ";
      let joinTags = "";
      if (vaQuery) {
        /*
          Query yang bisa direquest : 
          is_published, category, parent_category_id , id_country , id_city , id_region, tag
        */
        const idQuery = vaQuery.id;
        if (idQuery) {
          const idQueryType = typeof idQuery;
          if (idQueryType == "object") {
            cWhere += `AND a.id IN (${idQuery.join(",")})`;
          } else if (idQueryType == "string") {
            cWhere += `AND a.id = ${idQuery}`;
          }
        }

        const categoryQuery = vaQuery.category;
        if (categoryQuery) {
          if (typeof categoryQuery === "string") {
            cWhere += ` AND a.category = ${categoryQuery}`;
          } else if (typeof categoryQuery === "object") {
            cWhere += ` AND a.category IN (${categoryQuery.join(",")})`;
          }
        }

        const id_countryQuery = vaQuery.id_country;
        if (id_countryQuery) {
          if (typeof id_countryQuery === "string") {
            cWhere += ` AND a.id_country = ${id_countryQuery}`;
          } else if (typeof id_countryQuery === "object") {
            cWhere += ` AND a.id_country IN (${id_countryQuery.join(",")})`;
          }
        }

        const id_cityQuery = vaQuery.id_city;
        if (id_cityQuery) {
          if (typeof id_cityQuery === "string") {
            cWhere += ` AND a.id_city = ${id_cityQuery}`;
          } else if (typeof id_cityQuery === "object") {
            cWhere += ` AND a.id_city IN (${id_cityQuery.join(",")})`;
          }
        }

        const id_regionQuery = vaQuery.id_region;
        if (id_regionQuery) {
          if (typeof id_regionQuery === "string") {
            cWhere += ` AND a.id_region = ${id_regionQuery}`;
          } else if (typeof id_regionQuery === "object") {
            cWhere += ` AND a.id_region IN (${id_regionQuery.join(",")})`;
          }
        }

        const statusQuery = vaQuery.status;
        if (statusQuery) {
          if (typeof statusQuery === "string") {
            cWhere += ` AND a.status = '${statusQuery}'`;
          } else if (typeof statusQuery === "object") {
            // status query per object diapit oleh petik
            statusQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.status IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === statusQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        /*
          const is_publishedQuery = vaQuery.is_published;
          if (is_publishedQuery) {
            const isPublished =
              is_publishedQuery === "true" || is_publishedQuery === "1" ? 1 : 0;
            if (isPublished === 1) {
              cWhere += ` AND av.status = 'published'`;
            } else {
              cWhere += ` AND av.status <> 'published'`;
            }
          }
        */

        /***** OLD TAGS FILTER 
        const slugTagQuery = vaQuery.slug_tag;
        if (slugTagQuery) {
          if (typeof slugTagQuery === "string") {
            const dbTag = await Tags.findOne({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            if (!dbTag) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            const idSlug = dbTag.id;
            console.log("idSlug", idSlug);
            cWhere += ` AND JSON_CONTAINS(tags, '${idSlug}')`;
          } else if (typeof slugTagQuery === "object") {
            console.log("slugTagQuery => ", slugTagQuery);
            const dbTag = await Tags.findAll({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            console.log("dbTag => ", dbTag);

            if (dbTag.length < 1) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            dbTag.map((item, index) => {
              const idSlug = item.id;
              if (index === 0)
                cWhere += ` AND (JSON_CONTAINS(tags, '${idSlug}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${idSlug}')`;
              if (index === dbTag.length - 1) cWhere += ` )`;
            });
          }
        }

        const tagQuery = vaQuery.tag;
        if (tagQuery) {
          if (typeof tagQuery === "string") {
            cWhere += ` AND JSON_CONTAINS(tags, ${tagQuery})`;
          } else if (typeof tagQuery === "object") {
            // console.log(tagQuery);
            tagQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND (JSON_CONTAINS(tags, '${item}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${item}')`;
              if (index === tagQuery.length - 1) cWhere += ` )`;
            });
          }
        }
        */

        const slugTagQuery = vaQuery.slug_tag;
        if (slugTagQuery) {
          if (typeof slugTagQuery === "string") {
            const dbTag = await Tags.findOne({
              where: { slug: slugTagQuery },
              attributes: ["id"],
              raw: true,
            });

            if (!dbTag) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            joinTags += ` 
              INNER JOIN article_tags at ON at.id_article = a.id 
              AND at.id_tag = ${dbTag.id} `;
          } else if (typeof slugTagQuery === "object") {
            const dbTag = await Tags.findAll({
              where: { slug: slugTagQuery },
              attributes: ["id"],
              raw: true,
            });

            if (dbTag.length < 1) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            const ids = dbTag.map((t) => t.id).join(",");
            joinTags += ` 
              INNER JOIN article_tags at ON at.id_article = a.id 
              AND at.id_tag IN (${ids}) `;
          }
        }

        const tagQuery = vaQuery.tag;
        if (tagQuery) {
          if (typeof tagQuery === "string") {
            joinTags += ` 
              INNER JOIN article_tags at2 ON at2.id_article = a.id 
              AND at2.id_tag = ${tagQuery} `;
          } else if (typeof tagQuery === "object") {
            const ids = tagQuery.join(",");
            joinTags += ` 
              INNER JOIN article_tags at2 ON at2.id_article = a.id 
              AND at2.id_tag IN (${ids}) `;
          }
        }

        const slugQuery = vaQuery.slug;
        if (slugQuery) {
          if (typeof slugQuery === "string") {
            cWhere += ` AND a.slug_title = '${slugQuery}'`;
          } else if (typeof slugQuery === "object") {
            // status query per object diapit oleh petik
            slugQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCategoryQuery = vaQuery.slug_category;
        if (slugCategoryQuery) {
          if (typeof slugCategoryQuery === "string") {
            cWhere += ` AND c.slug_title = '${slugCategoryQuery}'`;
          } else if (typeof slugCategoryQuery === "object") {
            slugCategoryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND c.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCategoryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCountryQuery = vaQuery.slug_country;
        if (slugCountryQuery) {
          if (typeof slugCountryQuery === "string") {
            cWhere += ` AND n.slug = '${slugCountryQuery}'`;
          } else if (typeof slugCountryQuery === "object") {
            slugCountryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND n.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCountryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCityQuery = vaQuery.slug_city;
        if (slugCityQuery) {
          if (typeof slugCityQuery === "string") {
            cWhere += ` AND k.slug = '${slugCityQuery}'`;
          } else if (typeof slugCityQuery === "object") {
            slugCityQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND k.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCityQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugRegionQuery = vaQuery.slug_region;
        if (slugRegionQuery) {
          if (typeof slugRegionQuery === "string") {
            cWhere += ` AND r.slug = '${slugRegionQuery}'`;
          } else if (typeof slugRegionQuery === "object") {
            slugRegionQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND r.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugRegionQuery.length - 1) cWhere += ` )`;
            });
          }
        }
      }

      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 10;
      const nOffset = (nPage - 1) * nLimit;

      if (nOffset < 0) {
        throw new Error("Page must be greater than 0");
      }

      // console.log(joinTags);
      // return;

      const cSQL = `SELECT a.id, a.title, a.sub_title, a.slug_title as slug, a.article_post,
                    a.tags as tag_json, a.featured_image as featured_image_id, m.path as featured_image_url, a.meta_data,
                    a.status, a.createdAt as publishedAt, a.createdAt, a.createdBy, a.updatedAt,
                    a.updatedBy, a.author as author_name,
                    a.category as category_id, c.title as category_name, 
                    c.slug_title as slug_category,
                    a.parent_category_id, c1.title as parent_category_name,
                    a.id_country, n.name as name_country, n.slug as slug_country,
                    a.id_city, k.name as name_city, k.slug as slug_city,
                    a.id_region, r.name as name_region, r.slug as slug_region,
                    a.pinned,n.timezone
                    FROM articles a 
                    ${joinTags}
                    LEFT JOIN asset_media m ON m.id = a.featured_image
                    LEFT JOIN category c ON c.id = a.category
                    LEFT JOIN category c1 ON c1.id = a.parent_category_id
                    LEFT JOIN country n ON n.id = a.id_country
                    LEFT JOIN city k ON k.id = a.id_city
                    LEFT JOIN region r ON r.id = a.id_region
                    LEFT JOIN Users u ON u.id = a.createdBy
                    WHERE a.title <> '' 
                    ${cWhere}
                    ORDER BY a.pinned DESC, a.updatedAt DESC ;`;
      // console.log(cSQL);
      const [dbData, metadata] = await sequelize.query(cSQL);

      const vaData = await Promise.all(
        dbData.map(async (vaDetail) => {
          const dbArticleTags = await ArticleTags.findAll({
            attributes: ["id_tag"],
            where: { id_article: vaDetail.id },
            raw: true,
          });

          // ambil semua tag_id
          const vaTags = dbArticleTags.map((tag) => tag.id_tag);

          // gabungkan ke object lama
          return {
            ...vaDetail,
            tags: vaTags,
          };
        }),
      );

      // Setup timezone
      vaData.map((article) => {
        let timezone = article.timezone;
        if (!timezone) {
          timezone = "Asia/Makassar";
        }
        const createdArticleTime = article.createdAt;
        const publishedArticleTime = article.publishedAt;
        const updatedArticleTime = article.updatedAt;

        const utcTimeCreated = DateTime.fromJSDate(createdArticleTime, {
          zone: "UTC",
        });
        const utcTimePublished = DateTime.fromJSDate(publishedArticleTime, {
          zone: "UTC",
        });
        const utcTimeUpdated = DateTime.fromJSDate(updatedArticleTime, {
          zone: "UTC",
        });

        const localTimeCreated = utcTimeCreated.setZone(timezone);
        const localTimePublished = utcTimePublished.setZone(timezone);
        const localTimeUpdated = utcTimeUpdated.setZone(timezone);

        const displayTimeCreated = localTimeCreated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimePublished = localTimePublished.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimeUpdated = localTimeUpdated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );

        // article.createdAt = localTime.toJSDate();
        article.createdAt = displayTimeCreated;
        article.publishedAt = displayTimePublished;
        article.updatedAt = displayTimeUpdated;
      });

      const totalData = vaData.length;
      if (totalData < 1) return [];

      const paginatedData = vaData.slice(nOffset, nOffset + nLimit);

      let vaResPagination = {
        pagination: {
          page: nPage,
          limit: nLimit,
          totalData,
          totalPages: Math.ceil(totalData / nLimit),
        },
      };

      if (!vaQuery.page || !vaQuery.limit) {
        vaResPagination = {};
      }

      const vaResults = {
        ...vaResPagination,
        articles: paginatedData,
      };

      return vaResults;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getArticlesNew(req) {
    // USE
    try {
      const vaQuery = req.query;
      const ip_address =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      let cWhere = " ";
      let joinTags = "";

      let cFieldsTrending = "";
      let cJoinTrending = "";
      let cGroupByTrending = "";
      let cOrderByTrending = "";

      if (vaQuery) {
        const pinnedQuery = vaQuery.pinned;
        if (pinnedQuery) {
          cWhere += `AND a.pinned = ${pinnedQuery}`;
        }

        const idQuery = vaQuery.id;
        if (idQuery) {
          const idQueryType = typeof idQuery;
          if (idQueryType == "object") {
            cWhere += `AND a.id IN (${idQuery.join(",")})`;
          } else if (idQueryType == "string") {
            cWhere += `AND a.id = ${idQuery}`;
          }
        }

        const categoryQuery = vaQuery.category;
        if (categoryQuery) {
          if (typeof categoryQuery === "string") {
            /**
             * Check apakah kategori ini adalah parent atau bukan
             * Jika kategori merupakan parent, maka ambil juga child nya
             * jika kategori bukan parent, maka ambil kategori itu saja
             */

            const vaCategories = [];
            const dbCategory = await Category.findAll({
              where: {
                [Op.or]: [{ id: categoryQuery }, { id_parent: categoryQuery }],
              },
              raw: true,
            });

            dbCategory.map((category) => {
              vaCategories.push(category.id);
            });

            // cWhere += ` AND a.category = ${categoryQuery}`;
            cWhere += ` AND a.category IN (${vaCategories.join(",")})`;
          } else if (typeof categoryQuery === "object") {
            cWhere += ` AND a.category IN (${categoryQuery.join(",")})`;
          }
        }

        const id_countryQuery = vaQuery.id_country;
        if (id_countryQuery) {
          if (typeof id_countryQuery === "string") {
            cWhere += ` AND a.id_country = ${id_countryQuery}`;
          } else if (typeof id_countryQuery === "object") {
            cWhere += ` AND a.id_country IN (${id_countryQuery.join(",")})`;
          }
        }

        const id_cityQuery = vaQuery.id_city;
        if (id_cityQuery) {
          if (typeof id_cityQuery === "string") {
            cWhere += ` AND a.id_city = ${id_cityQuery}`;
          } else if (typeof id_cityQuery === "object") {
            cWhere += ` AND a.id_city IN (${id_cityQuery.join(",")})`;
          }
        }

        const id_regionQuery = vaQuery.id_region;
        if (id_regionQuery) {
          if (typeof id_regionQuery === "string") {
            cWhere += ` AND a.id_region = ${id_regionQuery}`;
          } else if (typeof id_regionQuery === "object") {
            cWhere += ` AND a.id_region IN (${id_regionQuery.join(",")})`;
          }
        }

        const statusQuery = vaQuery.status;
        if (statusQuery) {
          if (typeof statusQuery === "string") {
            cWhere += ` AND a.status = '${statusQuery}'`;
          } else if (typeof statusQuery === "object") {
            // status query per object diapit oleh petik
            statusQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.status IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === statusQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugTagQuery = vaQuery.slug_tag;
        if (slugTagQuery) {
          if (typeof slugTagQuery === "string") {
            cWhere += ` AND t.slug = '${slugTagQuery}'`;
          } else if (typeof slugTagQuery === "object") {
            // status query per object diapit oleh petik
            slugTagQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND t.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugTagQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const tagQuery = vaQuery.tag;
        if (tagQuery) {
          if (typeof tagQuery === "string") {
            cWhere += ` AND at.id_tag = ${tagQuery}`;
          } else if (typeof tagQuery === "object") {
            // console.log(tagQuery);
            tagQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND at.id_tag IN (${item}`;
              else cWhere += `, ${item}`;
              if (index === tagQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugQuery = vaQuery.slug;
        // console.log(slugQuery, 'slugQuery')
        if (slugQuery) {
          if (typeof slugQuery === "string") {
            cWhere += ` AND a.slug_title = '${slugQuery}'`;
            await this.scoringArticles(slugQuery, ip_address);
          } else if (typeof slugQuery === "object") {
            // status query per object diapit oleh petik
            slugQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCategoryQuery = vaQuery.slug_category;
        if (slugCategoryQuery) {
          if (typeof slugCategoryQuery === "string") {
            cWhere += ` AND c.slug_title = '${slugCategoryQuery}'`;
          } else if (typeof slugCategoryQuery === "object") {
            slugCategoryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND c.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCategoryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCountryQuery = vaQuery.slug_country;
        if (slugCountryQuery) {
          if (typeof slugCountryQuery === "string") {
            cWhere += ` AND n.slug = '${slugCountryQuery}'`;
          } else if (typeof slugCountryQuery === "object") {
            slugCountryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND n.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCountryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCityQuery = vaQuery.slug_city;
        if (slugCityQuery) {
          if (typeof slugCityQuery === "string") {
            cWhere += ` AND k.slug = '${slugCityQuery}'`;
          } else if (typeof slugCityQuery === "object") {
            slugCityQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND k.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCityQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugRegionQuery = vaQuery.slug_region;
        if (slugRegionQuery) {
          if (typeof slugRegionQuery === "string") {
            cWhere += ` AND r.slug = '${slugRegionQuery}'`;
          } else if (typeof slugRegionQuery === "object") {
            slugRegionQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND r.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugRegionQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        // const dPublishedDateStart = vaQuery.published_date_start;
        // const dPublishedDateEnd = vaQuery.published_date_end;
        // if (dPublishedDateStart && dPublishedDateEnd) {
        //   cWhere += ` AND DATE(a.publishedAt) BETWEEN '${dPublishedDateStart}' AND '${dPublishedDateEnd}'`;
        // } else if (dPublishedDateStart && !dPublishedDateEnd) {
        //   cWhere += ` AND DATE(a.publishedAt) BETWEEN '${dPublishedDateStart}' AND '${dPublishedDateStart}'`;
        const dPublishedDateStart = vaQuery.published_date_start;
        const dPublishedDateEnd = vaQuery.published_date_end;
        if (dPublishedDateStart && dPublishedDateEnd) {
          cWhere += ` AND DATE(a.publishedAt) BETWEEN '${dPublishedDateStart}' AND '${dPublishedDateEnd}'`;
        } else if (dPublishedDateStart && !dPublishedDateEnd) {
          cWhere += ` AND DATE(a.publishedAt) BETWEEN '${dPublishedDateStart}' AND '${dPublishedDateStart}'`;
        }

        const isAnyMetaData = Object.keys(vaQuery).some((key) =>
          key.includes("metaData"),
        );

        if (isAnyMetaData) {
          const vaMetaDataKeys = Object.keys(vaQuery).filter((key) =>
            key.includes("metaData"),
          );

          const hasStartTime = vaMetaDataKeys.includes("metaData_start_time");
          const hasEndTime = vaMetaDataKeys.includes("metaData_end_time");

          // ✅ CASE KHUSUS: jika keduanya ada (start & end)
          if (hasStartTime && hasEndTime) {
            const startValue = vaQuery.metaData_start_time;
            const endValue = vaQuery.metaData_end_time;

            cWhere += ` AND (
              (JSON_EXTRACT(a.meta_data, '$.end_time') >= '${startValue}'
                AND JSON_EXTRACT(a.meta_data, '$.start_time') <= '${endValue}')
                OR JSON_EXTRACT(a.meta_data, '$.whole_day') = 1
            )`;

            // Hapus dari array agar tidak diproses dua kali di bawah
            vaMetaDataKeys.splice(
              vaMetaDataKeys.indexOf("metaData_start_time"),
              1,
            );
            vaMetaDataKeys.splice(
              vaMetaDataKeys.indexOf("metaData_end_time"),
              1,
            );
          }

          vaMetaDataKeys.map((key) => {
            let cConditionValue = vaQuery[key];
            const cConditionKey = key.replace(/^metaData_/, "");
            const typeOfValue = typeof cConditionValue;

            if (cConditionKey.includes("multi")) {
              if (typeOfValue === "string") {
                // Input: metaData_day = "monday"
                // Perhatikan: '"${cConditionValue}"' -> menghasilkan '"monday"'
                cWhere += ` AND JSON_CONTAINS(a.meta_data, '"${cConditionValue}"', '$.${cConditionKey}')`;
              } else if (
                typeOfValue === "object" &&
                Array.isArray(cConditionValue)
              ) {
                // Input: metaData_day = ["monday", "tuesday"]
                // Mencari data yang mengandung SALAH SATU (OR)
                const conditions = cConditionValue
                  .map(
                    (item) =>
                      `JSON_CONTAINS(a.meta_data, '"${item}"', '$.${cConditionKey}')`,
                  )
                  .join(" OR ");
                cWhere += ` AND (${conditions})`;
              }
            } else {
              if (typeOfValue === "string") {
                const vaConditionStart = ["start_date", "start_time"];
                const vaConditionEnd = ["end_date", "end_time"];

                if (vaConditionStart.includes(cConditionKey)) {
                  // Jika key adalah start_date, gunakan >=
                  cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') >= '${cConditionValue}'`;
                } else if (vaConditionEnd.includes(cConditionKey)) {
                  //cConditionKey === "end_date"
                  // Jika key adalah end_date, gunakan <=
                  cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') <= '${cConditionValue}'`;
                } else {
                  // Untuk string lainnya, gunakan = (perilaku default Anda sebelumnya)
                  cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') = '${cConditionValue}'`;
                }

                // cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') = '${cConditionValue}'`;
              } else if (typeOfValue === "number") {
                cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') = ${cConditionValue}`;
              } else if (typeOfValue === "object") {
                let isPrice = false;
                let isPriceRanged = false;

                if (
                  cConditionKey.includes("price") ||
                  cConditionKey.includes("salary")
                ) {
                  isPrice = true;
                  const cValLen = cConditionValue.length;
                  if (cValLen > 1) {
                    isPriceRanged = true;
                    const nMax = Math.max(...cConditionValue);
                    const nMin = Math.min(...cConditionValue);
                    cConditionValue = [nMin, nMax];
                  }
                }

                cConditionValue.sort((a, b) => a - b);
                cConditionValue.map((item, index) => {
                  if (isPrice) {
                    if (isPriceRanged) {
                      if (index === 0)
                        cWhere += ` AND (JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') >= ${item}`;
                      else
                        cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') <= ${item})`;
                    } else {
                      if (index === 0)
                        cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') = ${item}`;
                    }
                  } else {
                    if (index === 0)
                      cWhere += ` AND JSON_EXTRACT(a.meta_data, '$.${cConditionKey}') IN ('${item}'`;
                    else cWhere += `, '${item}'`;
                    if (index === cConditionValue.length - 1) cWhere += ` )`;
                  }
                });
              }
            }
          });
        }

        const isTrendingQuery = vaQuery.isTrending;
        if (isTrendingQuery) {
          cFieldsTrending = ", COALESCE(aps.trending_score, 0) as trending_score";
          cJoinTrending = ` LEFT JOIN (
                              SELECT 
                                id_article, 
                                SUM(
                                  point * EXP(-0.05 * (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(createdAt)) / 3600)
                                ) AS trending_score 
                              FROM article_point_scoring 
                              GROUP BY id_article
                            ) aps ON aps.id_article = a.id `;
          cGroupByTrending = ``; // No longer need to group in the main query
          cOrderByTrending = ` trending_score DESC, `;
        }
      }

      const nPage = parseInt(vaQuery.page) || 1;
      const nLimit = parseInt(vaQuery.limit) || 10;
      const nOffset = (nPage - 1) * nLimit;

      if (nOffset < 0) {
        throw new Error("Page must be greater than 0");
      }

      // console.log(cWhere);

      const cSQL = `SELECT a.id, a.title, a.sub_title, a.slug_title as slug, 
                    a.article_post,
                    a.tags, 
                    
                    a.featured_image as featured_image_id, m.path as featured_image_url, 
                    m.title as featured_image_title, m.alt_text as featured_image_alt_text,
                    m.caption as featured_image_caption, m.description as featured_image_description,
                    
                    a.featured_image_4_3 as featured_image_4_3_id, m43.path as featured_image_4_3_url,  
                    m43.title as featured_image_4_3_title, m43.alt_text as featured_image_4_3_alt_text,
                    m43.caption as featured_image_4_3_caption, m43.description as featured_image_4_3_description,
                    
                    a.featured_image_16_9 as featured_image_16_9_id, m169.path as featured_image_16_9_url, 
                    m169.title as featured_image_16_9_title, m169.alt_text as featured_image_16_9_alt_text,
                    m169.caption as featured_image_16_9_caption, m169.description as featured_image_16_9_description,
                    
                    a.meta_data,
                    a.status, a.createdAt as publishedAt, a.createdAt, a.createdBy, 
                    
                    IFNULL(a.updatedAt, a.publishedAt) as updatedAt,
                    a.updatedBy, a.author as author_name,
                    a.category as category_id, c.title as category_name, 
                    c.slug_title as slug_category,
                    a.parent_category_id, c1.title as parent_category_name,
                    a.id_country, n.name as name_country, n.slug as slug_country, mFlag.path as country_flag,
                    a.id_city, k.name as name_city, k.slug as slug_city,
                    a.id_region, r.name as name_region, r.slug as slug_region,
                    a.pinned,n.timezone, at.id_tag, t.slug as slug_tag,
                    a.publishedAt, a.publishedBy
                    ${cFieldsTrending}
                    FROM articles a 
                    ${cJoinTrending}
                    LEFT JOIN article_tags at ON at.id_article = a.id
                    LEFT JOIN tags t ON t.id = at.id_tag
                    LEFT JOIN asset_media m ON m.id = a.featured_image
                    LEFT JOIN asset_media m43 ON m43.id = a.featured_image_4_3
                    LEFT JOIN asset_media m169 ON m169.id = a.featured_image_16_9
                    LEFT JOIN category c ON c.id = a.category
                    LEFT JOIN category c1 ON c1.id = a.parent_category_id
                    LEFT JOIN country n ON n.id = a.id_country
                    LEFT JOIN asset_media mFlag ON mFlag.id = n.flag_icon
                    LEFT JOIN city k ON k.id = a.id_city
                    LEFT JOIN region r ON r.id = a.id_region
                    LEFT JOIN Users u ON u.id = a.createdBy
                    WHERE a.title <> '' 
                    ${cWhere}
                    ${cGroupByTrending}
                    ORDER BY a.pinned DESC, ${cOrderByTrending} a.publishedAt DESC;`;
      // console.log(cSQL);
      const [dbData, metadata] = await sequelize.query(cSQL);

      // CHECKING 1 START
      // const xxx = [];
      // for (let x = 0; x < dbData.length; x++) {
      //   const data = dbData[x];
      //   const vaDDD = {
      //     title: data.title,
      //     publishedAt: data.publishedAt,
      //     publishedBy: data.publishedBy,
      //     pinned: data.pinned,
      //   };
      //   xxx.push(vaDDD);
      // }
      // console.table(xxx);
      // CHECKING 1 START

      /*
      const vaData = Object.values(
        dbData.reduce((acc, curr) => {
          if (!acc[curr.id]) {
            // clone object pertama kali
            acc[curr.id] = {
              ...curr,
              tags_ids: [curr.id_tag],
              tags_slugs: [curr.slug_tag],
            };
            delete acc[curr.id].id_tag;
            delete acc[curr.id].slug_tag;
          } else {
            // kalau id sama, push id_tag ke array
            acc[curr.id].tags_ids.push(curr.id_tag);
            acc[curr.id].tags_slugs.push(curr.slug_tag);
          }
          return acc;
        }, {})
      );
      */

      const articlesMap = new Map();
      const vaData = []; // Array ini akan mempertahankan urutan SQL
      for (const row of dbData) {
        let article = articlesMap.get(row.id);

        if (!article) {
          // Jika artikel ini baru pertama kali ditemukan
          article = {
            ...row,
            // Inisialisasi array tags (cek jika tag-nya null)
            tags_ids: row.id_tag ? [row.id_tag] : [],
            tags_slugs: row.slug_tag ? [row.slug_tag] : [],
          };

          // Hapus properti tag yang duplikat
          delete article.id_tag;
          delete article.slug_tag;

          articlesMap.set(row.id, article); // Simpan di Map untuk pengecekan berikutnya
          vaData.push(article); // Tambahkan ke array vaData (urutannya akan benar)
        } else {
          // Jika artikel sudah ada di Map, tambahkan tag-nya saja
          if (row.id_tag) {
            article.tags_ids.push(row.id_tag);
          }
          if (row.slug_tag) {
            article.tags_slugs.push(row.slug_tag);
          }
        }
      }

      // CHECKING 2 START
      // const yyy = [];
      // for (let x = 0; x < vaData.length; x++) {
      //   const data = vaData[x];
      //   const vaDDD = {
      //     title: data.title,
      //     sub_title: data.sub_title,
      //     publishedAt: data.publishedAt,
      //     publishedBy: data.publishedBy,
      //     pinned: data.pinned,
      //   };
      //   yyy.push(vaDDD);
      // }
      // console.table(yyy);
      // CHECKING 2 END

      // Setup timezone
      await Promise.all(vaData.map(async (article) => {
        const idArticle = article.id;
        const articleScore = await this.getArticleScore(idArticle);

        let timezone = article.timezone;
        if (!timezone) {
          timezone = "Asia/Makassar";
        }

        const createdArticleTime = article.createdAt;
        const publishedArticleTime = article.publishedAt;
        const updatedArticleTime = (!article.updatedAt) ? article.publishedAt : article.updatedAt;

        // console.log(updatedArticleTime) ;

        const utcTimeCreated = DateTime.fromJSDate(createdArticleTime, {
          zone: "UTC",
        });
        const utcTimePublished = DateTime.fromJSDate(publishedArticleTime, {
          zone: "UTC",
        });
        const utcTimeUpdated = DateTime.fromJSDate(updatedArticleTime, {
          zone: "UTC",
        });

        const localTimeCreated = utcTimeCreated.setZone(timezone);
        const localTimePublished = utcTimePublished.setZone(timezone);
        const localTimeUpdated = utcTimeUpdated.setZone(timezone);

        const displayTimeCreated = localTimeCreated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimePublished = localTimePublished.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimeUpdated = localTimeUpdated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );

        article.createdAt = displayTimeCreated;
        article.publishedAt = displayTimePublished;
        article.updatedAt = displayTimeUpdated;
      }));

      const totalData = vaData.length;
      if (totalData < 1) return [];

      const paginatedData = vaData.slice(nOffset, nOffset + nLimit);

      let vaResPagination = {
        pagination: {
          page: nPage,
          limit: nLimit,
          totalData,
          totalPages: Math.ceil(totalData / nLimit),
        },
      };

      if (!vaQuery.page || !vaQuery.limit) {
        vaResPagination = {};
      }

      const vaResults = {
        ...vaResPagination,
        articles: paginatedData,
      };

      return vaResults;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getArticleByID(id, vaQuery) {
    // USE
    try {
      // console.log("getArticleByID", vaQuery);
      let cWhere = " ";
      let cFields = "";
      if (vaQuery) {
        const cFieldQuery = vaQuery.fields;

        const vaField = {
          id: "a.id",
          // article_id: "a.article_id",
          title: "a.title",
          sub_title: "a.sub_title",
          slug_title: "a.slug_title as slug",
          slug: "a.slug_title as slug",
          article_post: "a.article_post",
          tags: "a.tags",

          featured_image_id: "a.featured_image as featured_image_id",
          featured_image_4_3_id:
            "a.featured_image_4_3 as featured_image_4_3_id",
          featured_image_16_9_id:
            "a.featured_image_16_9 as featured_image_16_9_id",

          featured_image_url: "m.path as featured_image_url",
          featured_image_4_3_url: "m43.path as featured_image_4_3_url",
          featured_image_16_9_url: "m169.path as featured_image_16_9_url",

          featured_image_4_3_title: "m43.title as featured_image_4_3_title",
          featured_image_4_3_alt_text:
            "m43.alt_text as featured_image_4_3_alt_text",
          featured_image_4_3_caption:
            "m43.caption as featured_image_4_3_caption",
          featured_image_4_3_description:
            "m43.description as featured_image_4_3_description",

          featured_image_16_9_title: "m43.title as featured_image_16_9_title",
          featured_image_16_9_alt_text:
            "m43.alt_text as featured_image_16_9_alt_text",
          featured_image_16_9_caption:
            "m43.caption as featured_image_16_9_caption",
          featured_image_16_9_description:
            "m43.description as featured_image_16_9_description",

          featured_image_title: "m43.title as featured_image_title",
          featured_image_alt_text: "m43.alt_text as featured_image_alt_text",
          featured_image_caption: "m43.caption as featured_image_caption",
          featured_image_description:
            "m43.description as featured_image_description",

          meta_data: "a.meta_data",
          status: "a.status",
          publishedAt: "a.createdAt as publishedAt",
          // scheduledAt: "a.scheduledAt",
          createdAt: "a.createdAt",
          createdBy: "a.createdBy",
          updatedAt: "a.updatedAt",
          updatedBy: "a.updatedBy",
          author_name: "a.author as author_name",
          category_id: "a.category as category_id",
          category_name: "c.title as category_name",
          slug_category: "c.slug_title as slug_category",
          parent_category_id: "a.parent_category_id",
          parent_category_name: "c1.title as parent_category_name",
          id_country: "a.id_country",
          name_country: "n.name as name_country",
          slug_country: "n.slug as slug_country",
          country_flag: "n.flag_icon as country_flag",
          id_city: "a.id_city",
          name_city: "k.name as name_city",
          slug_city: "k.slug as slug_city",
          id_region: "a.id_region",
          name_region: "r.name as name_region",
          slug_region: "r.slug as slug_region",
          pinned: "a.pinned",
          timezone: "n.timezone",
        };

        if (cFieldQuery) {
          if (typeof cFieldQuery === "string") {
            cFields = vaField[cFieldQuery];
          } else if (typeof cFieldQuery === "object") {
            cFields = cFieldQuery.map((item) => vaField[item]).join(",");
          }
        } else {
          cFields = Object.values(vaField).join(",");
        }

        /*
          Query yang bisa direquest : 
          is_published, category, parent_category_id , id_country , id_city , id_region, tag
        */
        const idQuery = vaQuery.id;
        // console.log("typeof idQuery => ", typeof idQuery);
        if (idQuery) {
          const idQueryType = typeof idQuery;
          if (idQueryType == "object") {
            cWhere += `AND a.id IN (${idQuery.join(",")})`;
          } else if (idQueryType == "string") {
            cWhere += `AND a.id = ${idQuery}`;
          }
        }

        const categoryQuery = vaQuery.category;
        // console.log("typeof categoryQuery => ", typeof categoryQuery);
        if (categoryQuery) {
          if (typeof categoryQuery === "string") {
            cWhere += ` AND a.category = ${categoryQuery}`;
          } else if (typeof categoryQuery === "object") {
            cWhere += ` AND a.category IN (${categoryQuery.join(",")})`;
          }
        }

        const id_countryQuery = vaQuery.id_country;
        // console.log("typeof id_countryQuery => ", typeof id_countryQuery);
        if (id_countryQuery) {
          if (typeof id_countryQuery === "string") {
            cWhere += ` AND a.id_country = ${id_countryQuery}`;
          } else if (typeof id_countryQuery === "object") {
            cWhere += ` AND a.id_country IN (${id_countryQuery.join(",")})`;
          }
        }

        const id_cityQuery = vaQuery.id_city;
        // console.log("typeof id_cityQuery => ", typeof id_cityQuery);
        if (id_cityQuery) {
          if (typeof id_cityQuery === "string") {
            cWhere += ` AND a.id_city = ${id_cityQuery}`;
          } else if (typeof id_cityQuery === "object") {
            cWhere += ` AND a.id_city IN (${id_cityQuery.join(",")})`;
          }
        }

        const id_regionQuery = vaQuery.id_region;
        // console.log("typeof id_regionQuery => ", typeof id_regionQuery);
        if (id_regionQuery) {
          if (typeof id_regionQuery === "string") {
            cWhere += ` AND a.id_region = ${id_regionQuery}`;
          } else if (typeof id_regionQuery === "object") {
            cWhere += ` AND a.id_region IN (${id_regionQuery.join(",")})`;
          }
        }

        const is_publishedQuery = vaQuery.is_published;
        if (is_publishedQuery) {
          const isPublished =
            is_publishedQuery === "true" || is_publishedQuery === "1" ? 1 : 0;
          if (isPublished === 1) {
            cWhere += ` AND a.status = 'published'`;
          } else {
            cWhere += ` AND a.status <> 'published'`;
          }
        }

        const slugTagQuery = vaQuery.slug_tag;
        if (slugTagQuery) {
          if (typeof slugTagQuery === "string") {
            const dbTag = await Tags.findOne({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            if (!dbTag) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            const idSlug = dbTag.id;
            // console.log("idSlug", idSlug);
            cWhere += ` AND JSON_CONTAINS(tags, '${idSlug}')`;
          } else if (typeof slugTagQuery === "object") {
            // console.log("slugTagQuery => ", slugTagQuery);
            const dbTag = await Tags.findAll({
              where: {
                slug: slugTagQuery,
              },
              attributes: ["id"],
              raw: true,
            });

            if (!dbTag) {
              const error = new Error("Article not found");
              error.status = 404;
              throw error;
            }

            dbTag.map((item, index) => {
              const idSlug = item.id;
              if (index === 0)
                cWhere += ` AND (JSON_CONTAINS(tags, '${idSlug}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${idSlug}')`;
              if (index === dbTag.length - 1) cWhere += ` )`;
            });
          }
        }

        const tagQuery = vaQuery.tag;
        if (tagQuery) {
          if (typeof tagQuery === "string") {
            cWhere += ` AND JSON_CONTAINS(tags, '1')`;
          } else if (typeof tagQuery === "object") {
            // console.log(tagQuery);
            tagQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND (JSON_CONTAINS(tags, '${item}')`;
              cWhere += ` OR JSON_CONTAINS(tags, '${item}')`;
              if (index === tagQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugQuery = vaQuery.slug;
        if (slugQuery) {
          if (typeof slugQuery === "string") {
            cWhere += ` AND a.slug_title = '${slugQuery}'`;
          } else if (typeof slugQuery === "object") {
            // status query per object diapit oleh petik
            slugQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND a.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCategoryQuery = vaQuery.slug_category;
        if (slugCategoryQuery) {
          if (typeof slugCategoryQuery === "string") {
            cWhere += ` AND c.slug_title = '${slugCategoryQuery}'`;
          } else if (typeof slugCategoryQuery === "object") {
            slugCategoryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND c.slug_title IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCategoryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCountryQuery = vaQuery.slug_country;
        if (slugCountryQuery) {
          if (typeof slugCountryQuery === "string") {
            cWhere += ` AND n.slug = '${slugCountryQuery}'`;
          } else if (typeof slugCountryQuery === "object") {
            slugCountryQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND n.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCountryQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugCityQuery = vaQuery.slug_city;
        if (slugCityQuery) {
          if (typeof slugCityQuery === "string") {
            cWhere += ` AND k.slug = '${slugCityQuery}'`;
          } else if (typeof slugCityQuery === "object") {
            slugCityQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND k.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugCityQuery.length - 1) cWhere += ` )`;
            });
          }
        }

        const slugRegionQuery = vaQuery.slug_region;
        if (slugRegionQuery) {
          if (typeof slugRegionQuery === "string") {
            cWhere += ` AND r.slug = '${slugRegionQuery}'`;
          } else if (typeof slugRegionQuery === "object") {
            slugRegionQuery.map((item, index) => {
              if (index === 0) cWhere += ` AND r.slug IN ('${item}'`;
              else cWhere += `, '${item}'`;
              if (index === slugRegionQuery.length - 1) cWhere += ` )`;
            });
          }
        }
      }

      // console.log("Where Condition => ", cWhere);
      const cSQL = `SELECT
          ${cFields}
          FROM articles a
            LEFT JOIN asset_media m ON m.id = a.featured_image
            LEFT JOIN asset_media m43 ON m43.id = a.featured_image_4_3
            LEFT JOIN asset_media m169 ON m169.id = a.featured_image_16_9
            LEFT JOIN category c ON c.id = a.category
            LEFT JOIN category c1 ON c1.id = a.parent_category_id
            LEFT JOIN country n ON n.id = a.id_country
            LEFT JOIN city k ON k.id = a.id_city
            LEFT JOIN region r ON r.id = a.id_region
            LEFT JOIN Users u ON u.id = a.createdBy
          WHERE a.id = ${id}
          ${cWhere}
          ORDER BY a.pinned DESC, a.updatedAt DESC;`;
      // console.log(cSQL);

      const [vaData, metadata] = await sequelize.query(cSQL);

      vaData.map((article) => {
        let timezone = article.timezone;
        if (!timezone) {
          timezone = "Asia/Makassar";
        }
        const createdArticleTime = article.createdAt;
        const publishedArticleTime = article.publishedAt;
        const updatedArticleTime = (!article.updatedAt) ? article.publishedAt : article.updatedAt;

        const utcTimeCreated = DateTime.fromJSDate(createdArticleTime, {
          zone: "UTC",
        });
        const utcTimePublished = DateTime.fromJSDate(publishedArticleTime, {
          zone: "UTC",
        });
        const utcTimeUpdated = DateTime.fromJSDate(updatedArticleTime, {
          zone: "UTC",
        });

        const localTimeCreated = utcTimeCreated.setZone(timezone);
        const localTimePublished = utcTimePublished.setZone(timezone);
        const localTimeUpdated = utcTimeUpdated.setZone(timezone);

        const displayTimeCreated = localTimeCreated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimePublished = localTimePublished.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimeUpdated = localTimeUpdated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );

        // article.createdAt = localTime.toJSDate();
        article.createdAt = displayTimeCreated;
        article.publishedAt = displayTimePublished;
        article.updatedAt = displayTimeUpdated || displayTimePublished;
      });

      return vaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async pinArticle(req) {
    try {
      const vaParam = req.params;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const id = parseInt(vaParam.id);
      const typeID = typeof id;
      if (typeID !== "number" || isNaN(id)) {
        const error = new Error("Invalid Article ID, Please Check Your ID");
        error.status = 400;
        throw error;
      }

      const userID = decodedToken.user_id;
      const attributes = ["user_level", "id_country", "id_city"];
      const dbUser = await User.findOne({ attributes, where: { id: userID } });
      const userRole = dbUser.user_level;
      const userCountry = dbUser.id_country;
      const userCity = dbUser.id_city;

      const dbArticle = await Articles.findOne({
        attributes: ["id_country", "id_city", "id_region"],
        where: { id },
      });

      const articleCountry = dbArticle.id_country;
      const articleCity = dbArticle.id_city;
      const articleRegion = dbArticle.id_region;

      let isAllowed = true;
      if (userRole === "admin_country") {
        //ambil data allowed city berdasarkan negara user
        const dbAllowedCities = await City.findAll({
          attributes: ["id"],
          where: { id_country: userCountry },
        });
        const vaAllowedCity = dbAllowedCities.map((item) => item.id);

        //ambil data allowed region berdasarkan kota user
        const dbAllowedRegions = await Region.findAll({
          attributes: ["id"],
          include: [
            {
              model: City,
              as: "city",
              attributes: ["id"],
              required: true,
              include: [
                {
                  model: Country,
                  as: "country",
                  attributes: ["id"],
                  required: true,
                  where: { id: userCountry },
                },
              ],
            },
          ],
        });
        const vaAllowedRegion = dbAllowedRegions.map((item) => item.id);

        // Jika user admin contry, hanya bisa melakukan pin / unpin artikel di countrynya saja
        if (userCountry !== articleCountry) {
          isAllowed = false;
        }

        // Jika user admin city, hanya bisa melakukan pin / unpin artikel di citynya saja
        if (vaAllowedCity.length > 0 && !vaAllowedCity.includes(articleCity)) {
          isAllowed = false;
        }

        // Jika user admin region, hanya bisa melakukan pin / unpin artikel di regionnya saja
        if (
          vaAllowedRegion.length > 0 &&
          !vaAllowedRegion.includes(articleRegion)
        ) {
          isAllowed = false;
        }
      } else if (userRole === "admin_city") {
        const dbAllowedRegions = await Region.findAll({
          attributes: ["id"],
          include: [
            {
              model: City,
              as: "city",
              attributes: ["id"],
              required: true,
              where: { id: userCity },
            },
          ],
        });
        const vaAllowedRegion = dbAllowedRegions.map((item) => item.id);

        if (userCity !== articleCity) {
          isAllowed = false;
        }

        if (
          vaAllowedRegion.length > 0 &&
          !vaAllowedRegion.includes(articleRegion)
        ) {
          isAllowed = false;
        }
      }

      if (!isAllowed) {
        const error = new Error("You are not allowed to pin this article");
        error.status = 400;
        throw error;
      } else {
        const cSQL = `UPDATE articles SET pinned = CASE WHEN pinned = 0 THEN 1 ELSE 0 END WHERE id = ${id};`;
        const [vaData, metadata] = await sequelize.query(cSQL);
        return vaData;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async searchArticles(req) {
    try {
      const vaQuery = req.query;
      const cSearchBar = vaQuery.keyword;
      const searchLen = cSearchBar.length;

      let cWhereAdmin = " ";
      const cIDCountry = vaQuery.id_country;
      if (cIDCountry) {
        cWhereAdmin += `AND a.id_country = ${cIDCountry}`;
      }
      const cIDCity = vaQuery.id_city;
      if (cIDCity) {
        cWhereAdmin += `AND a.id_city = ${cIDCity}`;
      }
      const cIDRegion = vaQuery.id_region;
      if (cIDRegion) {
        cWhereAdmin += `AND a.id_region = ${cIDRegion}`;
      }
      const cCategory = vaQuery.category;
      if (cCategory) {
        cWhereAdmin += `AND a.category = ${cCategory}`;
      }

      if (searchLen < 3) {
        const error = new Error(
          "You must include at least one keyword to match in the content. Keywords must be at least 3 characters, and punctuation is ignored.",
        );
        error.status = 400;
        throw error;
      }

      // const cSQL = `SELECT a.id, a.title , a.sub_title , a.article_post , a.category as category_id, c.title as category, a.author , a.createdAt
      //               FROM articles a
      //                 LEFT JOIN category c ON c.id = a.category
      //               WHERE
      //               a.article_post like '%${cSearchBar}%' OR
      //               a.title like '%${cSearchBar}%' OR
      //               a.sub_title like '%${cSearchBar}%'
      //               LIMIT :limit OFFSET :offset;`;

      const page = parseInt(vaQuery.page) || 1;
      const limit = parseInt(vaQuery.limit) || 10;
      const offset = (page - 1) * limit;

      if (offset < 0) {
        throw new Error("Page must be greater than 0");
      }

      const cSQL = `SELECT 
                    a.id, a.title, a.sub_title, a.slug_title as slug, 
                    a.article_post,
                    a.tags, a.meta_data, 
                    a.featured_image as featured_image_id, m.path as featured_image_url, 
                    m.title as featured_image_title, m.alt_text as featured_image_alt_text,
                    m.caption as featured_image_caption, m.description as featured_image_description,
                    a.status, a.createdAt as publishedAt, a.createdAt, a.createdBy, a.updatedAt,
                    a.updatedBy, a.author as author_name,
                    a.category as category_id, c.title as category_name, 
                    c.slug_title as slug_category,
                    a.parent_category_id, c1.title as parent_category_name,
                    a.id_country, n.name as name_country, n.slug as slug_country,
                    a.id_city, k.name as name_city, k.slug as slug_city,
                    a.id_region, r.name as name_region, r.slug as slug_region,
                    a.pinned,n.timezone, at.id_tag, t.slug as slug_tag,
                    a.publishedAt, a.publishedBy
                    FROM articles a 
                    LEFT JOIN article_tags at ON at.id_article = a.id
                    LEFT JOIN tags t ON t.id = at.id_tag
                    LEFT JOIN asset_media m ON m.id = a.featured_image
                    LEFT JOIN category c ON c.id = a.category
                    LEFT JOIN category c1 ON c1.id = a.parent_category_id
                    LEFT JOIN country n ON n.id = a.id_country
                    LEFT JOIN city k ON k.id = a.id_city
                    LEFT JOIN region r ON r.id = a.id_region
                    LEFT JOIN Users u ON u.id = a.createdBy
                    WHERE 
                    a.title <> '' AND 
                    (
                      a.article_post like :keyword OR 
                      a.title like :keyword OR 
                      a.sub_title like :keyword
                    )
                    ${cWhereAdmin}
                    ORDER BY a.publishedAt DESC`;
      const [dbData, metadata] = await sequelize.query(cSQL, {
        replacements: {
          keyword: `%${cSearchBar}%`,
        },
      });

      // const [dbData, metadata] = await sequelize.query(cSQL);
      /*
      const vaData = Object.values(
        dbData.reduce((acc, curr) => {
          if (!acc[curr.id]) {
            // clone object pertama kali
            acc[curr.id] = {
              ...curr,
              tags_ids: [curr.id_tag],
              tags_slugs: [curr.slug_tag],
            };
            delete acc[curr.id].id_tag;
            delete acc[curr.id].slug_tag;
          } else {
            // kalau id sama, push id_tag ke array
            acc[curr.id].tags_ids.push(curr.id_tag);
            acc[curr.id].tags_slugs.push(curr.slug_tag);
          }
          return acc;
        }, {})
      );
      */

      const articlesMap = new Map();
      const vaData = []; // Array ini akan mempertahankan urutan SQL
      for (const row of dbData) {
        let article = articlesMap.get(row.id);

        if (!article) {
          // Jika artikel ini baru pertama kali ditemukan
          article = {
            ...row,
            // Inisialisasi array tags (cek jika tag-nya null)
            tags_ids: row.id_tag ? [row.id_tag] : [],
            tags_slugs: row.slug_tag ? [row.slug_tag] : [],
          };

          // Hapus properti tag yang duplikat
          delete article.id_tag;
          delete article.slug_tag;

          articlesMap.set(row.id, article); // Simpan di Map untuk pengecekan berikutnya
          vaData.push(article); // Tambahkan ke array vaData (urutannya akan benar)
        } else {
          // Jika artikel sudah ada di Map, tambahkan tag-nya saja
          if (row.id_tag) {
            article.tags_ids.push(row.id_tag);
          }
          if (row.slug_tag) {
            article.tags_slugs.push(row.slug_tag);
          }
        }
      }

      // Setup timezone
      await Promise.all(vaData.map(async (article) => {
        const idArticle = article.id;
        const articleScore = await this.getArticleScore(idArticle);

        let timezone = article.timezone;
        if (!timezone) {
          timezone = "Asia/Makassar";
        }
        const createdArticleTime = article.createdAt;
        const publishedArticleTime = article.publishedAt;
        const updatedArticleTime = (!article.updatedAt) ? article.publishedAt : article.updatedAt;

        const utcTimeCreated = DateTime.fromJSDate(createdArticleTime, {
          zone: "UTC",
        });
        const utcTimePublished = DateTime.fromJSDate(publishedArticleTime, {
          zone: "UTC",
        });
        const utcTimeUpdated = DateTime.fromJSDate(updatedArticleTime, {
          zone: "UTC",
        });

        const localTimeCreated = utcTimeCreated.setZone(timezone);
        const localTimePublished = utcTimePublished.setZone(timezone);
        const localTimeUpdated = utcTimeUpdated.setZone(timezone);

        const displayTimeCreated = localTimeCreated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimePublished = localTimePublished.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );
        const displayTimeUpdated = localTimeUpdated.toFormat(
          "yyyy-MM-dd'T'HH:mm:ssZZ",
        );

        // article.createdAt = localTime.toJSDate();
        article.createdAt = displayTimeCreated;
        article.publishedAt = displayTimePublished;
        article.updatedAt = displayTimeUpdated;
      }));

      const totalData = vaData.length;
      if (totalData < 1) return [];

      const paginatedData = vaData.slice(offset, offset + limit);

      let vaResPagination = {
        pagination: {
          page: page,
          limit: limit,
          totalData,
          totalPages: Math.ceil(totalData / limit),
        },
      };

      if (!vaQuery.page || !vaQuery.limit) {
        vaResPagination = {};
      }

      const vaResults = {
        ...vaResPagination,
        articles: paginatedData,
      };

      return vaResults;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async scoringArticles(slug_article, ip_address) {
    try {
      // console.log("DO SCORING START");
      const article = await Articles.findOne({
        where: { slug_title: slug_article },
      });
      if (!article) {
        return false;
      }
      if (!article) {
        const error = new Error("Article not found");
        error.status = 404;
        throw error;
      }
      // return res.status(404).json({ message: "Article not found" });

      // Cek apakah IP ini sudah menambah point dalam 30 menit terakhir
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 menit lalu

      const existing = await ArticlePointScoring.findOne({
        where: {
          id_article: article.id,
          ip_address: ip_address,
          createdAt: { [Op.gt]: cutoffTime },
        },
      });

      if (!existing) {
        // console.log("CREATE SCORING");
        await ArticlePointScoring.create({
          id_article: article.id,
          description: "Article viewed",
          point: 1,
          ip_address: ip_address,
        });
      }

      // console.log("DO SCORING FINISHED");
      return;
    } catch (error) {
      console.error("error => ", error);
      throw error;
    }
  },

  async getArticleScore(idArticle) {
    try {
      /*
        -- Set a variable for the decay constant.
        -- This represents how quickly an interaction's value 'decays' per hour.
        SET @decay_rate_per_hour = 0.05;

        SELECT
            a.article_id,
            a.title,
            SUM(
                -- Start with the base score for the interaction type
                (CASE
                    WHEN a_int.interaction_type = 'share' THEN 5
                    WHEN a_int.interaction_type = 'comment' THEN 3
                    ELSE 1
                END)
                *
                -- Apply the exponential decay formula
                EXP(
                    -@decay_rate_per_hour *
                    (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(a_int.interaction_time)) / 3600
                )
            ) AS time_decayed_score
        FROM
            article_interactions AS a_int
        JOIN
            articles AS a ON a_int.article_id = a.article_id
        WHERE
            -- Limit the calculation to a reasonable timeframe to improve performance.
            a_int.interaction_time >= NOW() - INTERVAL 3 DAY
        GROUP BY
            a.article_id, a.title
        ORDER BY
            time_decayed_score DESC
        LIMIT 10;
      */

      // menghitung point dari 7 hari terakhir
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const article = await Articles.findOne({ where: { id: idArticle } });
      if (!article) return 0;

      const articlePoint = await ArticlePointScoring.findAll({
        where: {
          id_article: idArticle,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
      });
      const totalPoint = articlePoint.reduce(
        (acc, item) => acc + item.point,
        0,
      );
      return totalPoint;
    } catch (error) {
      console.error("error => ", error);
      throw error;
    }
  },

  async countArticles() {
    try {
      const dbData = Articles.count({
        where: {
          status: "published",
        },
      });

      const dataProm = await Promise.all([dbData]);
      const vaRetval = {
        published: dataProm[0],
      };

      return vaRetval;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async countArticlesPerCountry() {
    try {
      const result = await Articles.findAll({
        attributes: [
          [fn("COUNT", col("Articles.id")), "jumlah"],
          "id_country",
          [col("Country.name"), "name"],
        ],
        where: {
          status: "published",
        },
        include: [
          {
            model: Country,
            attributes: [], // karena sudah ambil 'name' di atas
            required: false, // LEFT JOIN
          },
        ],
        group: ["Articles.id_country", "Country.name"],
        raw: true,
      });

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
