import express from "express";
import controllers from "../controllers/location.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import authorize from "../middlewares/role_authorizer.js";
const router = express.Router();

router.get("/", controllers.getAllLocation);
router.get("/:type", controllers.getLocation);
router.get("/:type/:id", controllers.getLocationById);
// router.get("/:type/:id_parent", controllers.getLocationByParent);

router.post("/:type", jwtMiddleware, authorize({ roles : 'super_admin'}), controllers.addLocation);
router.put("/:type/:id", jwtMiddleware, authorize({ roles : 'super_admin'}), controllers.editLocation);
router.delete("/:type/:id", jwtMiddleware, authorize({ roles : 'super_admin'}), controllers.deleteLocation);

export default router;
