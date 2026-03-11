// src/middlewares/image_compression.js
import { runImageWorker } from "../helpers/image_worker_helper.js";
import path from "path";

/**
 * Compress image menggunakan Sharp di Worker Threads
 * @param {Object} options - Compression options
 */
export const compressImage = (options = {}) => {
  const defaultOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 80,
    format: "jpeg", // 'jpeg', 'png', 'webp'
    createThumbnail: false,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
  };

  const config = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    if (!req.file && !req.files) return next();

    try {
      if (req.file) {
        const result = await runImageWorker("compress", req.file, config);
        req.file.size = result.size;
        if (result.thumbnailPath) req.file.thumbnailPath = result.thumbnailPath;
      }

      if (req.files && Array.isArray(req.files)) {
        await Promise.all(
          req.files.map(async (file) => {
            const result = await runImageWorker("compress", file, config);
            file.size = result.size;
            if (result.thumbnailPath) file.thumbnailPath = result.thumbnailPath;
          })
        );
      }
      next();
    } catch (error) {
      console.error("Worker Thread compression error:", error);
      next(error);
    }
  };
};

/**
 * Convert to WebP menggunakan Worker Threads
 * @param {Object} options - WebP conversion options
 */
export const convertToWebP = (options = {}) => {
  const defaultOptions = {
    quality: 85,
    effort: 6,
    deleteOriginal: true,
  };

  const config = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    if (!req.file && !req.files) return next();

    try {
      if (req.file) {
        const result = await runImageWorker("convertToWebP", req.file, config);
        req.file.path = result.path;
        req.file.filename = result.filename;
        req.file.mimetype = "image/webp";
      }

      if (req.files && Array.isArray(req.files)) {
        await Promise.all(
          req.files.map(async (file) => {
            const result = await runImageWorker("convertToWebP", file, config);
            file.path = result.path;
            file.filename = result.filename;
            file.mimetype = "image/webp";
          })
        );
      }
      next();
    } catch (error) {
      console.error("Worker Thread WebP conversion error:", error);
      next(error);
    }
  };
};

export default compressImage;
