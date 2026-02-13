import { verifyToken } from "../helpers/jwtoken.js";
import { response } from "../helpers/response.js";
import logger from "../helpers/logger.js";

export default async function jwtMiddleware(req, res, next) {
  const authorization = req.cookies.token;
  const refreshToken = req.cookies.jwt;

  if (!authorization && !refreshToken) {
    return response(res, 401, "No Authorization header found");
  }

  if (!authorization || !refreshToken) {
    return response(res, 491, "Unauthorized");
  }

  const token = authorization;
  try {
    const decoded = await verifyToken(token);
    req.user = decoded;

    if (!decoded) {
      return response(res, 491, "Unauthorized");
    }

    const checkRefreshToken = await verifyToken(refreshToken, true);
    if (!checkRefreshToken) {
      return response(res, 491, "Unauthorized");
    }

    next();
  } catch (error) {
    logger.error("JWT middleware error", { error: error.message });
    return response(res, 491, "Unauthorized");
  }
}
