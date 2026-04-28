# Essential Bali

Bali, by area. Events, dine, wellness, nightlife, activities, news, culture, featured.

Live: **https://essentialbali.gaiada.online** · `essentialbali.com` cutover pending Damian's DNS finish (apex moved, `www` + AAAA cleanup remaining).

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

**Stack:** PostgreSQL · Python (Elliot's scraper) · Payload v3.84 · Vite · React 18 · TailwindCSS v4 · Node 20

**Hosting:** GCP `gda-s01.asia-southeast1-b` (`34.124.244.233`)

---

## File structure

```
essentialbali/
├── README.md                     ← you are here
├── backend/                      Express + Vite SSR (port 8082)
│   ├── app.js                    bootstrap, sitemap+robots, SSR wiring
│   ├── src/
│   │   ├── routers/              /api/* legacy routes (still used by SSR)
│   │   ├── services/             Sequelize-backed services (legacy)
│   │   ├── ssr/                  ★ Phase E rewire — reads from Payload
│   │   │   ├── articles.fetch.js     fetchArticleData / fetchArticlesData
│   │   │   ├── locations.fetch.js    areas → legacy "country" shape
│   │   │   ├── categories.fetch.js   topics → legacy "category" shape
│   │   │   └── route.fetch.js        URL → article|area|topic resolver
│   │   ├── lib/payload.client.js     thin HTTP client (USE_PAYLOAD_DATA=true)
│   │   └── workers/                  background jobs
│   └── .env                      DATABASE_*, FRONTEND_URL, USE_PAYLOAD_DATA=true,
│                                  PAYLOAD_BASE_URL=http://127.0.0.1:4008
├── cms/                          Payload v3 + Next.js 15 (port 4008)
│   ├── ecosystem.config.cjs      pm2 entry
│   ├── package.json              Payload + Postgres adapter + Lexical + Tailwind
│   ├── postcss.config.mjs
│   ├── next.config.mjs
│   ├── .env                      DATABASE_URI, PAYLOAD_SECRET, SMTP_* (Gmail),
│   │                              GCP_VERTEX_*, GOOGLE_APPLICATION_CREDENTIALS
│   └── src/
│       ├── payload.config.ts     central config (collections, email, admin views)
│       ├── access.ts             isStaffOrAgent helper for CRUD policies
│       ├── seed.ts               idempotent: 8 areas, 8 topics, 4 personas, 64 hero_ads, admin
│       ├── seed-articles-placeholders.ts  64 article placeholders (1 per cell, draft)
│       ├── create-elliot-user.ts          create the ai-agent service account
│       ├── admin-update.ts                rotate super_admin user
│       ├── collections/
│       │   ├── Users.ts          auth + API key support
│       │   ├── Areas.ts          8 fixed (hidden in admin nav)
│       │   ├── Topics.ts         8 fixed (hidden)
│       │   ├── Personas.ts       4 writer voices (hidden)
│       │   ├── Articles.ts       ★ matrix filter UI + status chips
│       │   ├── Media.ts          local upload + 3 sizes (hidden)
│       │   ├── Comments.ts       (hidden)
│       │   ├── Tags.ts           (hidden)
│       │   ├── HeroAds.ts        64 fixed slots, beforeChange auto-label
│       │   ├── Subscribers.ts    pure list
│       │   └── Newsletters.ts    compose + send workflow (beforeChange dispatch)
│       ├── components/
│       │   ├── LoginHint.tsx                  creds card on /admin/login
│       │   ├── MatrixDashboard.tsx            8×8 grid as admin home
│       │   ├── ArticlesMatrixFilter.tsx       8×8 grid + status chips above Articles list
│       │   ├── NewslettersIntro.tsx           stats + compose CTA + how-to walkthrough
│       │   ├── TalkToElliotView.tsx           full-page chat panel (uses /api/ai-chat)
│       │   └── ElliotNavLink.tsx              sidebar entry under "Channels"
│       ├── app/
│       │   ├── globals.css       Tailwind + Essential Bali brand tokens
│       │   ├── icon.png          /admin tab favicon (Next.js convention)
│       │   ├── (frontend)/api/
│       │   │   ├── ai-chat/route.ts          Vertex Gemini, Elliot persona, Redis rate limit
│       │   │   └── subscribers/broadcast/route.ts   one-shot bulk email (legacy)
│       │   └── (payload)/        Payload admin + REST + GraphQL routes
│       └── migrations/           Postgres migrations (Drizzle)
├── frontend/                     Vite + React 18 + Tailwind v4 (legacy, served by Express)
│   ├── src/
│   │   ├── components/front/
│   │   │   ├── AreaMenuPanel.tsx              one-line area nav
│   │   │   ├── AIChatPopup.tsx                Ask Elliot popup (calls /api/ai-chat)
│   │   │   └── FloatingActions.tsx            Back to Top + Ask Elliot launcher
│   │   ├── pages/Front/Templates/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx                     "Advertise With Us" mailto button
│   │   ├── layout/FrontLayout.tsx             mounts FloatingActions
│   │   └── routes/                            React Router config
│   └── .env.production           VITE_BASE_PATH=/, VITE_SITE_URL, VITE_IMAGE_URL
└── old_assets/                   archived legacy uploads (132 files + manifest.tsv)
```

---

## URL routing (single domain `essentialbali.gaiada.online`)

| Path | Backend |
|---|---|
| `/admin*` | Payload Next.js (`:4008`) |
| `/_next/*` | Payload (Next.js asset chunks) |
| `/api/users` `/api/areas` `/api/topics` `/api/articles` `/api/personas` `/api/media` `/api/comments` `/api/hero-ads` `/api/subscribers` `/api/newsletters` `/api/payload-preferences` `/api/access` `/api/graphql*` `/api/ai-chat` `/api/_internal*` | Payload |
| `/signin` `/signup` | **410 Gone** (legacy admin retired) |
| `/sitemap.xml` `/robots.txt` | Express SSR (Payload-backed via fetchers) |
| Everything else (`/`, `/canggu`, `/canggu/dine/...`) | Vite SSR via Express |

---

## Admin features

- **`/admin`** — Payload v3 admin (login: `super_admin@email.com` / `Teameditor@123`)
- **`/admin/elliot`** — Talk to Elliot full-page chat (sidebar: Channels)
- **MatrixDashboard** as admin home — 8×8 article grid, ad activate dots
- **Articles list** — matrix filter + status chips + per-cell counts (`n / 20` color-coded vs target)
- **Newsletters** — compose + Save with status=Sending → BCC dispatch via Gmail SMTP, history kept
- **Subscribers** — pure list
- **Hero Ads** — 64 slots, toggle `active` + assign creative
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
pm2 logs essentialbali --lines 50           # legacy Vite SSR + Express
pm2 logs essentialbali-cms --lines 50       # Payload Next.js

# After deploy (legacy)
ssh gda-s01 'cd /var/www/essentialbali \
  && git pull \
  && cd backend && npm install --omit=dev \
  && cd ../frontend && npm install && npm run build:ssr \
  && pm2 restart essentialbali'

# After deploy (cms)
ssh gda-s01 'cd /var/www/essentialbali/cms \
  && git pull \
  && pnpm install \
  && pnpm payload migrate \
  && pnpm build \
  && pm2 restart essentialbali-cms'

# SEO endpoints
curl https://essentialbali.gaiada.online/robots.txt
curl https://essentialbali.gaiada.online/sitemap.xml | grep -c "<loc>"
```

---

## Credentials & access

| What | Where | Purpose |
|---|---|---|
| `super_admin@email.com` / `Teameditor@123` | seed default | Payload admin login |
| `elliot@gaiada.com` / (in `gda-ai01:/opt/.openclaw-ess/credentials/.env.payload`) | seed via `create-elliot-user.ts` | AI agent JWT login |
| Postgres password | `cms/.env` | DATABASE_URI |
| Gmail SMTP | `cms/.env` | `ai@gaiada.com` app password (mirrored from /var/www/templategen) |
| Vertex AI service account | `/var/www/gaiadaweb/secure/gda-viceroy-...json` | Gemini for `/api/ai-chat` |

---

## Branch model

**`main` only.** The `dev` branch was retired once Phase E cutover stabilized — Payload + Vite SSR rewire are both on main. New work commits direct to main (or a short-lived feature branch).

---

## Repos

| Repo | URL |
|---|---|
| essentialbali (this) | https://github.com/Gaia-Digital-Agency/essentialbali |
| openclaw-ess (Elliot) | https://github.com/Gaia-Digital-Agency/openclaw-ess |
