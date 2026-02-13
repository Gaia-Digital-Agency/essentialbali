import express from "express";
import controllers from "../controllers/article_templating.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";

const router = express.Router();

router.get("/", controllers.getAllTemplates);
router.get("/id/:id", controllers.getTemplateByID);
router.get("/query", controllers.getTemplateByQuery);
router.post("/", jwtMiddleware, controllers.createNewTemplate);
router.put("/edit/", jwtMiddleware, controllers.editTemplate);
router.delete("/", jwtMiddleware, controllers.softDeleteTemplate);
router.put("/restore", jwtMiddleware, controllers.restoreTemplate);

export default router;