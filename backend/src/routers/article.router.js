import express from "express";
import controllers from "../controllers/article.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";

const router = express.Router();

router.get("/test", controllers.test);

// Article CRUD
router.post("/admin", jwtMiddleware, authorizer_article(["super_admin", "admin_city", "admin_country"]), controllers.addNewArticle);
router.put("/admin/:id", jwtMiddleware, authorizer_article(["super_admin", "admin_city", "admin_country"]), controllers.editCurrentArticle);
router.get("/admin/unpublished", jwtMiddleware, controllers.getAllUnpublishedArticlesAdmin);
router.put("/admin/publish/:id", jwtMiddleware, authorizer_article(["super_admin", "admin_city", "admin_country"]), controllers.publishArticle);
router.delete("/admin/:id", jwtMiddleware, authorizer_article(["super_admin", "admin_city", "admin_country"]), controllers.nonActivateArticle);
router.get("/admin/:id", jwtMiddleware, controllers.getArticleByID);
router.put("/admin/pin/:id", jwtMiddleware, controllers.pinArticle);

// Public routes
router.get("/", controllers.getArticlesNew);
router.get("/new", controllers.getArticlesNew);
router.get("/search", controllers.searchArticles);
router.get("/count-articles", controllers.countArticles);
router.get("/count-article-per-country", controllers.countArticlesPerCountry);
router.get("/:id_country/:id_city/category/:id_category", controllers.getArticleByCategoryIDPerCity);

export default router;
