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
                  │  nginx @ gda-ce01 (:443)           │
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

**Hosting:** GCP `gda-ce01.asia-southeast1-b` (`34.158.47.112`)

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
| `/api/(users\|areas\|topics\|articles\|personas\|media\|comments\|hero-ads\|hero-ad-versions\|newsletters\|home-daily-feed\|globals\|subscribers\|payload-preferences\|access\|graphql\|graphql-playground\|ai-chat\|advertise\|seo-optimize\|seo-competitor-gap\|regenerate-hero)` | Payload |
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
  - **`eventDetails` group** (added 2026-04-30) — `startDate / endDate / startTime / endTime / timeOfDay / venueName / venueAddress / venueLat / venueLng / ticketUrl / recurrence`. Used by EventsV3 + SingleEventV2 templates when `topic = events`. `timeOfDay` auto-derives from `startTime` hour via beforeChange hook (1-12 morning, 12-18 afternoon, 18-24 night). Replaces the legacy MySQL `meta_data` JSON blob retired in cleanup-C.
- **Hero Ads — 73-slot visual grid** (briefly relabelled "Hero Image" 2026-04-29 → reverted 2026-04-30; collection slug stays `hero-ads`)
  - Three slot kinds rendered as three rows in `HeroGridView`:
    - **Row 0** — 1 homepage default banner (NULL area, NULL topic), full-width tile at the top
    - **Row 0.5** — 8 area-only tiles (one per area, NULL topic). Used by `/{area}` pages. Generated 2026-04-30 via Imager with area-anchored prompts.
    - **Rows 1-8** — 8 areas × N topics-with-`showsHero=true` cells (default 8 = 64 cells)
    - **73 total slots** when all topics have `showsHero=true`
  - Cell content: image, headline, subline, optional CTA button (text + url, only shown when `ctaActive=true`), optional `client` (empty = editorial, populated = paid placement), schedule (`startAt / endAt`)
  - Partial unique index on `COALESCE(area_id,0), COALESCE(topic_id,0)` enforces single (NULL,NULL) homepage row + uniqueness per cell
  - **"Push to all cell heroes" button** on the homepage hero edit page — copies image / headline / subline / link / CTA to every cell hero where `topic.showsHero=true`, activates them. Useful for site-wide campaigns.
  - **History panel** on every hero ad edit page (new 2026-04-30) — collapsible audit timeline showing every snapshot of this slot from the `hero-ad-versions` collection. Displays event badge (create/update/delete), timestamp, user, and key field pills.
  - **Generate area-only hero** endpoint: `POST /api/hero-ads/generate-area-hero {areaSlug}` runs Vertex Imagen with an area-anchored prompt, uploads the PNG, upserts the `(area, NULL)` slot.
- **Subscriber Communication** (renamed from "Newsletters" 2026-04-29 — collection slug stays `newsletters`)
  - Compose + save with status="Ready to send" → BCC dispatch via SMTP (`SMTP_*` env vars). beforeChange hook flips status `draft → sending → sent | failed` and stamps `recipientCount`, `sentAt`, `lastError`.
  - **Quick-filter chips** (added 2026-04-30) above the list — `All / Drafts / In flight / Sent / Failed`, each chip is a one-click `?where[status][equals]=...` link with live counts inlined. Empty buckets fade out.
- **Subscribers** — list of email signups. Public signup goes via `POST /api/subscribers/subscribe` (idempotent, reactivates `unsubscribed`/`bounced`).
- **Newsletter Notice** (Global, new 2026-04-30) — admin sidebar group "Site sections"
  - Edits the on-page subscribe-form copy that appears at the bottom of every public page (homepage, all listing pages, every article)
  - Fields: `active` (kill-switch), `headline`, `subline`, `placeholder`, `buttonText`, `successMessage`, `alreadySubscribedMessage`, `errorMessage`, optional `backgroundImage`
  - Distinct from Subscriber Communication (which sends actual broadcast emails) — this is just the form's display copy
