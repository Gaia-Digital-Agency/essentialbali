import fs from "fs";
import path from "path";

/**
 * Pastikan folder ada, kalau belum ada → otomatis dibuat.
 * @param {string} dirPath - path folder yang harus dicek
 */
export const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Ambil ekstensi file dari nama asli
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};
