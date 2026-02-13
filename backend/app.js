import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import routers from "./src/routers/index.js";
import db from "./src/models/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { response } from "./src/helpers/response.js";
import requestTimer from "./src/middlewares/request_timer.js";


import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fetchTaxonomyData } from "./src/ssr/utils/taxonomy.js";
import { fetchRouteData } from "./src/ssr/route.fetch.js";
import { fetchContentData } from "./src/ssr/content.fetch.js";
import { fetchTemplateContent, fetchTemplateRoute } from "./src/ssr/templates.fetch.js";
import { fetchAuth } from "./src/ssr/auth.fetch.js";
import { fetchArticlesData, getInitialArticleHeroImage } from "./src/ssr/articles.fetch.js";
import redis from "./redisClient.js";
import penthouse from 'penthouse'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";

// SSR paths - only used if FRONTEND_PATH is provided
const frontendPath = process.env.FRONTEND_PATH
  ? path.resolve(__dirname, process.env.FRONTEND_PATH)
  : null;
const templatePath = frontendPath
  ? (isProd
    ? path.resolve(frontendPath, 'index.html')
    : path.resolve(frontendPath, 'index.html'))
  : null;

dotenv.config();

console.log("🔥 Loaded models:");
console.table(Object.keys(db));

db.sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    // Sync database schema - creates tables if they don't exist
    return db.sequelize.sync({ alter: true });
  })
  .then(() => console.log("✅ Database schema synced"))
  .catch((err) => console.error("❌ Error DB:", err));

const port = process.env.PORT || 7777;
const url = process.env.URL || "";
const app = express();
const basePathRaw = process.env.BASE_PATH || "";
const basePath = basePathRaw === "/" ? "" : basePathRaw.replace(/\/$/, "");
const pathWithBase = (p) => `${basePath}${p}`;
const isPathMatch = (pathname, target) =>
  pathname === target || pathname.startsWith(`${target}/`);

let vite;
if (!isProd && frontendPath) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    // Backend uses Vite in middleware mode for SSR template transforms.
    // Disable HMR websocket to avoid crashes when Vite's default WS port (24678)
    // is already in use (common when running a separate frontend dev server).
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
    root: frontendPath,
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(requestTimer);

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
if(isProd) {
    allowedOrigins.push(url);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

app.use(["/sitemap.xml", pathWithBase("/sitemap.xml")], async (req, res, next) => {
  try {
    const BASE = `${req.protocol}://${req.host}${basePath}`
    
    const taxonomies = await fetchTaxonomyData()
    const urls = []
    urls.push({changeFreq: 'daily', url: `${BASE}/`, priority: '1.0'})

    // Countries

    taxonomies.countries.forEach(country => {
      urls.push({changeFreq: 'daily', url: `${BASE}/${country.slug}`, priority: '0.9'})

      // City
      taxonomies.cities.filter(city => (city.id_parent == country.id)).forEach(city => {
        urls.push({changeFreq: 'daily', url: `${BASE}/${country.slug}/${city.slug}`, priority: '0.8'})

        // Region
        taxonomies.regions.filter(region => (region.id_parent == city.id)).forEach(region => {
          urls.push({changeFreq: 'daily', url: `${BASE}/${country.slug}/${city.slug}/${region.slug}`, priority: '0.8'})
        })
      })
    })

    const getDate = (article) => {
      if(article.updatedAt) {
        return new Date(article.updatedAt).toISOString()
      }
      if(article.createdAt) {
        return new Date(article.createdAt).toISOString()
      }
      return false
    }

    const articles = await fetchArticlesData({limit: -1})
    articles.articles.forEach(article => {
      urls.push({url: `${BASE}/${article.slug_country}/${article.slug_category}/${article.slug}`, priority: '0.7', lastmod: getDate(article)})
    })
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${[...urls]
          .map(
              u => `<url>${u.url ? `<loc>${esc(u.url)}</loc>` : ''}
        ${u.changeFreq ? `<changefreq>${esc(u.changeFreq)}</changefreq>` : ''}
        ${u.priority ? `<priority>${esc(u.priority)}</priority>` : ''}
        ${u.lastmod ? `<lastmod>${esc(u.lastmod)}</lastmod>` : ''}</url>`
          )
          .join("")}
      </urlset>`
    res.header("Content-Type", "application/xml").send(xml)
  } catch (e) {
    console.error(e)
    res.status(500).send("Error generating sitemap")
  }
})

app.use(['/robots.txt', pathWithBase('/robots.txt')], (req, res, next) => {
  res.type("text/plain").send(`User-agent: *
Disallow: /admin/
Disallow: /signin
Disallow: /api/
Allow: /

Sitemap: ${req.protocol}://${req.host}${basePath}/sitemap.xml`)
})

const uploadsAbsolute = path.join(__dirname, "uploads");
app.use(["/uploads", pathWithBase("/uploads")], express.static(uploadsAbsolute, {immutable: true, maxAge: '30d'}));

// API routes MUST be registered before Vite/SSR middleware to avoid blocking
app.use(["/api", pathWithBase("/api")], routers);

app.get("/debug/uploads/:name", (req, res) => {
  const filePath = path.join(uploadsAbsolute, req.params.name);
  return res.json({ exists: fs.existsSync(filePath), path: filePath });
});

// Vite/static middleware AFTER API routes so they don't intercept API requests
if (!isProd && vite) {
  app.use(vite.middlewares);
} else if (isProd && frontendPath) {
  app.use((await import('compression')).default());
  app.use(
    (await import('serve-static')).default(path.resolve(frontendPath, 'dist'), {
      index: false,
    })
  );
}

const sanitizeDataForJSON = (data) => {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeDataForJSON(item));
  }
  if (typeof data === 'object') {
    const sanitizedObject = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        sanitizedObject[key] = value === undefined ? null : sanitizeDataForJSON(value);
      }
    }
    return sanitizedObject;
  }
  return data;
}

