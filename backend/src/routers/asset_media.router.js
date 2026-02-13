import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import controller from "../controllers/asset_media.controller.js";
import { ensureDirectoryExists } from "../helpers/asset_media.js";
import jwtMiddleware from "../middlewares/jwt_middleware.js";
import {
  compressImage,
  convertToWebP,
} from "../middlewares/image_compression.js";

const uploadDir = "uploads";
const router = express.Router();

/*
const sanitizeFilename = (name) => {
  return name
    .normalize("NFKD") // buang accent/diakritik
    .replace(/[\u0300-\u036f]/g, "") // hapus sisa accent
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "") // hapus karakter aneh
    .replace(/\s+/g, "-") // spasi → -
    .toLowerCase();
};

// setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  //   cb(null, uniqueSuffix + path.extname(file.originalname));
  // },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleaned = sanitizeFilename(file.originalname);

    cb(null, uniqueSuffix + "-" + cleaned);
  },
});
*/

// sanitasi nama file
const sanitizeFilename = (name) => {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

// fungsi untuk menangani duplicate
const generateUniqueName = (dir, originalName) => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);

  let filename = `${base}${ext}`;
  let counter = 1;

  while (fs.existsSync(path.join(dir, filename))) {
    filename = `${base}-${counter}${ext}`; // tambah -1, -2, dst
    counter++;
  }

  return filename;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const cleaned = sanitizeFilename(file.originalname);

    const finalName = generateUniqueName(uploadDir, cleaned);

    cb(null, finalName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 5MB
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Unsupported file type.\n Only image files are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  jwtMiddleware,
  upload.single("image"),
  controller.uploadMedia
);

router.post(
  "/upload-bulk",
  jwtMiddleware,
  upload.array("images", 10),
  convertToWebP(), // Convert to WebP first
  compressImage({
    format: "webp",
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1920,
  }),
  controller.uploadBulkMedia
);

router.put("/:id", jwtMiddleware, controller.editMedia);

router.get("/", controller.getAllMedia);
router.get("/:id", controller.getMediaByID);

export default router;
