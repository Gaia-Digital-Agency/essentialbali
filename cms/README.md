# Essential Bali — CMS

Payload v3.84 + Next.js 15 + React 19 + TypeScript 5.7. Runs on `:4008`. Hosts `/admin`, the REST API at `/api/*`, and a small set of public-facing route handlers.

Database: PostgreSQL (`essentialbali_db`). Media: GCS bucket `gda-essentialbali-media`. Email: Gmail OAuth from `ai@gaiada.com`.

Live admin: `https://essentialbali.com/admin` (and `https://essentialbali.gaiada.online/admin`).

---

## Capability surface (UAT-verified 2026-04-29 → 2026-04-30)

Detailed test evidence in `../docs/full_test.md`. Subsequent batches A→C added the homepage redesign (HeroBanner / DailyEssentials / NewsletterNotice / picker cron / eventDetails group / content-area-check semantic gate / push-to-all). State below reflects the current admin.

### Admin

| Feature | Path | Status | Notes |
|---|---|---|---|
| Login | `/admin/login` | working | seeded `super_admin@email.com` / `Teameditor@123` |
| Content Matrix dashboard | `/admin` | working | 8 areas × 8 topics; per-cell status counts (`Np · Nr · Nd`) and green/grey hero-ad dot |
| Articles list + filter | `/admin/collections/articles` | working | Status workflow `draft → pending_review → approved → published` (auto-promote on approve hook); also `rejected` (releases hash-lock) and delete (releases hash-lock — Path B) |
| **`eventDetails` group on Articles** | `/admin/collections/articles/{id}` | working | Date / time / venue / ticket URL / recurrence. `timeOfDay` auto-derived from `startTime` hour (1-12 morning / 12-18 afternoon / 18-24 night). Used by EventsV3 + SingleEventV2 templates when `topic = events`. |
| SEO meta auto-fill | hook on Articles `beforeChange` | working | Uses Vertex Gemini via `src/lib/seo-agent.ts` |
| Imager regenerate | "🔁 Regenerate hero" on edit page | working | Uses Vertex Imagen via `src/lib/imager-regenerate.ts` |
| **Hero Images — 9-row visual grid** | `/admin/collections/hero-ads` | working | Sidebar label was renamed from "Hero Ads" 2026-04-29; collection slug stays `hero-ads`. 1 homepage default + 8 areas × N topics where `showsHero=true` (default 8 = 65 visible slots). |
| **"Push to all cell heroes"** | edit page of homepage hero (id=65) | working | New 2026-04-29. Copies image / headline / subline / link / CTA from the homepage hero to every cell hero where `topic.showsHero=true`, activates them. Inline two-step confirm. POST `/api/hero-ads/push-to-all` (admin/editor only). |
| Subscribers list | `/admin/collections/subscribers` | working | Searchable; public sign-ups land via `/api/subscribers/subscribe` |
| **Subscriber Communication** | `/admin/collections/newsletters` | working compose; SMTP requires App Password rotation (see Open issues) | Sidebar label renamed from "Newsletters" 2026-04-29; collection slug stays `newsletters`. Lifecycle hook on `beforeChange` does `draft → sending → {sent, failed}` and stamps `sentAt` + `recipientCount` + `lastError`. |
| **Newsletter Notice** (Global) | `/admin/globals/newsletter-notice` | working | New 2026-04-29. Edits the on-page subscribe-form copy shown at the bottom of every public page. Fields: `active` (kill-switch), `headline`, `subline`, `placeholder`, `buttonText`, `successMessage`, `alreadySubscribedMessage`, `errorMessage`, optional `backgroundImage`. |
| **Areas + Topics** | `/admin/collections/areas`, `/admin/collections/topics` | working | Surfaced 2026-04-29 under Taxonomy sidebar group. Editable name/slug/intro/hero. Topics also have `showsHero` flag (default `true`). |
| **Home Daily Feed** | `/admin/collections/home-daily-feed` | read-only in practice | New 2026-04-29. Written by `cms/scripts/pick-daily-feed.mjs` cron at 04:00 GMT+8 (= 20:00 UTC). One row per Bali date; 16 article slots / day (2 per topic × 8 topics, distinct areas where possible). |
| Talk to Elliot | `/admin/elliot` | working | Full-page agent skill cards. **39/39 skills LIVE** across orchestrator + 6 sub-agents (Copywriter, SEO, Imager, Web Manager, Crawler, Scraper). Includes a **MediaUploadDock** + **ImagerGallery** for media work. |

