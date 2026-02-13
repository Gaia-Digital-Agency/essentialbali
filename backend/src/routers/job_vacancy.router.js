import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import controllers from "../controllers/job_vacancy.controller.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import { authorizer_article } from "../middlewares/authorizer.js";

const router = express.Router();

// Ensure job_application_files directory exists
const ensureJobApplicationFilesDir = () => {
  const profilePictureDir = path.join(
    process.cwd(),
    "uploads",
    "job_application_files"
  );
  if (!fs.existsSync(profilePictureDir)) {
    fs.mkdirSync(profilePictureDir, { recursive: true });
  }
};

// Setup multer untuk profile picture
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureJobApplicationFilesDir();
    cb(null, "uploads/job_application_files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `applicant-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10MB
  },
  fileFilter: function (req, file, cb) {
    // Allowed MIME types
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
    ];

    // Allowed file extensions
    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".txt",
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Cek mimetype
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only PDF, image (JPG, PNG, WEBP), or TXT files are allowed"),
        false
      );
    }

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          "File extension not allowed. Only PDF, image, or TXT files are accepted."
        ),
        false
      );
    }

    cb(null, true);
  },
});

router.post("/apply/:id", upload.single("fileCV"), controllers.applyJob);

router.get("/applicant", controllers.getAllApplicant);

export default router;
