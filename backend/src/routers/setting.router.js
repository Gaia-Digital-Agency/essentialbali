import express from "express";
import controllers from "../controllers/setting.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";

const router = express.Router();

// Input Setup SMTP
router.post("/admin/smtp", jwtMiddleware, authorizer_article(["super_admin"]), controllers.setupSMTP);

router.get("/admin/smtp", controllers.getSetupSMTP);
router.get("/admin/smtp/providers", controllers.getSMTPProviders);
router.get("/admin/smtp/provider/:id", controllers.getSMTPProviderByID);

export default router;
