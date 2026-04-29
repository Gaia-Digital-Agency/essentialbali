import { ZodError } from "zod";
import logger from "./logger.js";

/**
 * response(res, status, body, meta?) — uniform JSON envelope.
 * Used by app.js error responders. Stripped of Sequelize-specific
 * branches in cleanup-C (the API routes that surfaced Sequelize errors
 * were deleted in Phase B).
 */
export function response(res, status, result = "", meta = "") {
  let desc = "";
  switch (status) {
    case 200: desc = "OK"; break;
    case 201: desc = "Created"; break;
    case 400: desc = "Bad Request"; break;
    case 401: desc = "Unauthorized"; break;
    case 403: desc = "Forbidden"; break;
    case 404: desc = "Data Not found"; break;
    case 409: desc = "Conflict"; break;
    case 410: desc = "Gone"; break;
    case 500: desc = "Internal Server Error"; break;
    case 501: desc = "Bad Gateway"; break;
    case 304: desc = "Not Modified"; break;
    case 491: desc = "No Authorization"; break;
    default:  desc = "";
  }
  const isObject = (data) => !!data && data.constructor === Object;
  const results = { status: desc, status_code: status };
  if (meta) results.title = meta;
  if (status > 201) {
    results.message = result;
  } else {
    results.data = isObject(result) ? result : Array.isArray(result) ? result : result;
  }
  res.status(status).json(results);
}

export function errResponse(error, res, position) {
  if (position) logger.error(`[${position}] Error:`, error.message);
  if (error instanceof ZodError) {
    return response(res, 400, error.errors?.[0]?.message || "Invalid input.");
  }
  if (error.status) return response(res, error.status, error.message);
  return response(res, 500, error.message || "An unexpected error occurred.");
}

export function errThrow(condition, status, message) {
  if (condition) {
    const e = new Error(message);
    e.status = status;
    throw e;
  }
}

export function errCatch(position, error) {
  logger.error(`${position}: ${error.message}`);
  if (error.status) throw error;
  throw new Error(error.message);
}