const clientDist = frontendPath ? path.join(frontendPath, "dist", "client") : null;

// const critters = new Beasties({
//   path: clientDist,
//   preload: 'swap',
//   compress: true
// })

if (frontendPath) {
  app.use('/generate-css', (req, res, next) => {
    penthouse({
      url: process.env.FULL_SITE_URL,
      css: path.join(frontendPath, 'src', 'index.css')
    })
    .then(css => {
      res.send(css)
    })
  })

  app.use(["/assets", pathWithBase("/assets")], express.static(path.join(clientDist, "assets"), { index: false, immutable: true, maxAge: '30d' }))
  app.use(['/font', pathWithBase('/font')], express.static(path.join(clientDist, 'font'), {index: false}))
  app.use(['/images', pathWithBase('/images')], express.static(path.join(clientDist, 'images'), {index: false}))
  app.use(['/favicon.png', pathWithBase('/favicon.png')], express.static(path.join(clientDist, 'favicon.png'), {index: false}))
}
app.use('*', async (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  // Skip SSR when running as API-only service or when frontendPath is not configured
  if (process.env.DISABLE_SSR === 'true' || !frontendPath) {
    return res.status(200).json({ message: 'API server running. Use /api endpoints.' });
  }

  try {
    const _url = req.originalUrl
    const url = req.originalUrl.split('?')[0];
    const search = req.originalUrl.split('?')[1]
    if (url === '/favicon.ico' || url === '/undefined' || url === '/null') {
      return res.status(204).send();
    }
    if (url.includes('.') || url.startsWith('/@')) {
      return next();
    }
    if(!url) {
      return next();
    }
    const initialAuth = await fetchAuth(req)
    // const cached = await redis.get('html:'+_url)
    // const cached = false
    // if(cached && !initialAuth) {
    //   res.set('X-Cache', 'HIT')
    //   return res.status(200).set({ 'Content-Type': 'text/html' }).end(cached);
    // }
    // const csrOnlyRoutes = ['/admin']

    let render, template
    let isAdmin = false
    // const isCsrOnly = csrOnlyRoutes.some(route => url.startsWith(route))
    // template = fs.readFileSync(templatePath, 'utf-8');
    // if (!isProd) {
    //   template = await vite.transformIndexHtml(url, template);
    // }
    const adminPath = pathWithBase("/admin");
    const signInPath = pathWithBase("/signin");
    const isAdminRoute = isPathMatch(url, "/admin") || (basePath && isPathMatch(url, adminPath));
    if(isAdminRoute) {
      if(!initialAuth) return res.redirect(signInPath)
      if (!isProd) {
        template = fs.readFileSync(
            path.join(frontendPath, 'src', 'mainAdmin.html'),
            'utf-8'
        )
        template = await vite.transformIndexHtml(url, template)

        render = (await vite.ssrLoadModule('/src/entry-server-admin.tsx')).render
    } else {
        template = fs.readFileSync(
            path.join(frontendPath, 'dist', 'client', 'src', 'mainAdmin.html'),
            'utf-8'
        )
        render = (await import(
            path.join(frontendPath, 'dist/server/admin.js')
        )).render
    } 
    isAdmin = true
  } else {
      if (!isProd) {
          template = fs.readFileSync(
              path.join(frontendPath, 'src', 'main.html'),
              'utf-8'
          )
          template = await vite.transformIndexHtml(url, template)
  
          render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
      } else {
          template = fs.readFileSync(
              path.join(frontendPath, 'dist', 'client', 'src', 'main.html'),
              'utf-8'
          )
          render = (await import(
              path.join(frontendPath, 'dist/server/front.js')
          )).render
      }
    }
    // if (isCsrOnly) {
    //     return res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    // }

    // const serverEntryPath = path.resolve(frontendPath, 'src', 'entry-server.tsx');
    // const { render } = await vite.ssrLoadModule(serverEntryPath);
    const initialTaxonomies = await fetchTaxonomyData();
    const initialRoute = await fetchRouteData(url, initialTaxonomies, req.ip);
    const initialContent = await fetchContentData(initialRoute, initialTaxonomies, search)
    const initialTemplateContent = await fetchTemplateContent(initialRoute)
    const initialTime = new Date().toISOString()
    const initialHeroImage = getInitialArticleHeroImage(initialRoute, initialContent)

    const initialHeadScript = await fetchTemplateRoute('/script/head');
    const initialPreBodyScript = await fetchTemplateRoute('/script/prebody');
    const initialPostBodyScript = await fetchTemplateRoute('/script/postbody');

    const initialData = { initialTaxonomies, initialRoute, initialContent, initialTemplateContent, initialAuth, initialTime };
    // const passData = sanitizeDataForJSON(initialData, initialTemplateContent)
    const passData = {...initialData, initialTemplateContent}
    
    const { appHtml, helmet } = await render(url, initialData);

    let html = template.replace('<!-- app_html -->', appHtml)

    html = html.replace(
      '<!-- head_replace -->',
        `${helmet?.title?.toString() ?? ''}
         ${helmet?.meta?.toString() ?? ''}
         ${helmet?.link?.toString() ?? ''}
         ${initialHeroImage ? '<link rel="preload" as="image" href="'+process.env.IMAGE_URL + initialHeroImage+'" fetchpriority="high" type="image/webp">' : ''}
         ${initialHeadScript ? initialHeadScript : ''}
         `
    );

    html = html.replaceAll('link rel="stylesheet"', `link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"`)

    if(isAdmin) {
       res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
       return
    }
    html = html.replace(
        '<!-- passdata -->',
        `<script>window.__INITIAL_DATA__ = ${JSON.stringify(passData)}</script>`
    );


    const disableCacheUrl = ['/admin', '/signin', pathWithBase('/admin'), pathWithBase('/signin')]
    const shouldCacheHTML = !disableCacheUrl.find(disabledUrl => (_url.includes(disabledUrl)))
    html = html.replace(
      '<!-- prebody -->',
      `${initialPreBodyScript ?? ''}`
    )
    html = html.replace(
      '<!-- postbody -->',
      `${initialPostBodyScript ?? ''}`
    )
    // if(shouldCacheHTML) {
    //   redis.set("html:" + _url, html, "EX", 100)
    //   res.set('X-Cache', "MISS")
    // }
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
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
