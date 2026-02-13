import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";

import controllers from "../controllers/auth.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";
import { loginRateLimiter } from "../middlewares/rate_limitter.js";
import { compressImage, convertToWebP } from "../middlewares/image_compression.js";
import { IMAGE_COMPRESSION_PRESETS } from "../config/image.config.js";

const router = express.Router();

// Ensure profile_picture directory exists
const ensureProfilePictureDir = () => {
  const profilePictureDir = path.join(
    process.cwd(),
    "uploads",
    "profile_picture"
  );
  if (!fs.existsSync(profilePictureDir)) {
    fs.mkdirSync(profilePictureDir, { recursive: true });
  }
};

// Setup multer untuk profile picture
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureProfilePictureDir();
    cb(null, "uploads/profile_picture");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // max 2MB untuk profile picture
  },
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Only image files are allowed for profile picture"),
        false
      );
    }

    // Check file extension
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error("Only JPG, PNG, GIF, and WebP files are allowed"),
        false
      );
    }

    cb(null, true);
  },
});

router.post("/login", loginRateLimiter, controllers.login);
router.post("/logout", jwtMiddleware, controllers.logout);
router.post("/refresh-token", controllers.refreshToken);

router.post(
  "/admin/register",
  jwtMiddleware,
  authorizer_article(["super_admin"]),
  controllers.register
);
router.patch(
  "/admin/change-password",
  jwtMiddleware,
  controllers.changePassword
);

router.get("/admin/users", jwtMiddleware, controllers.getUsers);
router.put(
  "/admin/user/:id/status",
  jwtMiddleware,
  authorizer_article(["super_admin"]),
  controllers.updateUserStatus
);
router.get("/admin/user/", jwtMiddleware, controllers.getUserById);
router.get("/admin/user/:id", jwtMiddleware, controllers.getUserById);

// UPDATED: Update user with profile picture upload
// router.put("/admin/user", jwtMiddleware, controllers.updateUser);
router.put(
  "/admin/user",
  jwtMiddleware,
  upload.single("profile_picture"),
  convertToWebP(),
  compressImage(IMAGE_COMPRESSION_PRESETS.profile),
  controllers.updateUser
);

router.get("/profile-picture", jwtMiddleware, controllers.getProfilePicture);
router.delete(
  "/profile-picture",
  jwtMiddleware,
  controllers.deleteProfilePicture
);

export default router;