### Public REST handlers (route handlers, not Payload auto-routes)

| Path | Method | What it does |
|---|---|---|
| `/api/subscribers/subscribe` | POST | **Public** subscribe-from-homepage. Validates email, upserts via Payload local API, idempotent, reactivates `unsubscribed`/`bounced` rows. |
| `/api/subscribers/broadcast` | POST | Admin-only one-off broadcast via Payload's email transport. Redis 5-minute cooldown lock. |
| `/api/advertise` | POST | Public Advertise-with-us modal target. Sends via Gmail OAuth from `ai@gaiada.com`. |
| `/api/ai-chat` | POST | Public Ask-Elliot popup. Vertex Gemini, scope-grounded to Essential Bali. |
| `/api/seo-optimize` | POST | Used by Elliot dispatch chain + Articles `beforeChange` hook. Vertex Gemini. |
| `/api/seo-competitor-gap` | POST | Ranks crawler `gap-report` output. |
| `/api/regenerate-hero` | POST | Used by the admin "🔁 Regenerate hero" button. Vertex Imagen. |
| **`/api/hero-ads/push-to-all`** | POST | Admin/editor only. Reads the homepage hero (NULL,NULL), copies image / headline / subline / link / CTA to every cell hero where `topic.showsHero=true`, sets `active=true`. Returns `{ok, sourceHomeHeroId, heroableTopics, cellRowsConsidered, updatedCount, failedCount, activated, errors[]}`. |
| `/api/media` | POST | Payload auto-route. Auto-converts JPEG → WebP, applies canonical filename, generates 480×270 thumbnail + 768×432 card variants, writes to GCS. |

### nginx allowlist for `/api/*`

Production nginx only proxies a fixed list of API paths to Payload — anything else falls through to the SSR backend on `:8082`. **If you add a new collection here, also add it to the regex.**

Current allowlist (in `/etc/nginx/sites-available/essentialbali.com`):

```
location ~ ^/api/(users|areas|topics|articles|personas|media|comments|hero-ads|newsletters|home-daily-feed|globals|subscribers|payload-preferences|access|graphql|graphql-playground|ai-chat|advertise|seo-optimize|seo-competitor-gap|regenerate-hero)(/|$)
```

This trap has caught us multiple times — `subscribers` (sub-route 404), `newsletters` (Save broken in admin), `home-daily-feed` and `globals` (404 from new endpoints in the homepage redesign). Each addition to the regex needed `sudo nginx -s reload`. Backups left at `.bak.uat-<ts>` files.

---

## Local development

```bash
pnpm install
pnpm dev                  # Next.js + Payload on :4008 (PAYLOAD_DISABLE_ADMIN=false)
pnpm seed                 # one-time: creates 8 areas, 8 topics, 4 personas
```

Required `.env`:

| key | for |
|---|---|
| `DATABASE_URI` | Postgres |
| `PAYLOAD_SECRET` | session signing |
| `GCS_BUCKET=gda-essentialbali-media` | media adapter target |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCS + Vertex service account JSON |
| `GCP_VERTEX_PROJECT_ID`, `GCP_VERTEX_LOCATION` | Gemini + Imagen |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Gmail OAuth (advertise + newsletters) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_ADDRESS` | Newsletter dispatch — needs valid Gmail App Password |
| `REDIS_URL` | broadcast cooldown lock (defaults to `redis://127.0.0.1:6379`) |

> **2026-04-29 cred status:** SMTP_PASS is rejected by Gmail (`535 5.7.8 BadCredentials`). Generate a new App Password for `ai@gaiada.com` and rotate before relying on newsletter dispatch.

---

## Production build + deploy

```bash
ssh gda-s01 'cd /var/www/essentialbali/cms \
  && git pull \
  && pnpm install \
  && NODE_OPTIONS="--max-old-space-size=2560" pnpm build \
  && pm2 restart essentialbali-cms'
```

