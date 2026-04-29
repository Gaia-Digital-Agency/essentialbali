import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { response } from "./src/helpers/response.js";
import requestTimer from "./src/middlewares/request_timer.js";
import { pino } from "pino";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fetchTaxonomyData } from "./src/ssr/utils/taxonomy.js";
import { fetchRouteData } from "./src/ssr/route.fetch.js";
import { fetchContentData } from "./src/ssr/content.fetch.js";
import {
  fetchTemplateContent,
  fetchTemplateRoute,
} from "./src/ssr/templates.fetch.js";
import { fetchAuth } from "./src/ssr/auth.fetch.js";
import {
  fetchArticlesData,
  fetchArticleDataByKeyword,
  getInitialArticleHeroImage,
} from "./src/ssr/articles.fetch.js";
import redis from "./redisClient.js";

const logger = pino(pino.destination('./logs/pino.log'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";

// SSR paths - only used if FRONTEND_PATH is provided
const frontendPath = process.env.FRONTEND_PATH
  ? path.resolve(__dirname, process.env.FRONTEND_PATH)
  : null;
const templatePath = frontendPath
  ? isProd
    ? path.resolve(frontendPath, "index.html")
    : path.resolve(frontendPath, "index.html")
  : null;

dotenv.config();

// (cleanup-C) Sequelize/MySQL boot path was removed entirely.
// MySQL was dropped 2026-04-28 and SSR fetchers go to Payload REST only.
// USE_PAYLOAD_DATA env var is no longer read — there is no fallback path
// to switch into.

const port = process.env.PORT || 7777;
const url = process.env.URL || "";
const app = express();
// Trust nginx reverse proxy: makes req.protocol read x-forwarded-proto (https),
// req.ip read the real client IP, and silences express-rate-limit warnings.
app.set("trust proxy", 1);
const basePathRaw = process.env.BASE_PATH || "";
const basePath = basePathRaw === "/" ? "" : basePathRaw.replace(/\/$/, "");
const pathWithBase = (p) => `${basePath}${p}`;
const isPathMatch = (pathname, target) =>
  pathname === target || pathname.startsWith(`${target}/`);

let vite;
if (!isProd && frontendPath) {
  const { createServer: createViteServer } = await import("vite");
  vite = await createViteServer({
    // Backend uses Vite in middleware mode for SSR template transforms.
    // Disable HMR websocket to avoid crashes when Vite's default WS port (24678)
    // is already in use (common when running a separate frontend dev server).
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
    root: frontendPath,
  });
}

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(requestTimer);

// CORS allowlist — single source at shared/allowed-origins.json.
//
// Defence in depth (this code path got us into trouble before):
//   1. Hot-reload with 30s TTL — editing the JSON file does NOT require a
//      restart. Cache invalidates by mtime; reads only happen when stale.
//   2. Hard-coded FALLBACK so the site never goes dark if the JSON file
//      is missing, corrupt, or briefly unreadable mid-deploy.
//   3. cors() origin callback returns `false` (deny without throwing) —
//      never `new Error(...)`. A throw goes to Express"""s error handler
//      and turns every static-asset request into an HTML 500.
//   4. Static-asset paths bypass CORS entirely (they"""re public files;
//      browsers don"""t need CORS for same-origin same-file requests, and
//      cross-origin asset loads work via the standard `crossorigin` flag).
const FALLBACK_ORIGINS = [
  "https://essentialbali.gaiada.online",
  "https://essentialbali.com",
  "https://www.essentialbali.com",
  "https://ess.gaiada0.online",
];
const ALLOWED_ORIGINS_FILE = "/var/www/essentialbali/shared/allowed-origins.json";
let _origCache = { list: FALLBACK_ORIGINS, mtimeMs: 0, checkedAt: 0 };
function getAllowedOrigins() {
  const now = Date.now();
  if (now - _origCache.checkedAt < 30_000) return _origCache.list;
  _origCache.checkedAt = now;
  try {
    const stat = fs.statSync(ALLOWED_ORIGINS_FILE);
    if (stat.mtimeMs === _origCache.mtimeMs) return _origCache.list;
    const parsed = JSON.parse(fs.readFileSync(ALLOWED_ORIGINS_FILE, "utf-8"));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error("❌ allowed-origins.json invalid (not array / empty) — using fallback");
      _origCache = { list: FALLBACK_ORIGINS, mtimeMs: stat.mtimeMs, checkedAt: now };
    } else {
      _origCache = { list: parsed, mtimeMs: stat.mtimeMs, checkedAt: now };
    }
  } catch (e) {
    console.error("❌ allowed-origins.json unreadable —", e.message, "— using fallback");
    _origCache = { list: FALLBACK_ORIGINS, mtimeMs: 0, checkedAt: now };
  }
  return _origCache.list;
}
// Warm cache + log loaded list at boot (visible in pm2 logs).
console.log("✅ CORS allowed origins:", getAllowedOrigins().join(", "));

// Static-asset paths bypass CORS entirely (no risk of HTML-500 black-out
// when origin allowlist has a hiccup).
const ASSET_BYPASS = /^\/(assets|uploads|media|favicon|logo|static|fonts?|img|images|src)\b/i;
app.use((req, res, next) => {
  if (ASSET_BYPASS.test(req.path)) {
    const origin = req.headers.origin;
    if (origin && getAllowedOrigins().includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
      res.set("Vary", "Origin");
    }
    return next();
  }
  return next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // No-origin (server-to-server, curl) → allow.
      if (!origin) return callback(null, true);
      const list = getAllowedOrigins();
      if (list.includes(origin)) return callback(null, true);
      // Reject WITHOUT throwing. Browser blocks per spec; request still
      // returns its actual content-type and status (no HTML-500).
      console.warn("⚠ CORS deny:", origin);
      return callback(null, false);
    },
    credentials: true,
  }),
);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

