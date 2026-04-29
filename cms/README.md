# Essential Bali — CMS

Payload v3.84 + Next.js 15 + React 19 + TypeScript 5.7. Runs on `:4008`. Hosts `/admin`, the REST API at `/api/*`, and a small set of public-facing route handlers.

Database: PostgreSQL (`essentialbali_db`). Media: GCS bucket `gda-essentialbali-media`. Email: Gmail OAuth from `ai@gaiada.com`.

Live admin: `https://essentialbali.com/admin` (and `https://essentialbali.gaiada.online/admin`).

---

## Capability surface (UAT-verified 2026-04-29)

Detailed test evidence in `../docs/full_test.md`.

### Admin

| Feature | Path | Status | Notes |
|---|---|---|---|
| Login | `/admin/login` | working | seeded `super_admin@email.com` / `Teameditor@123` |
| Content Matrix dashboard | `/admin` | working | 8 areas × 8 topics; per-cell status counts (`Np · Nr · Nd`) and green/grey hero-ad dot |
| Articles list + filter | `/admin/collections/articles` | working | Status workflow `draft → pending_review → approved → published` (auto-promote on approve hook); also `rejected` (releases hash-lock) and delete (releases hash-lock — Path B) |
| SEO meta auto-fill | hook on Articles `beforeChange` | working | Uses Vertex Gemini via `src/lib/seo-agent.ts`. Confirmed during article #1 promotion. |
| Imager regenerate | "🔁 Regenerate hero" on edit page | working | Uses Vertex Imagen via `src/lib/imager-regenerate.ts` |
| Hero Ads — 8×8 visual grid | `/admin/collections/hero-ads` | working | `HeroGridView` replaces the default list view. Activating a slot flips the dot green on the dashboard. UAT activated 5 slots with image creatives. |
| Subscribers list | `/admin/collections/subscribers` | working | Searchable; UAT showed 3 active rows landing from the public subscribe form |
| Newsletters compose + send | `/admin/collections/newsletters` | working (compose); SMTP send blocked by expired Gmail App Password (cred rotation needed — see UAT report §6) | Lifecycle hook on `beforeChange` correctly does `draft → sending → {sent, failed}` and stamps `sentAt` + `recipientCount` + `lastError` |
| Talk to Elliot | `/admin/elliot` | working | Full-page agent skill cards. **39/39 skills LIVE** across orchestrator + 6 sub-agents (Copywriter, SEO, Imager, Web Manager, Crawler, Scraper). Includes a **MediaUploadDock** + **ImagerGallery** for media work. |

### Public REST handlers (route handlers, not Payload auto-routes)

Every handler below was exercised end-to-end during UAT 2026-04-29.

| Path | Method | What it does | UAT result |
|---|---|---|---|
| `/api/subscribers/subscribe` | POST | **Public** subscribe-from-homepage. Validates email, upserts via Payload local API, idempotent for repeats, reactivates `unsubscribed`/`bounced` rows. | working — 3 sign-ups landed |
| `/api/subscribers/broadcast` | POST | Admin-only one-off broadcast to all active subscribers via Payload's email transport. Redis 5-minute cooldown lock. | exists; not exercised in UAT (newsletter compose covers the same path) |
| `/api/advertise` | POST | Public Advertise-with-us inquiry form. Sends via Gmail OAuth from `ai@gaiada.com`. | working — 1 inquiry landed |
| `/api/ai-chat` | POST | Public Ask-Elliot homepage popup. Vertex Gemini, scope-grounded to Essential Bali content. | working — 6 questions answered including correct fail-soft on out-of-scope (Seminyak) |
| `/api/seo-optimize` | POST | Used by Elliot dispatch chain + Articles hook (in-process). Vertex Gemini. | working — fired on all 7 Elliot articles |
| `/api/seo-competitor-gap` | POST | Ranks crawler `gap-report` output. | exists; not directly exercised in UAT |
| `/api/regenerate-hero` | POST | Used by the admin "🔁 Regenerate hero" button. Vertex Imagen. | exists; not directly exercised in UAT |
| `/api/media` | POST | Payload auto-route. Auto-converts JPEG → WebP, applies canonical filename, generates 480×270 thumbnail + 768×432 card variants, writes to GCS. | working — 12 media uploads landed (5 hero-ad creatives + 7 Elliot heroes) |

### nginx allowlist for `/api/*`

Production nginx only proxies a fixed list of API paths to Payload — anything else falls through to the SSR backend on `:8082`. **If you add a new collection here, also add it to the regex.**

Current allowlist (in `/etc/nginx/sites-available/essentialbali.com`):

```
location ~ ^/api/(users|areas|topics|articles|personas|media|comments|hero-ads|newsletters|subscribers|payload-preferences|access|graphql|graphql-playground|ai-chat|advertise|seo-optimize|seo-competitor-gap|regenerate-hero)(/|$)
```

This trap caught us twice during UAT — once for `subscribers/subscribe` (silent 404 on the homepage subscribe form, since `subscribers` IS in the list, the new sub-route works) and once for `newsletters` (Save in admin returned "An unknown error has occurred" because `newsletters` was missing from the regex). Both fixed in the same UAT run.

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

The admin UI uses Payload's session cookies via Next/Payload's built-in flow — that all works. **Scripted REST clients** (curl, server-side, CI) that hit `/api/*` should use the JWT header path, not the cookie path:

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

Surfaced during UAT — the `payload-token` cookie issued by `/api/users/login` is not honoured by REST endpoints when sent via the `Cookie:` header.

---

## Internal layout

```
cms/
├── ecosystem.config.cjs              pm2 entry
├── next.config.mjs
├── .env                              see "Local development" table
└── src/
    ├── payload.config.ts             central config; reads ../shared/allowed-origins.json for cors[]/csrf[]
    ├── access.ts                     isStaffOrAgent helper
    ├── seed.ts, seed-articles-placeholders.ts, create-elliot-user.ts
    ├── collections/
    │   ├── Articles.ts               beforeChange hooks: SEO meta auto-fill + auto-promote on approve
    │   ├── HeroAds.ts                admin.components.views.list = HeroGridView
    │   ├── Subscribers.ts            newsletter list (create requires isStaffOrAgent — public sign-up goes via /api/subscribers/subscribe)
    │   ├── Newsletters.ts            compose + dispatch via beforeChange hook
    │   ├── Media.ts                  GCS storage adapter, JPEG→WebP, canonical naming
    │   ├── Users, Areas, Topics, Personas, Tags, Comments    (hidden in UI, REST-functional)
    │   └── …
    ├── components/
    │   ├── MatrixDashboard.tsx       8×8 grid as admin home
    │   ├── ArticlesMatrixFilter.tsx  matrix above Articles list
    │   ├── HeroGridView.tsx          the 8×8 hero-ad grid (replaces default list)
    │   ├── NewslettersIntro.tsx      compose walkthrough panel (single CTA — duplicate "+ Compose newsletter" was removed in 2026-04-29 UAT)
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
    ├── app/(payload)/admin/elliot/   /admin/elliot route (Talk to Elliot)
    └── app/(frontend)/api/
        ├── ai-chat/route.ts                      Vertex Gemini Elliot chat
        ├── advertise/route.ts                    public Advertise modal target
        ├── seo-optimize/route.ts                 POST — used by Elliot dispatch + Articles hook
        ├── seo-competitor-gap/route.ts           POST — ranks crawler gap-report
        ├── regenerate-hero/route.ts              POST — used by RegenerateHeroButton
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