The `--max-old-space-size=2560` is needed for Payload's `generate:importmap` step on this VM.

---

## Authentication notes for external REST clients

The admin UI uses Payload's session cookies via Next/Payload's built-in flow — that all works. **Scripted REST clients** (curl, server-side, CI) have two equally valid paths.

### Path A — JWT header (recommended for scripts)

```bash
JWT=$(curl -sk -c jar -X POST https://essentialbali.com/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"super_admin@email.com","password":"…"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')

curl -sk -H "Authorization: JWT $JWT" \
  -H 'Content-Type: application/json' \
  -X POST https://essentialbali.com/api/newsletters \
  -d '{"subject":"…","body":{"root":{"type":"root","children":[…]}},"status":"draft"}'
```

### Path B — Cookie + Origin (CSRF-friendly)

If you want to use the `payload-token` cookie issued by `/api/users/login`, you MUST also send an `Origin` header that matches one of the entries in `csrf` (which is `cors[]` filtered to `https://essentialbali*` in `payload.config.ts`). Without `Origin`, Payload's CSRF check silently rejects the cookie.

```bash
# login + jar
curl -sk -c jar.txt -X POST https://essentialbali.com/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"…","password":"…"}'

# subsequent calls — Origin is required
curl -sk -b jar.txt -H 'Origin: https://essentialbali.com' \
  https://essentialbali.com/api/users/me
# returns {user: {...}}

# without Origin — silently ignored
curl -sk -b jar.txt https://essentialbali.com/api/users/me
# returns {user: null}
```

Surfaced during the 2026-04-29 UAT and re-confirmed 2026-04-30 — the cookie auth path is correct but undocumented. The `Origin` requirement is a deliberate CSRF protection, not a bug.

## Adding a new admin client component

Payload v3 keeps an `importMap.js` at `src/app/(payload)/admin/importMap.js` that lists every client component referenced by the admin config. The official regenerate command is:

```bash
pnpm payload generate:importmap
```

**This currently fails** in this repo with `Error: This module cannot be imported from a Client Component module` because tsx loads `next/server-only` while resolving the Payload CLI. Until that's fixed, **add new client component entries to `importMap.js` by hand** — copy the pattern from existing entries:

```js
import { default as default_NewComponent } from '@/components/NewComponent'
// ...
export const importMap = {
  // ...
  "@/components/NewComponent#default": default_NewComponent,
}
```

`next build` does include the imported entries in the admin bundle once they're in the file.

---

## Internal layout