- **Home Daily Feed** (collection, new 2026-04-30) — admin sidebar group "System"
  - Read-only in practice. Written by `cms/scripts/pick-daily-feed.mjs` cron at 04:00 GMT+8 (= 20:00 UTC).
  - One row per Bali date with up to 16 slots (2 articles per topic × 8 topics). Each slot = `{slotIndex, topic, article}`.
  - Sort key: `(home_featured_count ASC NULLS FIRST, home_last_featured_at ASC NULLS FIRST, random())`. Bumps counters on selected articles after writing.
  - Cycle math at full population (1280 published): 80 days before any article repeats.
- **Areas + Topics** (admin sidebar group "Taxonomy" — surfaced 2026-04-29; previously hidden)
  - Editable `name / slug / intro / hero / lat / lng` for areas, `name / slug / icon / intro / showsHero` for topics
  - `topics.showsHero` (default `true`) — when `false`, the admin Hero Ads grid hides that topic's column AND the "Push to all" button skips it. Use for topics whose listing template handles its own header instead of a generic hero (today: nobody — Events used to be `false`, flipped back to `true` 2026-04-30 because the column should remain visible even though `EventsV3.tsx` doesn't render heroes on the public side).
- **Bulk actions** on Articles list (added 2026-04-30) — toolbar above the table with 5 verbs: Approve, Publish, Unpublish, Reject, Delete. Tick rows, click action, inline two-step confirm. POST `/api/articles/bulk` (admin/editor). Reject is mark-only — no automatic Elliot redispatch (human decides next step). Cap 500 ids/request. Same endpoint pattern exists for hero-ads at `/api/hero-ads/bulk` (no UI hookup since the grid view replaces the standard list).
- **Browse Imager Gallery** (added 2026-04-30) — "🖼 Browse Imager Gallery" button on every article edit page opens a modal showing only `source=imager, kind=hero` media (filtered, area+topic-tagged tiles). Click any tile → assigns it as that article's hero in one PATCH. Avoids paging through the unfiltered media library to find the right Imager-generated image.
- **`/admin/elliot`** — Talk to Elliot full-page chat (sidebar: AI agent)
  - Live agent skill cards for all 7 entities (Elliot, Copywriter, SEO, Imager, Web Manager, Crawler, Scraper)
  - Per-skill LIVE / scaffolded pills — currently 39/39 LIVE
- **Hidden collections** (still functional via API): Users, Media, Personas, Comments, Tags

---

## Data layer (Postgres = source of truth)

| Collection | Count | Notes |
|---|---|---|
| areas | 8 | seeded fixed; editable in admin under Taxonomy |
| topics | 8 | seeded fixed; `+showsHero` flag (default true) |
| personas | 4 | Maya, Komang, Putu, Sari |
| hero_ads | **73** | 1 homepage default (`area=NULL, topic=NULL`) + 8 area-only (`area=X, topic=NULL`) + 8 areas × 8 topics. Placeholder until `active=true`. The 8 area-only slots were added 2026-04-30 with Imager-generated covers, one per area. |
| articles | 63+ | seed places 1 placeholder draft per cell; +`eventDetails` group (date / time / venue) for events; +`homeFeaturedCount`, `homeLastFeaturedAt` (hidden, written by daily picker) |
| users | 2 | super_admin (admin) + elliot (ai-agent) |
| subscribers | 0+ | newsletter sign-ups |
| newsletters | 0+ | broadcast history |
| **home_daily_feed** | 0+ | one row per Bali date, written by `pick-daily-feed.mjs` cron (04:00 GMT+8) — 16 article slots / day |
| **hero_ad_versions** | 0+ | append-only audit log of every hero_ads change (create/update/delete + snapshot of all key fields + who + when). New 2026-04-30. |

**Globals**

| Global | Notes |
|---|---|
| **newsletter-notice** | edits the on-page subscribe-form copy (headline, subline, button, success/error messages, optional bg image, kill-switch) |

Schema is managed by `db.push: true` (Drizzle auto-syncs from collection configs on CMS boot). The `cms/src/migrations/` directory has older migration files retained for reference but is not actively applied.

