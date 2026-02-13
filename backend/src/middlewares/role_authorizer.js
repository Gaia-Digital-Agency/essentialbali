import db from "../models/index.js";
import { verifyToken } from "../helpers/jwtoken.js";
import { response } from "../helpers/response.js";

const { Article, User } = db;

/**
 * options bisa berisi:
 * - roles: "super_admin" | "admin_city" | "admin_country" array of role yang diizinkan
 * - resource: "category" | "location" | "article"
 * - action: "create" | "update" | "delete"
 */
const authorize = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Ambil token
      // const token = req.headers["authorization"]?.split(" ")[1];
      const token = req.cookies.token;
      if (!token) return response(res, 491, "Unauthorized: Token required");

      // Verify JWT
      const decoded = await verifyToken(token);
      req.user = decoded;

      const vaUser = await User.findByPk(decoded.user_id);
      if (!vaUser) {
        return response(res, 404, "User not found");
      }

      // Kalau role super_admin -> auto lolos
      if (vaUser.user_level === "super_admin") {
        return next();
      }

      // Check role spesifik
      if (options.roles && !options.roles.includes(vaUser.user_level)) {
        return response(res, 403, "Forbidden: role not allowed");
      }

      // Resource-specific rules
      if (options.resource === "category" || options.resource === "location") {
        return response(
          res,
          403,
          "Forbidden: only super admin can modify this resource"
        );
      }

      if (options.resource === "article") {
        const articleId = req.params.id;
        if (articleId) {
          // kalau update/delete -> ambil artikel & cek kota
          const article = await Article.findByPk(articleId, {
            include: [{ model: User, as: "author" }],
          });

          if (!article) {
            return response(res, 404, "Article not found");
          }

          if (decoded.id_kota !== article.author.id_kota) {
            return response(
              res,
              403,
              "Forbidden: cannot edit article from another city"
            );
          }
        } else {
          // kalau create -> cek apakah user bikin artikel di kota sendiri
          const { id_kota } = req.body;
          if (decoded.id_kota !== id_kota) {
            return response(
              res,
              403,
              "Forbidden: cannot create article in another city"
            );
          }
        }
      }

      next();
    } catch (err) {
      return response(res, 491, "Unauthorized: " + err.message);
    }
  };
};

export default authorize;
