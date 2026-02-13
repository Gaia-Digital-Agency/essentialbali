import jwt from "jsonwebtoken";
import db from "../models/index.js";
import { is } from "zod/locales";

const { AuthSession, User } = db;

let jwt_secret_key, jwt_refresh_secret_key;
if (process.env.NODE_ENV === "development") {
  // Backwards compatible: some envs only provide JWT_SECRET/JWT_REFRESH_SECRET.
  jwt_secret_key = process.env.JWT_SECRET_DEV || process.env.JWT_SECRET;
  jwt_refresh_secret_key =
    process.env.JWT_REFRESH_SECRET_DEV || process.env.JWT_REFRESH_SECRET;
} else {
  jwt_secret_key = process.env.JWT_SECRET;
  jwt_refresh_secret_key = process.env.JWT_REFRESH_SECRET;
}

export async function generateToken(vaData, cRefreshToken = null) {
  let cAccessToken;

  // access token
  // Have a Short Lived Token (5 minutes)
  cAccessToken = jwt.sign(vaData, jwt_secret_key, {
    expiresIn: "5m",
    algorithm: "HS256",
  });

  // refresh token
  // Have a longer Lived Token (1 days)
  if(!cRefreshToken){
    cRefreshToken = jwt.sign(vaData, jwt_refresh_secret_key, {
      expiresIn: "1d",
      algorithm: "HS256",
    });
  }

  // Insert Refresh Token into the database as a log
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 days
  await AuthSession.create({
    token: cRefreshToken,
    userId: vaData.user_id,
    expiresAt,
  });

  // Update Refresh Token in the user table when successfully logged in, for access verification
  await User.update(
    { token: cRefreshToken },
    { where: { id: vaData.user_id } }
  );

  // Return access token and refresh token
  const response = {
    accessToken: cAccessToken,
    refreshToken: cRefreshToken,
  };

  return response;
}

export async function verifyToken(token, isRefreshToken = false) {
  // console.log("START VERIFY TOKEN", token, isRefreshToken);
  try {
    const secretKey = isRefreshToken ? jwt_refresh_secret_key : jwt_secret_key;
    const decoded = jwt.verify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!decoded) {
      const error = new Error("Invalid token");
      error.status = 491;
      throw error;
    }

    // console.log("DEEECOOOODDEEEEE ====> " , decoded);

    if (isRefreshToken) {
      const session = await User.findOne({
        where: { token, id: decoded.user_id, isActive: true },
      });

      if (!session) {
        const error = new Error("Token revoked or not found");
        error.status = 491;
        throw error;
      }
    }

    return decoded;
  } catch (error) {
    console.error("Error Verify Token ====> ",error) ;
    throw error;
  }
}

export async function decodeToken(token) {
  try {
    const jwtToken = token.split(" ")[1];
    const decoded = jwt.verify(jwtToken, jwt_secret_key, {
      algorithms: ["HS256"],
    });
    return decoded;
  } catch (error) {
    throw error;
  }
}

export async function decodeTokenFromCookie(token, isRefreshToken = false) {
  try {
    const cSecretKey = isRefreshToken ? jwt_refresh_secret_key : jwt_secret_key;
    // console.log(cSecretKey, isRefreshToken, 'secret key')
    const jwtToken = token;
    const decoded = jwt.verify(jwtToken, cSecretKey, {
      algorithms: ["HS256"],
    });
    return decoded;
  } catch (error) {
    throw error;
  }
}
