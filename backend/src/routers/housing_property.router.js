import express from "express";
import controllers from "../controllers/housing_property.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";

const router = express.Router();

router.get("/test", controllers.test);

router.post("/admin/location", controllers.addPropertyLocation);
router.get("/admin/location", controllers.getAllPropertyLocation);

router.post("/admin/amenity/item", controllers.addAmenityItem);
router.get("/admin/amenity/item", controllers.getAllAmenityItem);

router.post("/admin", jwtMiddleware, authorizer_article(["super_admin", "admin_city", "admin_country"]), controllers.addNewProperty);
// router.post("/admin", jwtMiddleware, controllers.addNewProperty);

router.get("/", controllers.getAllProperty);
router.get("/:id", controllers.getPropertyByID);
router.get(
  "/:id_country/:id_city/:rent_type",
  controllers.getAllPropertyByRentTypePerCity
);

export default router;
