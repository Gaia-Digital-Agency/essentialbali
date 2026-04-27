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

## PostgreSQL schema (Phase D target)

Database: `essentialbali_db` · User: `essentialbali_user`

Payload owns the schema and migrates it. The collections below describe the *intent* — Payload generates the actual tables.

```sql
-- ─── Taxonomy (8 + 8 fixed) ──────────────────────────────────────────
CREATE TABLE areas (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,    -- canggu, kuta, ubud, ...
  name         TEXT NOT NULL,
  hero_media   INT REFERENCES media(id),
  intro        TEXT,
  lat          NUMERIC(9,6),
  lng          NUMERIC(9,6)
);

CREATE TABLE topics (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,    -- events, news, featured, dine, ...
  name         TEXT NOT NULL,
  icon         TEXT,
  intro        TEXT
);

-- ─── Personas (writer voices, for E-E-A-T SEO) ───────────────────────
CREATE TABLE personas (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,    -- maya, komang, putu, sari
  name         TEXT NOT NULL,
  bio          TEXT,
  avatar_media INT REFERENCES media(id),
  voice_notes  TEXT
);

-- ─── Articles ────────────────────────────────────────────────────────
CREATE TABLE articles (
  id              SERIAL PRIMARY KEY,
  area_id         INT NOT NULL REFERENCES areas(id),
  topic_id        INT NOT NULL REFERENCES topics(id),
  persona_id      INT REFERENCES personas(id),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  sub_title       TEXT,
  body            JSONB NOT NULL,                 -- Payload rich-text Lexical
  hero_media      INT REFERENCES media(id),
  status          TEXT NOT NULL DEFAULT 'draft',  -- draft|pending_review|approved|published|rejected
  meta_title      TEXT,
  meta_description TEXT,
  keywords        TEXT[],
  source_url      TEXT,                           -- crawler-cited reference
  source_site     TEXT,
  source_hash     TEXT,                           -- idempotency key
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (area_id, topic_id, slug),
  UNIQUE (source_hash)                            -- AI re-runs never duplicate
);
CREATE INDEX idx_articles_area_topic_status ON articles(area_id, topic_id, status);
CREATE INDEX idx_articles_published_at      ON articles(published_at DESC);

-- ─── Media ───────────────────────────────────────────────────────────
CREATE TABLE media (
  id           SERIAL PRIMARY KEY,
  filename     TEXT NOT NULL,
  mime         TEXT NOT NULL,
  width        INT,
  height       INT,
  alt          TEXT,
  credit       TEXT,
  generated_by TEXT,                  -- 'imager' | 'upload' | 'imported'
  prompt       TEXT,                  -- if AI-generated
  url          TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Comments (CRUD by AI agent + by humans) ─────────────────────────
CREATE TABLE comments (
  id           SERIAL PRIMARY KEY,
  article_id   INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  persona_id   INT REFERENCES personas(id),       -- NULL = real human commenter
  author_name  TEXT,                              -- if real human, captured display name
  body         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'visible',   -- visible|hidden|spam
  parent_id    INT REFERENCES comments(id),       -- threaded
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comments_article ON comments(article_id, status);

-- ─── Tags (secondary taxonomy for SEO) ───────────────────────────────
CREATE TABLE tags (
  id      SERIAL PRIMARY KEY,
  slug    TEXT UNIQUE NOT NULL,
  name    TEXT NOT NULL
);
CREATE TABLE article_tags (
  article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ─── Hero ad slots (64 fixed: 8 areas × 8 topics) ────────────────────
-- Phase D placeholder: each cell shows "Ads space > {Area} > {Topic}" until activated
CREATE TABLE hero_ads (
  id          SERIAL PRIMARY KEY,
  area_id     INT NOT NULL REFERENCES areas(id),
  topic_id    INT NOT NULL REFERENCES topics(id),
  active      BOOLEAN NOT NULL DEFAULT FALSE,    -- the Activate/Deactivate toggle
  client      TEXT,
  creative    INT REFERENCES media(id),
  link_url    TEXT,
  start_at    TIMESTAMPTZ,
  end_at      TIMESTAMPTZ,
  placeholder TEXT GENERATED ALWAYS AS
              ('Ads space > ' || (SELECT name FROM areas WHERE id = area_id)
                || ' > ' || (SELECT name FROM topics WHERE id = topic_id)) STORED,
  UNIQUE (area_id, topic_id)
);

-- ─── Subscribers / newsletter (carryover from current site) ──────────
CREATE TABLE subscribers (
  id           SERIAL PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit (Payload-managed) ─────────────────────────────────────────
-- Payload maintains its own _users, _api_keys, _versions tables.
```

**URL contract:** `/{area_slug}/{topic_slug}/{article_slug}` — preserved from current routing.

**Idempotency:** AI agent uses `source_hash` so re-runs of the same crawler URL never create duplicates.

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
