import db from "../models/index.js";
import {
  generateToken,
  verifyToken,
  decodeToken,
  decodeTokenFromCookie,
} from "../helpers/jwtoken.js";
import bcrypt from "bcrypt";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { User, Country, City, sequelize } = db;

export default {
  async login(email, password) {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    try {
      const vaData = await User.findOne({ where: { email } });
      if (!vaData) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      if (!vaData.isActive) {
        const error = new Error("User is inactive");
        error.status = 401;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(password, vaData.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid password");
        error.status = 401;
        throw error;
      }

      const vaPayload = {
        user_id: vaData.id,
        name: vaData.name,
        email: vaData.email,
        id_country: vaData.id_country,
        id_city: vaData.id_city,
      };

      const vaToken = await generateToken(vaPayload);

      // console.log(vaToken);

      const refreshToken = vaToken.refreshToken;
      const accessToken = vaToken.accessToken;
      // Update lastLoginAt when user logs in successfully
      User.update({ lastLoginAt: new Date() }, { where: { id: vaData.id } });
      return Object.assign(vaPayload, { refreshToken, accessToken });
    } catch (error) {
      throw error;
    }
  },

  async registerUser(
    name,
    email,
    password,
    id_country,
    id_city,
    user_level,
    timezone
  ) {
    const transaction = await sequelize.transaction();
    try {
      let cErrMessage = "";
      // Input validation
      if (!email || !password) {
        cErrMessage = "Email and password are required";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      // Password strength validation
      if (password.length < 8) {
        cErrMessage = "Password must be at least 8 characters long";
        const error = new Error(cErrMessage);
        error.status = 400;
        throw error;
      }

      // Check if the email is already in use
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        cErrMessage = "Email already registered";
        const error = new Error(cErrMessage);
        error.status = 409;
        throw error;
      }

      if (user_level == "admin_country") {
        // if country id exists? if yes, city id is filled with the city id which is a child of id_country with the smallest value
        const dbCountry = await Country.findByPk(id_country);
        if (!dbCountry) {
          cErrMessage = "Bali area not found";
          const error = new Error(cErrMessage);
          error.status = 404;
          throw error;
        }

        const dbCity = await City.findOne({
          where: { id_country: id_country },
        });
        if (!dbCity) {
          cErrMessage = "City not found";
          const error = new Error(cErrMessage);
          error.status = 404;
          throw error;
        }
        id_city = dbCity.id;
      }

      // Create a new user
      const hashedPassword = hashString(password);
      const vaData = await User.create(
        {
          name,
          email,
          password: hashedPassword,
          id_city,
          id_country,
          user_level,
          timezone,
        },
        { transaction }
      );
      await transaction.commit();
      return vaData;
    } catch (error) {
      console.error("Error at registerUser : \n", error);
      await transaction.rollback();
      throw error;
    }
  },

  async logout(req) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const authToken = vaCookies.jwt;
      // const decodedToken = await decodeToken(vaHeader.authorization);
      const decodedToken = await decodeTokenFromCookie(authToken, true);
      const userID = decodedToken.user_id;

      await User.update(
        { token: null },
        { where: { id: userID, token: authToken } }
      );
      return "Logout Successfully";
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async changePassword(req) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const vaBody = req.body;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const userID = decodedToken.user_id;
      const dbData = await User.findOne({ where: { id: userID } });
      if (!dbData) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }
      const dbPassword = dbData.password;
      const isPasswordValid = await bcrypt.compare(
        vaBody.current_password,
        dbPassword
      );
      if (!isPasswordValid) {
        const error = new Error("Invalid Current Password");
        error.status = 401;
        throw error;
      }

      const cNewPassword = vaBody.new_password;
      const cConfirmNewPassword = vaBody.confirm_new_password;
      if (cNewPassword !== cConfirmNewPassword) {
        const error = new Error(
          "New Password and Confirm New Password do not match"
        );
        error.status = 400;
        throw error;
      }

      if (cNewPassword === vaBody.current_password) {
        const error = new Error(
          "New Password cannot be the same as Current Password"
        );
        error.status = 400;
        throw error;
      }

      if (cNewPassword.length < 8) {
        const error = new Error("Password must be at least 8 characters long");
        error.status = 400;
        throw error;
      }

      const hashedNewPassword = hashString(cNewPassword);
      await User.update(
        { password: hashedNewPassword, token: null },
        { where: { id: userID } }
      );

      return "password changed!";
    } catch (error) {
      throw error;
    }
  },

  async verifyToken(token) {
    try {
      const decoded = await verifyToken(token);
      return decoded;
    } catch (error) {
      throw error;
    }
  },

  async getUsers(req) {
    try {
      const [vaData, metadata] = await sequelize.query(
        `SELECT
          u.id, u.name, u.email, u.isActive, 
          u.id_country, u.id_city, 
          u.isActive, u.lastLoginAt, u.loginAttempts, u.lockedUntil,
          u.user_level,
          c.name as name_city, n.name as name_country
        FROM
          Users u
        LEFT JOIN city c ON c.id = u.id_city
        LEFT JOIN country n ON n.id = u.id_country `
      );
      return vaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async updateUserStatus(req) {
    try {
      const { id } = req.params;
      const vaBody = req.body;
      const vaData = await User.update(
        { isActive: vaBody.status },
        { where: { id } }
      );
      return vaData;
    } catch (error) {
      throw error;
    }
  },

  async getUserById(req) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const id = decodedToken.user_id;
      const [vaData, metadata] = await sequelize.query(
        `SELECT
          u.name, u.email, u.isActive, u.user_level, u.profile_picture, u.profile_picture_original_name, 
          u.id_city, c.name as name_city, u.id_country, n.name as name_country
        FROM
          Users u
        LEFT JOIN city c ON c.id = u.id_city
        LEFT JOIN country n ON n.id = u.id_country 
        Where u.id = :id`,
        {
          replacements: { id },
        }
      );
      return vaData;
    } catch (error) {
      // console.error(":: ERROR at Service getUserById :: \n", error);
      throw error;
    }
  },

  async updateUser(req) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const id = decodedToken.user_id;
      const vaBody = req.body;
      const fileData = req.file;

      let updatedData = { ...vaBody };

      if (fileData) {
        // File validation
        if (!fileData.mimetype.startsWith("image/")) {
          const error = new Error(
            "Only image files are allowed for profile picture"
          );
          error.status = 400;
          throw error;
        }

        // File size validation (max 2MB)
        if (fileData.size > 2 * 1024 * 1024) {
          const error = new Error("Profile picture size must be less than 2MB");
          error.status = 400;
          throw error;
        }

        // Get current user data to delete old profile picture
        const currentUser = await User.findByPk(id);

        // Delete old profile picture if it exists
        if (currentUser.profile_picture) {
          const oldFilePath = path.join(
            __dirname,
            "../../uploads/profile_picture",
            currentUser.profile_picture
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Set new profile picture data
        updatedData.profile_picture = fileData.filename;
        updatedData.profile_picture_original_name = fileData.originalname;
      }

      const vaData = await User.update(updatedData, { where: { id } });
      return vaData;
    } catch (error) {
      throw error;
    }
  },

  // NEW METHOD: Get profile picture
  async getProfilePicture(req, res) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const id = decodedToken.user_id;

      const user = await User.findByPk(id, {
        attributes: [
          "id",
          "name",
          "profile_picture",
          "profile_picture_original_name",
        ],
      });

      if (!user || !user.profile_picture) {
        return res.status(404).json({ message: "Profile picture not found" });
      }

      // Try GCS first, fallback to local file
      const imageUrl = process.env.IMAGE_URL;
      if (imageUrl) {
        const gcsUrl = `${imageUrl}/profile_picture/${user.profile_picture}`;
        return res.redirect(gcsUrl);
      }

      // Fallback: serve from local disk
      const filePath = path.join(
        __dirname,
        "../../uploads/profile_picture",
        user.profile_picture
      );

      if (!fs.existsSync(filePath)) {
        return res
          .status(404)
          .json({ message: "Profile picture file not found" });
      }

      // Set appropriate headers
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${user.profile_picture_original_name}"`
      );

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      throw error;
    }
  },

  // NEW METHOD: Delete profile picture
  async deleteProfilePicture(req) {
    try {
      const vaHeader = req.headers;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);
      const id = decodedToken.user_id;

      const user = await User.findByPk(id);

      if (!user.profile_picture) {
        const error = new Error("No profile picture to delete");
        error.status = 404;
        throw error;
      }

      // Delete file from file system
      const filePath = path.join(
        __dirname,
        "../../uploads/profile_picture",
        user.profile_picture
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update user's profile_picture to null
      const doUpdate = await User.update(
        {
          profile_picture: null,
          profile_picture_original_name: null,
        },
        { where: { id } }
      );

      return doUpdate;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(req) {
    try {
      const refreshToken = req.cookies.jwt;
      // console.log({ refreshToken });
      if (!refreshToken) {
        const error = new Error("Refresh token not found");
        error.status = 401;
        throw error;
      }

      // 2. Verify refresh token
      // console.log("START REFRESH TOKEN VERIFY", refreshToken);
      const verifyRefreshToken = await verifyToken(refreshToken, true);
      if (!verifyRefreshToken) {
        const error = new Error("Invalid refresh token");
        error.status = 401;
        throw error;
      } else {
        // generate new Access Token
        // console.log({verifyRefreshToken});
        const vaPayload = {
          user_id: verifyRefreshToken.user_id,
          name: verifyRefreshToken.name,
          email: verifyRefreshToken.email,
          id_country: verifyRefreshToken.id_country,
          id_city: verifyRefreshToken.id_country,
        };
        const vaData = await generateToken(vaPayload, refreshToken);
        return { token: vaData.accessToken }; //return vaData;
      }
      // return { refreshToken };
    } catch (error) {
      throw error;
    }
  },
};

function hashString(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}
