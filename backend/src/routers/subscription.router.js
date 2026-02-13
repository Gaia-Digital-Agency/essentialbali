import { Router } from "express";
import controller from "../controllers/subscription.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import rateLimiter from "../middlewares/rate_limitter.js";
import { authorizer_article } from "../middlewares/authorizer.js";


const router = Router();

router.get("/test", controller.test);
router.post("/test", controller.test_post);

router.post("/subscribe", rateLimiter, controller.subscribe);
router.post("/unsubscribe", controller.unsubscribe);

router.get("/admin/subscriber", jwtMiddleware, authorizer_article(["super_admin"]), controller.getAllsubscriber);
router.get("/admin/export", jwtMiddleware, authorizer_article(["super_admin"]), controller.exportSubscriber);
router.get("/admin/count-subscribers", controller.countSubscribers);

export default router;