```
cms/
├── ecosystem.config.cjs              pm2 entry — `essentialbali-cms` + `essentialbali-daily-feed` (cron 0 20 * * * UTC)
├── next.config.mjs
├── .env                              see "Local development" table
├── scripts/                          one-off + cron scripts
│   ├── migrate-hero-65.mjs              partial unique index + seed homepage default hero (2026-04-29)
│   ├── pick-daily-feed.mjs              daily picker — writes 16-slot home_daily_feed row (cron 04:00 GMT+8)
│   └── compose-test-newsletter.mjs      Vertex Gemini draft newsletter from latest published articles (Test prefix)
└── src/
    ├── payload.config.ts             central config; reads ../shared/allowed-origins.json for cors[]/csrf[]; registers globals[] = [NewsletterNotice]
    ├── access.ts                     isStaffOrAgent helper
    ├── seed.ts, seed-articles-placeholders.ts, create-elliot-user.ts
    ├── collections/
    │   ├── Articles.ts               beforeChange hooks: SEO meta auto-fill + auto-promote on approve + eventDetails group with timeOfDay auto-derive
    │   ├── HeroAds.ts                admin.components.views.list = HeroGridView; admin.components.edit.beforeDocumentControls = PushHomeHeroButton
    │   ├── Subscribers.ts            list (create requires isStaffOrAgent — public sign-up goes via /api/subscribers/subscribe)
    │   ├── Newsletters.ts            "Subscriber Communication" — compose + dispatch via beforeChange hook
    │   ├── HomeDailyFeed.ts          read-only in practice; written by pick-daily-feed.mjs cron
    │   ├── Media.ts                  GCS storage adapter, JPEG→WebP, canonical naming
    │   ├── Areas.ts, Topics.ts       Taxonomy (surfaced 2026-04-29). Topics have +showsHero flag.
    │   └── Users, Personas, Tags, Comments    (hidden in UI, REST-functional)
    ├── globals/
    │   └── NewsletterNotice.ts       on-page subscribe-form copy + kill-switch
    ├── components/
    │   ├── MatrixDashboard.tsx       8×8 article-count grid as admin home
    │   ├── ArticlesMatrixFilter.tsx  matrix above Articles list
    │   ├── HeroGridView.tsx          9-row hero grid (1 homepage default + 8×8 cells); skips topics with showsHero=false
    │   ├── PushHomeHeroButton.tsx    "Push to all cell heroes" — homepage hero edit page
    │   ├── NewslettersIntro.tsx      compose walkthrough panel
    │   ├── TalkToElliotView.tsx      /admin/elliot — agent skill cards + chat
    │   ├── MediaUploadDock.tsx       drag-and-drop upload on the Elliot page
    │   ├── ImagerGallery.tsx         24 most recent AI-generated media tiles
    │   ├── RegenerateHeroButton.tsx  article edit page button
    │   ├── ElliotNavLink.tsx         sidebar "AI agent → Talk to Elliot"
    │   └── LoginHint.tsx             dev-only creds card
    ├── lib/
    │   ├── seo-agent.ts              Vertex Gemini SEO helper (used by hook + endpoint)
    │   ├── competitor-gap.ts         SEO gap-ranker (used by /api/seo-competitor-gap)
    │   ├── imager-regenerate.ts      Vertex Imagen helper (used by /api/regenerate-hero + Elliot)
    │   ├── gmail-api.ts              OAuth-refresh Gmail send helper
    │   ├── media-naming.ts           canonical filename derivation
    │   └── payload.ts                getPayload helper
    ├── app/(payload)/admin/
    │   ├── elliot/                   /admin/elliot route (Talk to Elliot)
    │   └── importMap.js              client-component manifest (hand-edit when CLI workaround needed — see "Adding a new admin client component")
    └── app/(frontend)/api/
        ├── ai-chat/route.ts                      Vertex Gemini Elliot chat
        ├── advertise/route.ts                    public Advertise modal target
        ├── seo-optimize/route.ts                 POST — used by Elliot dispatch + Articles hook
        ├── seo-competitor-gap/route.ts           POST — ranks crawler gap-report
        ├── regenerate-hero/route.ts              POST — used by RegenerateHeroButton
        ├── hero-ads/
        │   └── push-to-all/route.ts              POST — admin/editor only; site-wide hero campaign
        └── subscribers/
            ├── subscribe/route.ts                **public** sign-up (added 2026-04-29 UAT)
            └── broadcast/route.ts                admin-only broadcast
```

---

## Elliot agent surface (the seven entities at `/admin/elliot`)

39 skills total, all marked LIVE in the admin UI as of UAT 2026-04-29.

| Agent | Skills |
|---|---|
| **Elliot** (orchestrator) | 5 — `plan-wave`, `dispatch-article`, `review-gate`, `status-report`, `maintenance-pass` |
| **Copywriter** | 4 |
| **SEO** | 5 |
| **Imager** | 4 |
| **Web Manager** | 7 |
| **Crawler** | 4 — `discover`, `analyze`, `trend-scan`, `gap-report`. Hard-coded universe of 4 benchmark sites; honours robots.txt; 1 req/sec global rate limit. See `../docs/full_test.md` Appendix A for the full mermaid diagram. |
| **Scraper** | 10 — Drive xlsx + Google Doc ingest. Drive auth verified during UAT; full ingest runs on a fresh xlsx in the inbox. |

Code lives at `gda-ai01:/opt/.openclaw-ess` — see the root `../README.md` "AI agent integration (Elliot)" section for the dispatch contract and hash-lock semantics.

---

## Pointer

Whole-system architecture (nginx routing, three-domain setup, Postgres schema, decisions log) is in `../README.md`. End-to-end UAT report with the 64-cell coverage matrix and crawler internals is at `../docs/full_test.md`.
