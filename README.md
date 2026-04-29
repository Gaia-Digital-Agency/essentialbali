# Essential Bali

Bali, by area. Events, dine, wellness, nightlife, activities, news, culture, featured.

Live on three domains, all HTTPS, all serving identical content:

- **https://essentialbali.gaiada.online** (subdomain)
- **https://essentialbali.com** (apex)
- **https://www.essentialbali.com** (www)

---

## Architecture

```
                        ┌─────────────────────────────┐
                        │  Browser / Crawler          │
                        └──────────────┬──────────────┘
                                       │ HTTPS
                                       ▼
                  ┌────────────────────────────────────┐
                  │  nginx @ gda-s01 (:443)            │
                  │  TLS · path-aware routing          │
                  └─────┬───────────────────────────────┘
                        │
       ┌────────────────┼─────────────────────────────┐
       │ /admin                                       │ /
       │ /_next                                       │ /sitemap.xml
       │ /api/{users,areas,topics,articles,           │ /robots.txt
       │       personas,media,comments,hero-ads,      │ /…  (everything else)
       │       subscribers,newsletters,               │
       │       payload-preferences,access,            │
       │       graphql,graphql-playground,            │
       │       ai-chat,_internal}                     │
       ▼                                              ▼
┌──────────────────────┐                ┌──────────────────────────────┐
│ Payload CMS @ :4008  │                │ Vite SSR + Express @ :8082   │
│ Next.js 15           │                │ Original frontend, unchanged │
│ • admin              │                │ Reads taxonomies + articles  │
│ • REST + GraphQL     │                │ from Payload via SSR fetcher │
│ • email (Gmail SMTP) │                │ rewire (USE_PAYLOAD_DATA=true│
│ • /api/ai-chat       │                │                              │
│   (Vertex Gemini,    │                └──────────────────────────────┘
│    Elliot persona)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐    ┌──────────────────┐
│ PostgreSQL 5432  │    │ Redis 6379       │
│ essentialbali_db │    │ rate-limit cache │
└──────────────────┘    └──────────────────┘
```

