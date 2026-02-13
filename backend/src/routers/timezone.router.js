import { Router } from "express";
import controller from "../controllers/timezone.controller.js";

const router = Router();

router.get("/", controller.getAll);

export default router;