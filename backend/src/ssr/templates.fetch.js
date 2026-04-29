import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import redis from "../../redisClient.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = resolve(__dirname, "static-templates");

/**
 * Phase E rewire: header / footer / logo-header / about used to live in
 * the MySQL `article_templating` table. We dumped the four rows to JSON
 * files at ssr/static-templates/ when MySQL was decommissioned. They
 * almost never change — when they do, edit the JSON directly.
 *
 * Redis cache (1 h) preserved so subsequent renders are still hot.
 */
const STATIC_KEYS = {
  "/header": "header.json",
  "/footer": "footer.json",
  "/logo-header": "logo-header.json",
  "/about": "about.json",
};

const readStatic = async (url) => {
  const fname = STATIC_KEYS[url];
  if (!fname) return null;
  const path = resolve(STATIC_DIR, fname);
  if (!existsSync(path)) return null;
  try {
    const txt = await readFile(path, "utf-8");
    return JSON.parse(txt);
  } catch (e) {
    console.error("[ssr/templates.fetch] static read fail", url, e.message);
    return null;
  }
};

export const fetchTemplateRoute = async (url) => {
  const tryRedis = await redis.get(url).catch(() => null);
  if (tryRedis) {
    try {
      return JSON.parse(tryRedis);
    } catch {
      /* fall through */
    }
  }
  const val = await readStatic(url);
  if (val !== null) {
    try { await redis.set(url, JSON.stringify(val), "EX", 3600); } catch {}
  }
  return val;
};

const determineLogo = (route) => {
  if (route.listingParams.region?.site_logo) return route.listingParams.region.site_logo;
  if (route.listingParams.city?.site_logo) return route.listingParams.city.site_logo;
  if (route.listingParams.country?.site_logo) return route.listingParams.country.site_logo;
  return false;
};

export const fetchTemplateContent = async (route) => {
  const getHeader = await fetchTemplateRoute("/header");
  const getFooter = await fetchTemplateRoute("/footer");
  const getLogo = await fetchTemplateRoute("/logo-header");
  const currentLogo = determineLogo(route);
  const getAbout = await fetchTemplateRoute("/about");
  return {
    header: getHeader,
    footer: getFooter,
    logo: getLogo,
    currentLogo,
    about: getAbout,
  };
};
