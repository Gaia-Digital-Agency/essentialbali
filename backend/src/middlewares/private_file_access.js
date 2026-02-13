// src/middlewares/private_file_access.js
import fs from "fs";
import path from "path";
import jwtMiddleware from "./jwt_middleware.js";
import { User } from "../models/index.js";
import { decodeTokenFromCookie } from "../helpers/jwtoken.js";

export const privateProfilePictureAccess = async (req, res, next) => {
  try {
    // Verify JWT token
    await jwtMiddleware(req, res, () => {});

    // Check if user is accessing their own profile picture
    const vaHeader = req.headers;
    const vaCookies = req.cookies;
    const decodedToken = await decodeTokenFromCookie(vaCookies.token);
    const userId = decodedToken.user_id;

    // Get user data
    const user = await User.findByPk(userId);

    if (!user || !user.profile_picture) {
      return res.status(404).json({ message: "Profile picture not found" });
    }

    // Set file path for next middleware (GCS or local)
    const imageUrl = process.env.IMAGE_URL;
    if (imageUrl) {
      req.profilePictureUrl = `${imageUrl}/profile_picture/${user.profile_picture}`;
    }
    req.profilePicturePath = path.join(
      process.cwd(),
      "uploads/profile_picture",
      user.profile_picture
    );
    req.profilePictureMimeType = user.profile_picture_original_name;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};
