import { Router } from "express";
import controller from "../controllers/tags.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", jwtMiddleware, authorizer_article(["super_admin"]), controller.create);
router.put("/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.update);
router.put("/activate/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.reActivateTags);
router.delete("/:id", jwtMiddleware, authorizer_article(["super_admin"]),controller.softDelete);

export default router;