app.use(
  ["/sitemap.xml", pathWithBase("/sitemap.xml")],
  async (req, res, next) => {
    try {
      const BASE = `${req.protocol}://${req.hostname}${basePath}`;

      const taxonomies = (await fetchTaxonomyData()) || {};
      const countries = Array.isArray(taxonomies.countries) ? taxonomies.countries : [];
      const cities = Array.isArray(taxonomies.cities) ? taxonomies.cities : [];
      const regions = Array.isArray(taxonomies.regions) ? taxonomies.regions : [];

      const urls = [];
      urls.push({ changeFreq: "daily", url: `${BASE}/`, priority: "1.0" });

      // Countries → cities → regions
      countries.forEach((country) => {
        if (!country?.slug) return;
        urls.push({
          changeFreq: "daily",
          url: `${BASE}/${country.slug}`,
          priority: "0.9",
        });

        cities
          .filter((city) => city?.id_parent == country.id)
          .forEach((city) => {
            if (!city?.slug) return;
            urls.push({
              changeFreq: "daily",
              url: `${BASE}/${country.slug}/${city.slug}`,
              priority: "0.8",
            });

            regions
              .filter((region) => region?.id_parent == city.id)
              .forEach((region) => {
                if (!region?.slug) return;
                urls.push({
                  changeFreq: "daily",
                  url: `${BASE}/${country.slug}/${city.slug}/${region.slug}`,
                  priority: "0.8",
                });
              });
          });
      });

      const getDate = (article) => {
        if (article?.updatedAt) return new Date(article.updatedAt).toISOString();
        if (article?.createdAt) return new Date(article.createdAt).toISOString();
        return false;
      };

      const articlesResult = (await fetchArticlesData({ limit: -1 })) || {};
      const articles = Array.isArray(articlesResult.articles) ? articlesResult.articles : [];
      articles.forEach((article) => {
        if (!article?.slug || !article?.slug_country || !article?.slug_category) return;
        urls.push({
          url: `${BASE}/${article.slug_country}/${article.slug_category}/${article.slug}`,
          priority: "0.7",
          lastmod: getDate(article),
        });
      });
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${[...urls]
        .map(
          (u) => `<url>${u.url ? `<loc>${esc(u.url)}</loc>` : ""}
        ${u.changeFreq ? `<changefreq>${esc(u.changeFreq)}</changefreq>` : ""}
        ${u.priority ? `<priority>${esc(u.priority)}</priority>` : ""}
        ${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ""}</url>`,
        )
        .join("")}
      </urlset>`;
      res.header("Content-Type", "application/xml").send(xml);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error generating sitemap");
    }
  },
);

app.use(["/robots.txt", pathWithBase("/robots.txt")], (req, res, next) => {
  res.type("text/plain").send(`User-agent: *
Disallow: /admin/
Disallow: /signin
Disallow: /api/
Allow: /

Sitemap: ${req.protocol}://${req.hostname}${basePath}/sitemap.xml`);
});

const uploadsAbsolute = path.join(__dirname, "uploads");
app.use(
  ["/uploads", pathWithBase("/uploads")],
  express.static(uploadsAbsolute, { immutable: true, maxAge: "30d" }),
);

// API routes MUST be registered before Vite/SSR middleware to avoid blocking

app.get("/debug/uploads/:name", (req, res) => {
  const filePath = path.join(uploadsAbsolute, req.params.name);
  return res.json({ exists: fs.existsSync(filePath), path: filePath });
});

// Legacy public-API adapter: /api/article — used by frontend service layer
// (article.service.ts) for related/listing fetches on Single/Events/Housing
// templates. Translates the legacy query shape (category[]=, id_country=,
// limit=, page=) into Payload via fetchArticlesData and returns the legacy
// {status_code, data: {articles, pagination}} envelope the frontend expects.
const toNumOrUndef = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const articleListHandler = async (req, res) => {
  try {
    const q = req.query || {};
    const cat = q.category;
    const params = {
      limit: toNumOrUndef(q.limit),
      page: toNumOrUndef(q.page),
      id_country: toNumOrUndef(q.id_country),
      country: typeof q.country === "string" ? q.country : undefined,
      category: Array.isArray(cat)
        ? cat.map((v) => toNumOrUndef(v) ?? v).filter((v) => v != null)
        : cat != null && cat !== ""
          ? (toNumOrUndef(cat) ?? cat)
          : undefined,
    };
    const result = await fetchArticlesData(params);
    res.json({ status_code: 200, status: "OK", data: result });
  } catch (e) {
    console.error("[/api/article] error:", e?.message || e);
    res
      .status(500)
      .json({ status_code: 500, status: "ERROR", data: null, message: String(e?.message || e) });
  }
};
app.get(["/api/article", pathWithBase("/api/article")], articleListHandler);

// Legacy public-API adapter: /api/article/search?keyword=…
app.get(
  ["/api/article/search", pathWithBase("/api/article/search")],
  async (req, res) => {
    try {
      const keyword = String(req.query?.keyword || "").trim();
      if (!keyword) {
        return res.json({
          status_code: 200,
          status: "OK",
          data: { articles: [] },
        });
      }
      const result = await fetchArticleDataByKeyword(keyword);
      res.json({ status_code: 200, status: "OK", data: result });
    } catch (e) {
      console.error("[/api/article/search] error:", e?.message || e);
      res
        .status(500)
        .json({ status_code: 500, status: "ERROR", data: null, message: String(e?.message || e) });
    }
  },
);

// Vite/static middleware AFTER API routes so they don't intercept API requests
if (!isProd && vite) {
  app.use(vite.middlewares);
} else if (isProd && frontendPath) {
  app.use((await import("compression")).default());
  app.use(
    (await import("serve-static")).default(path.resolve(frontendPath, "dist"), {
      index: false,
    }),
  );
}

const sanitizeDataForJSON = (data) => {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDataForJSON(item));
  }
  if (typeof data === "object") {
    const sanitizedObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        sanitizedObject[key] =
          value === undefined ? null : sanitizeDataForJSON(value);
      }
    }
    return sanitizedObject;
  }
  return data;
};

