import { Router } from "express";
import authRouter from "./auth.router.js";
import locationRouter from "./location.router.js";
import categoryRouter from "./category.router.js";
import assetMediaRouter from "./asset_media.router.js";
import articleRouter from "./article.router.js";
import housingRouter from "./housing_property.router.js";
import articleTemplatingRouter from "./article_templating.router.js";
import articlesTagRouter from "./tags.router.js";
import socmedRouter from "./socmed.router.js";
import advertisingRouter from "./advertising.router.js"
import timezoneRouter from "./timezone.router.js"
import subscriptionRouter from "./subscription.router.js"
import settingRouter from "./setting.router.js"
import jobRouter from "./job_vacancy.router.js"

const router = Router();

router.use("/auth", authRouter);
router.use("/location", locationRouter);
router.use("/category", categoryRouter);
router.use("/asset_media", assetMediaRouter);
router.use("/article", articleRouter);
router.use("/housing", housingRouter);
router.use("/templating", articleTemplatingRouter);
router.use("/tags", articlesTagRouter);
router.use("/socmed", socmedRouter);
router.use("/advertising", advertisingRouter);
router.use("/timezone", timezoneRouter);
router.use("/newsletter", subscriptionRouter);
router.use("/setting", settingRouter);
router.use("/job", jobRouter)

export default router;