For one-off ops migrations that Drizzle can't express (partial unique indexes, etc.), see `cms/scripts/`:
  - `migrate-hero-65.mjs` — drops the old `area_topic_idx`, adds the partial unique on `COALESCE(area_id,0), COALESCE(topic_id,0)`, seeds the homepage default hero row
  - `pick-daily-feed.mjs` — daily picker (cron entry in `cms/ecosystem.config.cjs`)
  - `compose-test-newsletter.mjs` — drafts a Test newsletter via Vertex Gemini from the latest published articles

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
- **Semantic gate (added 2026-04-30)** — the `review-gate` skill calls a new
  `content-area-check` skill that asks Vertex Gemini to predict the
  `(area, topic)` from the body and HARD-FAILS if the prediction does not
  match the declared `(area, topic)`. Closes the "no bleed" rule end-to-end:
  even if the LLM drifts off-topic, Web Manager won't submit it.

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

## Public site layout (post-redesign 2026-04-29 → 2026-04-30)

### Header / nav (every page)
- Logo always links to `/` (universal back-to-home anchor; was previously "stay-in-area" — fixed 2026-04-30)
- **Area dropdown** — when an area is selected (label !== "All Area"), the trigger renders in brand red text + semibold + tinted red pill background + a leading map-pin icon
- **Topic nav** — the topic matching the current URL renders red + semibold + 2px red bottom border
- **Topic-preserving area picker** — picking "Ubud" while on `/canggu/dine` navigates to `/ubud/dine`, not `/ubud`

### Homepage `/`
1. Header + topic nav (above)
2. **`<HeroBanner />`** — single full-width hero, sourced from `hero_ads` (NULL, NULL) homepage default slot. Optional editorial headline + subline + CTA button.
4. **`<DailyEssentials />`** — daily-rotated 4×4 grid (16 articles, 2 per topic, from 2 different areas where possible). Reads today's `home_daily_feed` row. Shrinks-and-centres if sparse (16 → 4×4, 12 → 4×3, 8 → 4×2, 4 → 2×2, 0 → "No daily picks yet" panel).
5. **`<Newsletter />`** (sign-up form) — copy from `newsletter-notice` Global. POST to `/api/subscribers/subscribe`.
6. Footer

### Area page `/{area}` (e.g. `/canggu`)
- Header shows the area name in red with map-pin icon
- **`<HeroBanner area="canggu" />`** — strict-area lookup: `(canggu, NULL)` area-only hero first, then any `(canggu, *)` cell hero. Never crosses area boundary; never falls back to the homepage default.

### Area × Topic listing `/{area}/{topic}` (e.g. `/canggu/dine`)
1. Header + topic nav (active topic underlined red)
2. **`<HeroBanner area={...} topic={...} />`** — strict (area, topic) cell hero, then (area, NULL) area-only, then any same-area hero. Never crosses area boundary (fixed 2026-04-30 — previously fell back to homepage default which surfaced a wrong-area CTA).
3. Page title + optional subcategory + tag rows
4. Article grid — `lg:grid-cols-3 md:grid-cols-2`, `LISTING_PAGE_SIZE = 20` per page (single source of truth: `frontend/src/lib/constants.ts`, mirrored in `backend/src/ssr/content.fetch.js`)
5. Pagination
6. Newsletter
7. Footer

### Events listings `/events` and `/{area}/events` use a separate template
- **`EventsV3.tsx`** — does NOT render `<HeroBanner>` (events have their own structured header)
- Cards show: time-of-day badge over image, category chip, start date, time range, recurrence pill ("Every week" / "Every month" / "Annual"), venue with map pin, "Get tickets" button when `eventDetails.ticketUrl` is set
- Filter UI: date-range picker + morning/afternoon/night chips. Translates to `where[eventDetails.*]` Payload filters via the `metaData_*` legacy query keys (back-compat).

### Single article `/{area}/{topic}/{slug}` uses `SingleV2.tsx`
- Breadcrumb (Home / Area / Topic) renders ABOVE the hero image (not absolute-overlaid — fixed 2026-04-30, was bleeding onto dark hero photos)

---

## Operations

```bash
# Status
pm2 list | grep essentialbali

# Live logs
pm2 logs essentialbali --lines 50           # Vite SSR + Express
pm2 logs essentialbali-cms --lines 50       # Payload Next.js

# After deploy (frontend or backend SSR change)
ssh gda-ce01 'cd /var/www/essentialbali \
  && git pull \
  && cd frontend && pnpm install && pnpm build \
  && cd ../backend && pnpm install \
  && pm2 restart essentialbali'

# After deploy (cms — Payload / admin / API change)
ssh gda-ce01 'cd /var/www/essentialbali/cms \
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
