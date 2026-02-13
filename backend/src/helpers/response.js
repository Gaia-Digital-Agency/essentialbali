import { ZodError } from "zod";
import { Sequelize } from "sequelize";
import logger from "./logger.js";

export function response(res, status, result = "", meta = "") {
  let desc = "";

  switch (status) {
    case 200:
      desc = "OK";
      break;
    case 201:
      desc = "Created";
      break;
    case 400:
      desc = "Bad Request";
      break;
    case 401:
      desc = "Unauthorized";
      break;
    case 403:
      desc = "Forbidden";
      break;
    case 404:
      desc = "Data Not found";
      break;
    case 409:
      desc = "Conflict";
      break;
    case 410:
      desc = "Gone";
      break;
    case 500:
      desc = "Internal Server Error";
      break;
    case 501:
      desc = "Bad Gateway";
      break;
    case 304:
      desc = "Not Modified";
      break;
    case 491:
      desc = "No Authorization";
      break;
    default:
      desc = "";
  }

  const isObject = (data) => {
    return !!data && data.constructor === Object;
  };

  const results = {
    status: desc,
    status_code: status,
  };

  if (meta) {
    results.title = meta;
  }

  if (status > 201) {
    results.message = result;
  } else {
    results.data = isObject(result)
      ? result
      : Array.isArray(result)
      ? result
      : result;
  }

  res.status(status).json(results);
}

export function errResponse(error, res, position) {
  if (position) {
    logger.error(`[${position}] Error:`, error.message);
  }

  // -------------------- Zod Validation --------------------
  if (error instanceof ZodError) {
    return response(res, 400, error.errors?.[0]?.message || "Invalid input.");
  }

  // -------------------- Custom Error with status --------------------
  if (error.status) {
    return response(res, error.status, error.message);
  }

  // -------------------- Sequelize Error Handling --------------------
  if (error instanceof Sequelize.UniqueConstraintError) {
    const field = error.errors?.[0]?.path || "field";
    const value = error.errors?.[0]?.value;
    return response(
      res,
      400,
      `The value "${value}" for field "${field}" must be unique.`
    );
  }

  if (error instanceof Sequelize.ValidationError) {
    return response(
      res,
      400,
      error.errors?.[0]?.message || "Validation failed."
    );
  }

  if (error instanceof Sequelize.ForeignKeyConstraintError) {
    return response(
      res,
      400,
      "Operation not allowed: related data exists (foreign key constraint)."
    );
  }

  if (error instanceof Sequelize.DatabaseError) {
    return response(res, 500, "Database error occurred.");
  }

  if (error instanceof Sequelize.ConnectionError) {
    return response(res, 500, "Database connection error.");
  }

  if (error instanceof Sequelize.OptimisticLockError) {
    return response(
      res,
      409,
      "Conflict: the data was modified by another transaction."
    );
  }

  if (error instanceof Sequelize.EmptyResultError) {
    return response(res, 404, "No record found for the given query.");
  }

  if (error instanceof Sequelize.EagerLoadingError) {
    return response(res, 400, "Error while eager loading associations.");
  }

  if (error instanceof Sequelize.AccessDeniedError) {
    return response(res, 403, "Database access denied.");
  }

  // -------------------- Fallback --------------------
  return response(
    res,
    500,
    error.message || "An unexpected error occurred."
  );
}

export function errThrow(condition, status, message) {
  if (condition) {
    const error = new Error(message);
    error.status = status;
    throw error;
  }
}

export function errCatch(position, error) {
  logger.error(`${position}: ${error.message}`);
  if (error.status) throw error;
  throw new Error(error.message);
}
