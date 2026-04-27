# Essential Bali

Bali lifestyle, events, dine, wellness, nightlife, activities, and culture — by area.

Live: https://essentialbali.gaiada.online

---

## Architecture (current — pre-3PVTRN)

```
                                 ┌──────────────────────────┐
                                 │   Browser / Crawler      │
                                 └────────────┬─────────────┘
                                              │ HTTPS
                                              ▼
                          ┌────────────────────────────────────┐
                          │  nginx (gda-s01, :443)             │
                          │  TLS, gzip, proxy                  │
                          └────────────┬───────────────────────┘
                                       │ proxy_pass 127.0.0.1:8082
                                       ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                Node + Express + Vite SSR                     │
   │                 backend/app.js (port 8082)                   │
   │                                                              │
   │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
   │  │  REST /api  │  │  /sitemap   │  │  Vite SSR (catch-all)│  │
   │  │  routers/   │  │  /robots    │  │  React render → HTML │  │
   │  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘  │
   │         │                │                    │              │
   │         └────────┬───────┴───────────────┬────┘              │
   │                  ▼                       ▼                   │
   │           Sequelize ORM             SSR fetchers             │
   └──────────┬────────────────────────────┬──────────────────────┘
              │                            │
              ▼                            ▼
        ┌──────────┐              ┌──────────────┐
        │  MySQL   │              │  Redis       │
        │  (3306)  │              │  cache (6379)│
        └──────────┘              └──────────────┘
```

**Stack today:** Node 20 · Express 4 · Sequelize · MySQL · Redis · Vite + React 18 + TypeScript · TailwindCSS v4

**Process manager:** PM2 (`essentialbali`)

**Hosting:** GCP `gda-s01.asia-southeast1-b` (`34.124.244.233`)

---

## File structure

```
essentialbali/
├── README.md                     ← you are here
├── backend/                      Node + Express + Vite SSR (port 8082)
│   ├── app.js                    Express bootstrap, SSR wiring, sitemap+robots
│   ├── package.json
│   ├── redisClient.js
│   ├── config/                   DB / env config
│   ├── scripts/                  one-off ops (DB seeding, migrations)
│   └── src/
│       ├── routers/              /api/* route mounting
│       ├── controllers/          request handlers
│       ├── services/             business logic
│       ├── models/               Sequelize models (articles, categories, …)
│       ├── migrations/           Sequelize CLI migrations
│       ├── seeders/              seed data
│       ├── helpers/              response shapers, utilities
│       ├── middlewares/          auth, request timer, CORS
│       ├── workers/              background jobs
│       └── ssr/                  SSR data-fetch layer
│           ├── route.fetch.js
│           ├── content.fetch.js
│           ├── articles.fetch.js
│           ├── auth.fetch.js
│           └── utils/
│
└── frontend/                     React + Vite + TS + Tailwind
    ├── index.html
    ├── package.json
    ├── vite.config.ts            client build
    ├── vite.config.ssr.ts        SSR build (consumed by backend)
    ├── postcss.config.ts
    ├── tsconfig*.json
    ├── nginx.conf                static assets reference (legacy)
    ├── public/                   static (favicon, fonts, images, robots*, …)
    ├── dist/                     build output (gitignored)
    └── src/
        ├── main.tsx              client entry
        ├── App.tsx               app shell
        ├── router-config.tsx     React Router routes (admin + public catch-all)
        ├── routes/
        │   ├── AdminApp.tsx
        │   └── FrontApp.tsx
        ├── pages/                public + admin pages
        ├── components/           shared UI
        ├── context/              providers (Route, Auth, Theme, …)
        └── api/                  client-side data fetching
```

---

## Routes

- **Public:** all paths under `/` (Vite SSR catch-all → `PathResolver` resolves to area / topic / article from DB)
- **Admin:** `/admin/*` (auth required), `/signin`
- **API:** `/api/auth`, `/api/article`, `/api/location`, `/api/category`, `/api/asset_media`, `/api/templating`, `/api/tags`, `/api/socmed`, `/api/advertising`, `/api/timezone`, `/api/newsletter`, `/api/setting`, `/api/job`
- **SEO:** `/robots.txt`, `/sitemap.xml` (dynamic — countries / cities / regions / articles)

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | production, served on gda-s01 |
| `dev` | development worktree at `/var/www/essentialbali-dev` |

Workflow: feature → PR → `dev` → PR → `main`.

---

## Roadmap — 3PVTRN migration

Migrating to: **PostgreSQL · Python · Payload · Vite · React · Tailwind · Node**

| Layer | Today | Target |
|---|---|---|
| DB | MySQL | **PostgreSQL** (`essentialbali_db`) |
| CMS | Custom Express | **Payload CMS** (headless, port `:4008`) |
| Frontend | Vite + React + TS | **Vite + React + Tailwind** (kept) |
| Server scripts | Node | **Node + Python** (scrapers, migration, ML) |
| Styling | Tailwind v4 | **Tailwind v4** (kept) |

The migration preserves the current frontend structure and routing. The data layer (`src/api/*` and backend SSR fetchers) gets rewired to talk to Payload's REST/GraphQL.

---

## Content strategy (driven by `.openclaw-ess` AI agents)

The site is content-managed by an AI agent system running on `gda-ai01` at `/opt/.openclaw-ess` (separate repo: [openclaw-ess](https://github.com/Gaia-Digital-Agency/openclaw-ess)). The agent:

1. **Crawls** 4 benchmark sites (whatsnewindonesia, thehoneycombers/bali, nowbali, thebalibible) for inspiration + benchmarking
2. **Drafts** articles via copywriter agents
3. **Generates** images with Gemini Imagen 3
4. **Writes** SEO meta + internal links
5. **Pushes** to Payload as `pending_review`
6. **Human approves** title / image / body in Payload admin
7. **Publishes** → live + indexed in `/sitemap.xml`

**Content matrix:** 8 areas × 8 topics = 64 groups, target ~20 articles each → ~1,280 articles.

- **Areas:** Canggu · Kuta · Ubud · Jimbaran · Denpasar · Kintamani · Singaraja · Nusa Penida
- **Topics:** Events · News · Featured · Dine · Health & Wellness · Nightlife · Activities · People & Culture

---

## Local dev

```bash
# backend
cd backend
cp .env.sample .env  # fill in values
npm install
npm run dev          # nodemon, port 7777 by default

# frontend (separate terminal)
cd frontend
npm install
npm run dev          # vite, port 5173
```

For SSR locally, point backend `FRONTEND_PATH` env to `../frontend`.

---

## Operations cheatsheet

```bash
# Status
pm2 list | grep essentialbali

# Logs
pm2 logs essentialbali --lines 100

# Restart after deploy
cd /var/www/essentialbali && git pull && cd backend && npm install --omit=dev \
  && cd ../frontend && npm install && npm run build \
  && pm2 restart essentialbali

# Verify SEO endpoints
curl https://essentialbali.gaiada.online/robots.txt
curl https://essentialbali.gaiada.online/sitemap.xml | head -20
```