**Stack:** PostgreSQL · Python (Elliot's scraper) · Payload v3.84 · Next.js 15 · Vite 7 · React 19 · TailwindCSS v4 · Node 20

**Hosting:** GCP `gda-s01.asia-southeast1-b` (`34.124.244.233`)

**Stack alignment** — frontend, backend SSR shell, and cms all share React 19 / Vite 7 / TypeScript 5.7. The legacy Sequelize/MySQL stack and the legacy custom admin (Master/, Quill, AuthPages) were retired in the 2026-04-29 cleanup; backend now talks to Postgres only via Payload REST.

---

## File structure

```
essentialbali/
├── README.md                     ← you are here
├── docs/                         operator docs
│   ├── user_guide.md             how-to-use guide (review flow, Elliot dispatch, etc.)
│   ├── code_inventory.md         living source-line audit (excludes node_modules + dead-stack)
│   ├── essentialbali_actions.md  79-item action backlog
│   └── essentialbali_elliot_project.md   Elliot project brief
├── shared/
│   └── allowed-origins.json      single CORS allowlist read by both Express + Payload
│                                  (mtime-aware 30s TTL cache, hardcoded fallback)
├── backend/                      Express + Vite 7 SSR (port 8082)
│   ├── app.js                    bootstrap, sitemap+robots, SSR wiring,
│   │                              CORS with hot-reload + asset bypass
│   ├── src/
│   │   ├── ssr/                  the SSR data layer (Payload-only, post-cleanup-C)
│   │   │   ├── articles.fetch.js   uses lib/lexical-to-html for body rendering
│   │   │   ├── locations.fetch.js  areas → legacy "country" shape
│   │   │   ├── categories.fetch.js topics → legacy "category" shape
│   │   │   ├── tags.fetch.js
│   │   │   ├── route.fetch.js      URL → article|area|topic resolver
│   │   │   ├── content.fetch.js    template content (header/footer/about)
│   │   │   ├── templates.fetch.js  reads static-templates/*.json (post-MySQL drop)
│   │   │   ├── auth.fetch.js       stub (returns undefined; legacy admin gone)
│   │   │   └── static-templates/   header.json, footer.json, logo-header.json, about.json
│   │   ├── lib/
│   │   │   ├── payload.client.js   thin Payload REST client
│   │   │   └── lexical-to-html.js  Lexical JSON tree → HTML serializer
│   │   ├── helpers/
│   │   │   ├── response.js         JSON-envelope helper used by app.js
│   │   │   └── logger.js           pino wrapper
│   │   ├── middlewares/
│   │   │   └── request_timer.js    request latency logger
│   │   └── workers/                background jobs
│   ├── uploads -> ../old_assets/legacy-uploads   (symlink — 73 pre-Payload images, served via /uploads/* for back-compat)
│   ├── redisClient.js
│   └── .env                      PAYLOAD_BASE_URL, PAYLOAD_AI_API_KEY,
│                                  GOOGLE_APPLICATION_CREDENTIALS
├── cms/                          Payload v3 + Next.js 15 + React 19 (port 4008)
│   ├── ecosystem.config.cjs      pm2 entry
│   ├── package.json              Payload + Postgres adapter + Lexical + Tailwind +
│   │                              @payloadcms/storage-gcs (media → GCS)
│   ├── next.config.mjs
│   ├── .env                      DATABASE_URI, PAYLOAD_SECRET,
│   │                              GCS_BUCKET=gda-essentialbali-media,
│   │                              GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN (Gmail API),
│   │                              GCP_VERTEX_*, GOOGLE_APPLICATION_CREDENTIALS
│   └── src/
│       ├── payload.config.ts     central config; reads shared/allowed-origins.json
│       │                          for cors[]/csrf[]
│       ├── access.ts             isStaffOrAgent helper
│       ├── seed.ts, seed-articles-placeholders.ts, create-elliot-user.ts
│       ├── collections/
│       │   ├── Users, Areas, Topics, Personas, Tags, Comments, Media (all hidden)
│       │   ├── Articles.ts         beforeChange hooks: SEO meta auto-fill (Vertex)
│       │   │                       + auto-promote on approve (no recursion)
│       │   ├── HeroAds.ts          admin.components.views.list = HeroGridView
│       │   │                       (8×8 visual grid is THE list view)
│       │   ├── Subscribers.ts      newsletter list
│       │   └── Newsletters.ts      compose + send (Gmail API)
│       ├── components/
│       │   ├── MatrixDashboard.tsx        8×8 grid as admin home
│       │   ├── ArticlesMatrixFilter.tsx   matrix above Articles list
│       │   ├── HeroGridView.tsx           the 8×8 hero-ad grid (replaces default list)
│       │   ├── NewslettersIntro.tsx       compose CTA + walkthrough
│       │   ├── TalkToElliotView.tsx       /admin/elliot — agent skill cards + chat
│       │   ├── ElliotNavLink.tsx          sidebar "AI agent → Talk to Elliot"
│       │   ├── RegenerateHeroButton.tsx   article edit page button (Imager re-roll)
│       │   ├── LoginHint.tsx              dev-only creds card
│       │   └── (other admin chrome)
│       ├── lib/
│       │   ├── seo-agent.ts              Vertex Gemini SEO helper (used by hook + endpoint)
│       │   ├── competitor-gap.ts         SEO gap-ranker (used by endpoint)
│       │   ├── imager-regenerate.ts      Vertex Imagen helper (used by hero button)
│       │   ├── gmail-api.ts              OAuth-refresh Gmail send helper
│       │   └── payload.ts                getPayload helper
│       ├── app/(payload)/admin/elliot/   /admin/elliot route (Talk to Elliot)
│       └── app/(frontend)/api/
│           ├── ai-chat/route.ts          Vertex Gemini Elliot chat
│           ├── advertise/route.ts        public Advertise modal target
│           ├── seo-optimize/route.ts     POST — used by Elliot dispatch + Articles hook
│           ├── seo-competitor-gap/route.ts  POST — ranks crawler gap-report
│           ├── regenerate-hero/route.ts  POST — used by RegenerateHeroButton
│           └── subscribers/broadcast/route.ts
├── frontend/                     Vite 7 + React 19 + Tailwind v4 (the public site)
│   ├── src/
│   │   ├── components/front/
│   │   │   ├── AreaMenuPanel.tsx
│   │   │   ├── AIChatPopup.tsx           Ask Elliot popup
│   │   │   ├── FloatingActions.tsx
│   │   │   └── AdvertiseModal.tsx        Advertise With Us form (POST /api/advertise)
│   │   ├── pages/Front/                  PathResolver + Templates/* — all public
│   │   ├── pages/OtherPage/              NotFound
│   │   ├── routes/FrontApp.tsx           browser router (public-only)
│   │   ├── router-config.tsx             route table — public-only
│   │   ├── main.tsx                      hydration entry
│   │   └── entry-server.tsx              SSR entry
│   └── .env.production           VITE_BASE_PATH=/, VITE_SITE_URL, VITE_IMAGE_URL
└── old_assets/
    ├── mysql-archive/            MySQL essentialbali dump from 2026-04-28
    └── legacy-uploads/           pre-Payload images (13 MB, served via backend symlink)
```

---

## URL routing (path-aware, identical for all 3 domains)

| Path | Backend |
|---|---|
| `/admin*` | Payload Next.js (`:4008`) |
| `/_next/*` | Payload (Next.js asset chunks) |
| `/api/(users\|areas\|topics\|articles\|personas\|media\|comments\|hero-ads\|subscribers\|payload-preferences\|access\|graphql\|graphql-playground\|ai-chat\|advertise\|seo-optimize\|seo-competitor-gap\|regenerate-hero)` | Payload |
| `/signin` `/signup` | **410 Gone** (legacy admin retired) |
| `/sitemap.xml` `/sitemap-areas.xml` `/sitemap-topics.xml` `/sitemap-articles.xml` `/robots.txt` | Payload Next.js |
| `/uploads/*` | Express (symlinked to old_assets/legacy-uploads/ for back-compat) |
| Everything else (`/`, `/canggu`, `/canggu/dine/...`) | Vite SSR via Express |

---

## Admin features

- **`/admin`** — Payload v3 admin
- **MatrixDashboard** as admin home — 8×8 article grid, click any cell to filter
- **Articles list** — matrix filter + status chips + per-cell counts (`n / 20` color-coded vs target)
  - SEO meta auto-fill on save (Vertex Gemini, in-process via `cms/src/lib/seo-agent.ts`)
  - Auto-promote on approve: setting status=`approved` → publishes (sets `publishedAt`, flips to `published`) in a single beforeChange hook
  - "🔁 Regenerate hero" button on the edit page (Vertex Imagen via `cms/src/lib/imager-regenerate.ts`)
- **Hero Ads → 8×8 visual grid** — `admin.components.views.list = HeroGridView` makes the grid THE list view (one click toggles `active`)
- **Newsletters** — compose + Save with status=Sending → BCC dispatch via Gmail API, history kept
- **Subscribers** — pure list
- **`/admin/elliot`** — Talk to Elliot full-page chat (sidebar: AI agent)
  - Live agent skill cards for all 7 entities (Elliot, Copywriter, SEO, Imager, Web Manager, Crawler, Scraper)
  - Per-skill 🟢 LIVE / 🟡 scaffolded pills — currently 39/39 LIVE
- **Hidden collections** (still functional via API): Users, Media, Personas, Comments, Tags, Areas, Topics

---

## Data layer (Postgres = source of truth)

| Collection | Count | Notes |
|---|---|---|
| areas | 8 | seeded fixed |
| topics | 8 | seeded fixed |
| personas | 4 | Maya, Komang, Putu, Sari |
| hero_ads | 64 | placeholder labels until `active=true` |
| articles | 64 (placeholders) | all `draft`, populated by Elliot |
| users | 2 | super_admin (admin) + elliot (ai-agent) |
| subscribers | 0+ | newsletter sign-ups |
| newsletters | 0+ | broadcast history |

Migrations under `cms/src/migrations/` — apply with `pnpm payload migrate`.

---

## AI agent integration (Elliot)

- Lives at `gda-ai01:/opt/.openclaw-ess` ([github.com/Gaia-Digital-Agency/openclaw-ess](https://github.com/Gaia-Digital-Agency/openclaw-ess))
- Mission Control: **https://ess.gaiada0.online**
- Authenticates as `elliot@gaiada.com` (role `ai-agent`) via JWT login at `/api/users/login`
- Has **CRUD** on Articles, Hero Ads, Subscribers, Newsletters
- Two ingestion paths:
  1. **Crawler** — research across 4 benchmark sites
  2. **xlsx** — operator drops `Essential Bali Proofread.xlsx` into `bridge/`-synced inbox
- All articles enter as `pending_review`. Human approves to `published`.

### How to fire Elliot for a new article

The orchestrator script lives on `gda-ai01` at
`/opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs`. It runs the
full chain (copywriter → SEO → Imager → Web Manager) and submits the result
to Payload as `pending_review` so you can review before publishing.

```bash
# JSON on stdin
ssh gda-ai01 'echo "{\"area\":\"ubud\",\"topic\":\"health-wellness\",\
\"persona\":\"komang\",\"brief\":\"five quiet yoga studios in Ubud worth the walk\",\
\"target_words\":600}" | node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs'

# or with --flags
ssh gda-ai01 'node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs \
  --area=canggu --topic=dine --persona=maya \
  --brief="three honest warungs in Canggu" --target_words=350'
```

Required input keys:

| key | required | what it does |
|---|---|---|
| `area` | ✓ | slug — `canggu` / `kuta` / `ubud` / `jimbaran` / `denpasar` / `kintamani` / `singaraja` / `nusa-penida` |
| `topic` | ✓ | slug — `events` / `news` / `featured` / `dine` / `health-wellness` / `nightlife` / `activities` / `people-culture` |
| `persona` | ✓ | `maya` (foodie) / `komang` (activities/wellness) / `putu` (cultural) / `sari` (nightlife/events) |
| `brief` | ✓ | one-sentence prose seed — Elliot translates this into a full article |
| `target_words` | optional | default 700 (News=300, Events=400) |
| `research_url` | optional | seed crawler benchmark URL — feeds research_block to Copywriter |
| `skip_imager` | optional | `true` to skip hero image generation (faster smoke tests) |

What you'll get:

```jsonc
{
  "status": "pending_review",
  "article_id": 67,
  "article_url": "https://essentialbali.gaiada.online/admin/collections/articles/67",
  "public_path": "/canggu/dine/canggus-best-lunchtime-warungs-worth-the-queue",
  "hash": "4b87ccebb5175d5f",
  "word_count": 285,
  "banned_phrases_found": [],
  "copywriter": { "title": "...", "persona": "maya", "words": 285 },
  "seo":        { "primary_keyword": "...", "meta_title": "..." },
  "imager":     { "hero_media_id": 2, "skipped": false }
}
```

Then open `/admin/collections/articles/{article_id}` to review.

### Hash lock — what happens on a re-run

`source.hash = sha256(area | topic | brief | research_url)` truncated to 16 chars.

| Existing article matching the hash | Re-dispatch behavior |
|---|---|
| `pending_review` / `approved` / `published` | **BLOCKED** — exits with `status: skipped_hash_locked`. Prevents accidental duplicates. |
| `rejected` | Allowed — produces a fresh draft. |
| Article was deleted | Allowed — produces a fresh draft (this is **Path B**). |

So the human review loop is:

```
Elliot dispatches → article in pending_review
      │
      ▼
You review at /admin/collections/articles/{id}
      │
      ├── ✅ status → approved   (web-manager promotes to published)
      ├── ✏ edit, save           (stays pending_review, hash-locked)
      └── 🗑 delete               (Path B — clears the hash, next dispatch creates fresh)
```

---

## Operations

```bash
# Status
pm2 list | grep essentialbali

# Live logs
pm2 logs essentialbali --lines 50           # Vite SSR + Express
pm2 logs essentialbali-cms --lines 50       # Payload Next.js

# After deploy (frontend or backend SSR change)
ssh gda-s01 'cd /var/www/essentialbali \
  && git pull \
  && cd frontend && pnpm install && pnpm build \
  && cd ../backend && pnpm install \
  && pm2 restart essentialbali'

# After deploy (cms — Payload / admin / API change)
ssh gda-s01 'cd /var/www/essentialbali/cms \
  && git pull \
  && pnpm install \
  && NODE_OPTIONS="--max-old-space-size=2560" pnpm build \
  && pm2 restart essentialbali-cms'

# Smoke
curl -sI https://essentialbali.gaiada.online/                            # 200
curl -sI https://essentialbali.com/                                      # 200
curl -sI https://www.essentialbali.com/                                  # 200
curl https://essentialbali.gaiada.online/sitemap-articles.xml            # full XML
```

---

## Credentials & access

| What | Where | Purpose |
|---|---|---|
| Payload super admin | seed default in `cms/seed.ts` | login at `/admin` |
| `elliot@gaiada.com` (ai-agent role) | password in `gda-ai01:/opt/.openclaw-ess/credentials/.env.payload` | JWT login at `/api/users/login` for the dispatch chain |
| Postgres password | `cms/.env` | DATABASE_URI |
| Gmail OAuth refresh token | `cms/.env` (`GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN`) | sends from `ai@gaiada.com` for /api/advertise + Newsletters |
| Vertex AI service account | `/var/www/gaiadaweb/secure/gda-viceroy-…json` | Gemini for /api/ai-chat, /api/seo-optimize, Imagen 3 |
| GCS bucket for media | `cms/.env` (`GCS_BUCKET=gda-essentialbali-media`) | Payload media adapter writes here |

---

## Stack alignment & decisions log

Single source of truth for "why is X this way" — append-only.

### Aligned (2026-04-29)

- **React 19** across both frontend and cms. Frontend bumped from 18 to 19 (peer deps were already permitting it; @types/react had been on 19 ahead of runtime).
- **Vite 7** across both frontend and backend SSR. Frontend bumped 6.1 → 7.3.
- **TypeScript 5.7** across all three workspaces.
- **CORS allowlist** in `shared/allowed-origins.json`, hot-reloaded with 30 s TTL by both Express and Payload.
- **SEO logic** single source: `cms/src/lib/seo-agent.ts`, called both in-process by the Articles beforeChange hook and over HTTP from the Elliot dispatch chain.
- **Imager regenerate logic** single source: `cms/src/lib/imager-regenerate.ts`, called by both the admin "🔁 Regenerate hero" button and (via a small adapter) by Elliot's orchestrator script.
- **Lexical → HTML serialization** for the legacy SSR `article_post` field via `backend/src/lib/lexical-to-html.js` (was emitting JSON-as-text into `dangerouslySetInnerHTML` pre-2026-04-29).

### Permanently dropped

- **pnpm workspace migration** (formerly old-audit item 4). Considered and rejected for this project. Reasons:
  1. Three live PM2 services (`essentialbali` ← `backend/`, `essentialbali-cms` ← `cms/`) have hard cwd assumptions; workspace hoisting changes node_modules layout and a botched migration would black out production.
  2. Payload v3 has known monorepo quirks — `payload generate:types` and `payload generate:importmap` already failed once on this stack and had to be patched by hand. Adding a workspace-resolution layer increases that surface.
  3. The headline benefit (shared `node_modules`) is mostly **already realized** by pnpm's content-addressed store, which hardlinks identical packages across projects on disk. The 906/507/759 MB sizes are the logical view, not real disk usage.
  4. Of 14 cross-workspace overlapping deps, all but one show legitimate version drift (different consumers want different versions). Forcing alignment would break the picky one.
  5. There's no shared component code between frontend and cms today. If that ever changes, revisit; until then it is overhead with no payoff.
- **Sequelize / MySQL stack** (cleanup-A through C, 2026-04-28 → 2026-04-29). The MySQL `essentialbali` database was dropped and the Sequelize-based migrations / seeders / models / services / corresponding helpers + middlewares were removed from the codebase. Postgres-via-Payload-REST is the only data path now.
- **Legacy custom admin** (cleanup-D, 2026-04-29). The tailadmin React shell + AuthPages + Master/* + Quill + mainAdmin entry chain (~10,000 LOC) was retired when /admin moved to Payload at port 4008.
- **Penthouse runtime critical-CSS** (2026-04-29). The /generate-css endpoint had zero callers; Vite already inlines critical CSS at build time.

### Open / deferred (no current pressure)

- **React Compiler** — would reduce manual memoisation. Defer until React 19 settles in production.
- **Payload v3 → v4 / next major** — wait for at least one minor after release.

---

## Branch model

**`main` only.** The `dev` branch was retired once Phase E cutover stabilized — Payload + Vite SSR rewire are both on main. New work commits direct to main (or a short-lived feature branch).

---

## Repos

| Repo | URL |
|---|---|
| essentialbali (this) | https://github.com/Gaia-Digital-Agency/essentialbali |
| openclaw-ess (Elliot) | https://github.com/Gaia-Digital-Agency/openclaw-ess |
