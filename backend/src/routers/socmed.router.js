import { Router } from "express";
import controller from "../controllers/socmed.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";


const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getDataById);
router.post("/", jwtMiddleware, authorizer_article(["super_admin"]), controller.create);
router.put("/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.update);
router.delete("/:id", jwtMiddleware, authorizer_article(["super_admin"]), controller.softDelete);

export default router;