const clientDist = frontendPath
  ? path.join(frontendPath, "dist", "client")
  : null;

// const critters = new Beasties({
//   path: clientDist,
//   preload: 'swap',
//   compress: true
// })

if (frontendPath) {
  // /generate-css endpoint (penthouse critical-CSS extractor) removed —
  // it had zero callers, manual test hung 15s (Chromium not installed),
  // and Vite already inlines critical CSS into index.html at build time.
  app.use(
    ["/assets", pathWithBase("/assets")],
    express.static(path.join(clientDist, "assets"), {
      index: false,
      immutable: true,
      maxAge: "30d",
    }),
  );
  app.use(
    ["/font", pathWithBase("/font")],
    express.static(path.join(clientDist, "font"), { index: false }),
  );
  app.use(
    ["/images", pathWithBase("/images")],
    express.static(path.join(clientDist, "images"), { index: false }),
  );
  app.use(
    ["/favicon.png", pathWithBase("/favicon.png")],
    express.static(path.join(clientDist, "favicon.png"), { index: false }),
  );
  // Site logo — single root-level asset shown in header. Without this mount
  // the file at dist/client/logo.png is not reachable as /logo.png (404).
  app.use(
    ["/logo.png", pathWithBase("/logo.png")],
    express.static(path.join(clientDist, "logo.png"), { index: false }),
  );
}

