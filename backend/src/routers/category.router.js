import { Router } from "express";
import controller from "../controllers/category.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import {authorizer_article} from "../middlewares/authorizer.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/location/:type/:idLocation/:idCategory", controller.getCategoryDescByLocation);
router.post("/", jwtMiddleware, authorizer_article(["super_admin"]), controller.create);
router.put("/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.update);
router.delete("/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.delete);

export default router;