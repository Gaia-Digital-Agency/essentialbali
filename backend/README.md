# Essential Bali — Backend (SSR shell)

Node 20 + Express + Vite 7 SSR. Sits on `:8082` and does three things:

1. **Serves the frontend** — reads `../frontend/dist/` and streams server-rendered HTML for every public URL (`/`, `/canggu`, `/canggu/dine`, `/canggu/dine/{slug}`, etc.). 64 area×topic landing pages all return HTTP 200 (UAT-verified 2026-04-29).
2. **Public REST helpers** — a small set of endpoints the frontend SSR layer calls directly (e.g. legacy article fetches), plus the `/uploads/*` symlink for pre-Payload images.
3. **Talks to Payload** — every CMS read/write goes via `/api/*` to Payload at `:4008` (proxied by nginx in production). Backend has no database connection of its own.

> **Heads up — outdated text removed.** This README previously claimed "Sequelize and MySQL". Both were retired in the 2026-04-29 cleanup. Postgres-via-Payload-REST is the only data path now. There are no `db:migrate` scripts here.

---

## Local development

```bash
pnpm install
pnpm dev                  # nodemon app.js — listens on :8082
```

Pre-requisites:

- `../frontend/dist/` must exist (run `cd ../frontend && pnpm build` once)
- Payload running on `:4008` (run `cd ../cms && pnpm dev`)

`.env` keys consumed:

| key | purpose |
|---|---|
| `PAYLOAD_BASE_URL` | where to call Payload REST (e.g. `http://127.0.0.1:4008`) |
| `PAYLOAD_AI_API_KEY` | optional — service-token for backend → Payload calls that need write access |
| `GOOGLE_APPLICATION_CREDENTIALS` | service-account JSON for any GCS read fallbacks |
| `FRONTEND_PATH` | path to `../frontend` so SSR can locate `dist/client/index.html` |
| `BASE_PATH` | URL base path (default `/`) |
| `PORT` | listen port (default 7777, prod uses 8082 via pm2 env) |
| `NODE_ENV` | `production` skips Vite middleware mode |

---

## Production deploy

```bash
ssh gda-s01 'cd /var/www/essentialbali \
  && git pull \
  && cd frontend && pnpm install && pnpm build \
  && cd ../backend && pnpm install \
  && pm2 restart essentialbali'
```

A frontend code change requires **rebuilding the frontend AND restarting the backend** — the SSR shell holds a reference to the built index template and bundle paths.

---

## Routes the SSR shell handles

Everything *except* the paths nginx routes to Payload. The current Payload-allowlist regex is:

```
location ~ ^/api/(users|areas|topics|articles|personas|media|comments|hero-ads|hero-ad-versions|newsletters|home-daily-feed|globals|subscribers|payload-preferences|access|graphql|graphql-playground|ai-chat|advertise|seo-optimize|seo-competitor-gap|regenerate-hero)(/|$)
```

Anything else hits this backend:

| Path | Served by |
|---|---|
| `/` | SSR — homepage |
| `/{area}` | SSR — area page (8 areas) |
| `/{area}/{topic}` | SSR — listing page (64 cells) |
| `/{area}/{topic}/{slug}` | SSR — single article |
| `/api/article` | Express handler — legacy adapter the frontend service layer uses for related/listing/search fetches. Translates legacy query keys (`category[]=`, `id_country=`, `slug=`, `metaData_*` for events) into Payload `where[...]` filters via `fetchArticlesData`. Returns `{status_code, data: {articles, pagination}}`. |
| `/api/article/search` | Express handler — keyword search adapter |
| `/api/content` | Express handler — refresh SSR-shaped `initialContent` for SPA intra-nav |
| `/api/advertise` | nginx → Payload route handler (NOT this backend) |
| `/uploads/*` | static serve from `../old_assets/legacy-uploads/` (73 pre-Payload images, kept for back-compat) |
| `/signin`, `/signup` | nginx `410 Gone` (legacy admin retired) |

> **Note — nginx allowlist gotcha.** Adding a new Payload collection means updating the regex above (in `/etc/nginx/sites-available/essentialbali.com`) AND running `sudo nginx -t && sudo nginx -s reload`. Caught us multiple times during the 2026-04-29 → 2026-04-30 work — `subscribers/subscribe` (silent 404), `newsletters` (admin Save broken), `home-daily-feed` + `globals` (404 from new endpoints in the homepage redesign), `hero-ad-versions` (404 from the History panel). Each addition needed a reload. Backups left at `.bak.uat-<ts>` and `.bak.heroad-versions-<ts>` files. If you add `tags`, `events`, `jobs`, `housing`, `deals`, etc., remember the regex.

> **Note — `/api/article?slug=...` MUST honour the slug filter.** Without that, every PathResolver lookup of a non-article URL segment returned the full set, and the frontend rendered a random article on every listing URL. Added 2026-04-30 (commit `2d24a93`).

---

## Internal layout (current — post-cleanup-C, 2026-04-29)

```
backend/
├── app.js                            bootstrap, sitemap+robots fall-through, SSR wiring,
│                                     CORS with hot-reload + asset bypass
├── src/
│   ├── ssr/                          the SSR data layer (Payload-only)
│   │   ├── articles.fetch.js         → uses lib/lexical-to-html for body rendering
│   │   ├── locations.fetch.js        areas → legacy "country" shape
│   │   ├── categories.fetch.js       topics → legacy "category" shape
│   │   ├── tags.fetch.js
│   │   ├── route.fetch.js            URL → article|area|topic resolver
│   │   ├── content.fetch.js          template content (header/footer/about)
│   │   ├── templates.fetch.js        reads static-templates/*.json
│   │   ├── auth.fetch.js             stub — returns undefined (legacy admin gone)
│   │   └── static-templates/         header.json, footer.json, logo-header.json, about.json
│   ├── lib/
│   │   ├── payload.client.js         thin Payload REST client
│   │   └── lexical-to-html.js        Lexical JSON tree → HTML serializer
│   ├── helpers/
│   │   ├── response.js               JSON-envelope helper used by app.js
│   │   └── logger.js                 pino wrapper
│   ├── middlewares/
│   │   └── request_timer.js          request latency logger
│   └── workers/                      background jobs
├── uploads -> ../old_assets/legacy-uploads     (symlink for back-compat)
├── redisClient.js                    rate-limit cache only
└── .env                              see table above
```

---

## Operations

```bash
pm2 list | grep essentialbali        # essentialbali (SSR) + essentialbali-cms (Payload)
pm2 logs essentialbali --lines 50
pm2 restart essentialbali

# Smoke
curl -sI https://essentialbali.com/                                  # 200
curl -sI https://essentialbali.com/canggu/dine                       # 200
curl -sI https://essentialbali.com/uploads/img_6523.webp             # 200 (legacy)
```

---

## Pointer

Whole-system architecture, the Elliot agent pipeline, and the path-aware nginx routing diagram live in `../README.md`. The most recent end-to-end UAT report (with the 64-cell coverage matrix, agent-skill audit, and crawler internals) is at `../docs/full_test.md`.