// Content fetcher for client-side SPA navigation. Mirrors what SSR runs on the
// initial request (taxonomies + route + content + template content) so the
// article/event/listing templates can refresh related/discover/listing data
// after intra-SPA route changes without a full reload.
app.get(["/api/content", pathWithBase("/api/content")], async (req, res) => {
  try {
    const rawPath = String(req.query?.path || "/");
    const search = req.query?.search ? String(req.query.search) : undefined;
    const url = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const initialTaxonomies = await fetchTaxonomyData();
    const initialRoute = await fetchRouteData(url, initialTaxonomies, req.ip);
    const initialContent = await fetchContentData(
      initialRoute,
      initialTaxonomies,
      search,
    );
    const initialTemplateContent = await fetchTemplateContent(initialRoute);
    res.json({
      status_code: 200,
      status: "OK",
      data: { initialRoute, initialContent, initialTemplateContent },
    });
  } catch (e) {
    console.error("[/api/content] error:", e?.message || e);
    res.status(500).json({
      status_code: 500,
      status: "ERROR",
      data: null,
      message: String(e?.message || e),
    });
  }
});

app.use("*", async (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  // Skip SSR when running as API-only service or when frontendPath is not configured
  if (process.env.DISABLE_SSR === "true" || !frontendPath) {
    return res
      .status(200)
      .json({ message: "API server running. Use /api endpoints." });
  }

  try {
    const _url = req.originalUrl;
    const url = req.originalUrl.split("?")[0];
    const search = req.originalUrl.split("?")[1];
    if (url === "/favicon.ico" || url === "/undefined" || url === "/null") {
      return res.status(204).send();
    }
    if (url.includes(".") || url.startsWith("/@")) {
      return next();
    }
    if (!url) {
      return next();
    }
    const initialAuth = await fetchAuth(req);
    // const cached = await redis.get('html:'+_url)
    // const cached = false
    // if(cached && !initialAuth) {
    //   res.set('X-Cache', 'HIT')
    //   return res.status(200).set({ 'Content-Type': 'text/html' }).end(cached);
    // }
    // const csrOnlyRoutes = ['/admin']

    let render, template;
    // (cleanup-D) The legacy admin SSR branch (mainAdmin.html / entry-server-admin.tsx
    // / pages/Master/* / quill) was removed. /admin is now served by Payload at
    // :4008 via nginx allowlist — Express never sees /admin requests on production.
    // For local dev where Express might still receive /admin, we just fall through
    // to the public Front bundle (which renders 404 cleanly via React Router).
    {
      if (!isProd) {
        template = fs.readFileSync(
          path.join(frontendPath, "src", "main.html"),
          "utf-8",
        );
        template = await vite.transformIndexHtml(url, template);

        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        template = fs.readFileSync(
          path.join(frontendPath, "dist", "client", "src", "main.html"),
          "utf-8",
        );
        render = (await import(path.join(frontendPath, "dist/server/front.js")))
          .render;
      }
    }
    // if (isCsrOnly) {
    //     return res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    // }

    // const serverEntryPath = path.resolve(frontendPath, 'src', 'entry-server.tsx');
    // const { render } = await vite.ssrLoadModule(serverEntryPath);
    const initialTaxonomies = await fetchTaxonomyData();
    logger.info(initialTaxonomies);
    const initialRoute = await fetchRouteData(url, initialTaxonomies, req.ip);
    logger.info(initialRoute);
    // console.log(initialRoute);
    const initialContent = await fetchContentData(
      initialRoute,
      initialTaxonomies,
      search,
    );
    // const initialContent = []
    const initialTemplateContent = await fetchTemplateContent(initialRoute);
    const initialTime = new Date().toISOString();
    const initialHeroImage = getInitialArticleHeroImage(
      initialRoute,
      initialContent,
    );

    const initialHeadScript = await fetchTemplateRoute("/script/head");
    const initialPreBodyScript = await fetchTemplateRoute("/script/prebody");
    const initialPostBodyScript = await fetchTemplateRoute("/script/postbody");

    const initialData = {
      initialTaxonomies,
      initialRoute,
      initialContent,
      initialTemplateContent,
      initialAuth,
      initialTime,
    };
    // const passData = sanitizeDataForJSON(initialData, initialTemplateContent)
    const passData = { ...initialData, initialTemplateContent };

    const { appHtml, helmet } = await render(url, initialData);

    let html = template.replace("<!-- app_html -->", appHtml);

    html = html.replace(
      "<!-- head_replace -->",
      `${helmet?.title?.toString() ?? ""}
         ${helmet?.meta?.toString() ?? ""}
         ${helmet?.link?.toString() ?? ""}
         ${initialHeroImage ? '<link rel="preload" as="image" href="' + process.env.IMAGE_URL + initialHeroImage + '" fetchpriority="high" type="image/webp">' : ""}
         ${initialHeadScript ? initialHeadScript : ""}
         `,
    );

    html = html.replaceAll(
      'link rel="stylesheet"',
      `link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"`,
    );

    // (cleanup-D) isAdmin early-return removed — admin SSR branch is gone.
    html = html.replace(
      "<!-- passdata -->",
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(passData)}</script>`,
    );

    const disableCacheUrl = [
      "/admin",
      "/signin",
      pathWithBase("/admin"),
      pathWithBase("/signin"),
    ];
    const shouldCacheHTML = !disableCacheUrl.find((disabledUrl) =>
      _url.includes(disabledUrl),
    );
    html = html.replace("<!-- prebody -->", `${initialPreBodyScript ?? ""}`);
    html = html.replace("<!-- postbody -->", `${initialPostBodyScript ?? ""}`);
    // if(shouldCacheHTML) {
    //   redis.set("html:" + _url, html, "EX", 100)
    //   res.set('X-Cache', "MISS")
    // }


    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    if (vite) vite.ssrFixStacktrace(e);
    console.error(e);
    res.status(500).end(e.message);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return response(res, 400, "File too large. Max 5MB allowed.");
    }
    return response(res, 400, err.message);
  }
  if (err.message && err.message.includes("Only image files")) {
    return response(res, 400, err.message);
  }
  next(err);
});

// In some environments, Node binds to IPv6 only, which can break IPv4-only clients
// (e.g. a Vite proxy targeting 127.0.0.1). For local dev, bind explicitly to IPv4 loopback.
const listenHost = process.env.HOST || (isProd ? "0.0.0.0" : "127.0.0.1");
app.listen(port, listenHost, () => {
  const app_running_on = `${listenHost}:${port}`;
  console.table({ app_running_on });
});
