import fs from "fs";
import path from "path";
import AssetMediaServie from "../services/asset_media.service.js";
import { response, errResponse } from "../helpers/response.js";
import { verifyToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";
import slugify from "slugify";

export default {
  async getAllMedia(req, res) {
    try {
      const media = await AssetMediaServie.getAllMedia(req);
      return response(res, 200, media);
    } catch (error) {
      errResponse(error, res);
    }
  },

  async uploadMedia(req, res) {
    try {
      const fileData = req.file;
      const vaBody = req.body;
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const token = vaCookies.token ; //vaHeader.authorization.split(" ")[1];
      const vaTokenDecoded = await verifyToken(token);
      const vaData = {
        title: vaBody.title,
        alt_text: vaBody.alt_text,
        caption: vaBody.caption,
        description: vaBody.description,
        createdBy: vaTokenDecoded.user_id,
        updatedBy: vaTokenDecoded.user_id,
      };

      // validasi file
      if (!fileData) {
        return response(res, 404, "No file uploaded");
      }

      // validasi hanya gambar
      if (!fileData.mimetype.startsWith("image/")) {
        // return response(res, 400, "Only image files are allowed");
        return response(res, 400, "No image uploaded");
      }

      const media = await AssetMediaServie.saveMedia(fileData, vaData);
      response(res, 201, media);
    } catch (error) {
      console.error("Error uploading media:", error);
      errResponse(error, res);
    }
  },

  async uploadBulkMedia(req, res) {
    try {

      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const authorName = decodedToken.name;

      console.log({userID , authorName});

      if (!req.files || req.files.length === 0) {
        return response(res, 400, "No files uploaded");
      }

      // validasi semua file harus berupa gambar
      const invalidFiles = req.files.filter(
        (f) => !f.mimetype.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        return response(res, 400, "Only image files are allowed");
      }

      const vaData = {
        createdBy: userID,
      };

      // simpan semua ke DB
      const savedFiles = [];
      for (const file of req.files) {
        const media = await AssetMediaServie.saveMedia(file, vaData);
        savedFiles.push(media);
      }

      return response(res, 201, savedFiles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async editMedia(req, res) {
    try {
      const { id } = req.params;
      const { body: vaBody, cookies: vaCookies } = req;
      const token = vaCookies.token;
      const { user_id } = await verifyToken(token);

      const updatedData = {
        title: vaBody.title,
        alt_text: vaBody.alt_text,
        caption: vaBody.caption,
        description: vaBody.description,
        updatedBy: user_id,
        updatedAt: new Date(),
      };

      const asset = await AssetMediaServie.editMedia(id, updatedData);
      if (!asset) {
        return response(res, 404, "Asset not found");
      }

      let newFilename = "";

      if (vaBody.new_filename && asset.filename) {
        const uploadDir = "uploads";
        const oldPath = path.join(uploadDir, asset.filename);
        const oldExt = path.extname(asset.filename);

        const rawName = slugify(vaBody.new_filename, { lower: true });
        newFilename = path.extname(rawName) ? rawName : `${rawName}${oldExt}`;
        const newPath = path.join(uploadDir, newFilename);

        if (!/^[a-zA-Z0-9_\-\.]+$/.test(newFilename)) {
          return response(res, 400, "Invalid filename format");
        }

        if (!fs.existsSync(oldPath)) {
          console.warn(`⚠️ File not found for renaming: ${oldPath}`);
          const error = new Error("File not found for renaming");
          error.status = 404;
          throw error;
        }

        await fs.promises.rename(oldPath, newPath);
        await AssetMediaServie.editMedia(id, {
          filename: newFilename,
          path: newPath,
        });
      }

      // Tambahkan nama file baru ke objek hasil
      asset.filename = newFilename;

      return response(res, 200, asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      errResponse(error, res);
    }
  },

  async getMediaByID(req, res) {
    try {
      const { id } = req.params;
      const asset = await AssetMediaServie.getMediaByID(id);
      return response(res, 200, asset);
    } catch (error) {
      errResponse(error, res);
    }
  },
};
