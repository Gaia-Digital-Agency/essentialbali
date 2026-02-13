// src/config/constants.js

/**
 * Default IDs for fallback data
 * These IDs cannot be deleted or edited
 */
export const DEFAULT_IDS = {
  COUNTRY: 999,
  CITY: 999,
  REGION: 999,
  CATEGORY: 999,
};

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  DEFAULT: 3600,       // 1 hour
  LOCATIONS: 3600,     // 1 hour
  CATEGORIES: 3600,    // 1 hour
  ARTICLES: 1800,      // 30 minutes
  SSR_HTML: 100,       // 100 seconds for SSR HTML cache
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * User roles
 */
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN_COUNTRY: "admin_country",
  ADMIN_CITY: "admin_city",
};

/**
 * Cek apakah ID adalah default ID
 * @param {number} id - ID yang akan dicek
 * @param {string} type - Tipe data (country, city, region, category)
 * @returns {boolean}
 */
export function isDefaultId(id, type) {
  const parsedId = parseInt(id);
  const typeUpper = type.toUpperCase();
  return DEFAULT_IDS[typeUpper] === parsedId;
}

/**
 * Validasi apakah operasi diperbolehkan untuk default ID
 * @param {number} id - ID yang akan divalidasi
 * @param {string} type - Tipe data
 * @param {string} operation - Operasi yang akan dilakukan (edit/delete)
 * @throws {Error} Jika operasi tidak diperbolehkan
 */
export function validateDefaultIdOperation(id, type, operation) {
  if (isDefaultId(id, type)) {
    const error = new Error(`Cannot ${operation} default ${type}`);
    error.status = 403;
    throw error;
  }
}

export default {
  DEFAULT_IDS,
  CACHE_TTL,
  PAGINATION,
  USER_ROLES,
  isDefaultId,
  validateDefaultIdOperation,
};