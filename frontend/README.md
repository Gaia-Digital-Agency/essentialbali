# Essential Bali — Frontend

Public-facing site. Vite 7 + React 19 + Tailwind v4 + TypeScript 5.7. Built artifacts are served by the SSR shell in `../backend/` on `:8082` (which proxies to nginx in production).

Live: `https://essentialbali.com`, `https://www.essentialbali.com`, `https://essentialbali.gaiada.online`.

---

## Layout (post-redesign 2026-04-29 → 2026-04-30)

### Header / nav (every page) — `Templates/Header.tsx`
- Logo links to `/` (universal back-to-home anchor; the previous "stay-in-area" behaviour was confusing — fixed 2026-04-30).
- **Area dropdown** (`AreaMenuToggleButton.tsx`): when an area is selected (label !== "All Area"), the trigger renders in brand red text + semibold + tinted red pill background + a leading map-pin icon. Sets `aria-current="page"`. Default state stays neutral.
- **Topic nav** (`MenuNav` inside Header): the topic matching the current URL is rendered red + semibold + 2px red bottom border. Inactive topics drop to icewhite/70 on hover.
- **Area picker preserves the current topic**: choosing "Ubud" while on `/canggu/dine` navigates to `/ubud/dine`, not `/ubud`. Implementation: `AreaMenuPanel.tsx` reads `useRoute().actualRoute.category` and appends the slug when present.

### Homepage `/` — `pages/Front/Templates/Home.tsx`
1. Header + topic nav (above)
2. **`<HeroBanner />`** (`components/front/HeroBanner.tsx`) — single full-width hero from `hero_ads` (NULL,NULL) homepage default slot. Renders editorial headline + subline overlay. Optional CTA button when `ctaActive=true`. Soft gradient overlay so light copy stays legible. Renders nothing when no active hero (no fallback needed on the homepage — this IS the default).
3. **`<DailyEssentials />`** (`components/front/DailyEssentials.tsx`) — daily-rotated 4×4 grid (16 articles, 2 per topic from 2 different areas). Reads today's `home_daily_feed` row with `depth=2` (article + area + topic + hero materialised). Shrink-and-centre when sparse.
4. **`<Newsletter />`** (`components/front/Newsletter.tsx`) — sign-up form, copy from `newsletter-notice` Global. POST to `/api/subscribers/subscribe`. Server-side success message wins (knows new vs reactivated).
5. Footer

### Area page `/{area}` (e.g. `/canggu`) — same Directory template
- Header now shows the area name in red + map-pin in the dropdown
- **`<HeroBanner area="canggu" />`** — strict-area lookup: tries `(canggu, NULL)` area-only hero first, then any `(canggu, *)` cell hero. Never crosses area boundaries — no fallback to homepage default. (Fixed 2026-04-30: previously fell back to homepage default which surfaced an "Explore Canggu" CTA on a Nusa Penida page.)
- 8 area-only heroes (one per area) generated 2026-04-30 via `POST /api/hero-ads/generate-area-hero` (Vertex Imagen with area-anchored prompt).

### Area × Topic listing `/{area}/{topic}` — `Templates/Directory.tsx`
1. Header + topic nav (active topic underlined red, area dropdown in red)
2. **`<HeroBanner area={...} topic={...} />`** — strict (area, topic) cell hero. Falls back to (area, NULL) area-only, then any same-area hero. Never crosses area boundary.
3. Page title + optional subcategory + tag rows
4. Article grid using `LISTING_PAGE_SIZE = 20` from `lib/constants.ts` (single source of truth — same constant used by `backend/src/ssr/content.fetch.js`)
5. Pagination
6. Newsletter
7. Footer

### Events listings `/events` and `/{area}/events` — `Templates/EventsV3.tsx`
- Does NOT render `<HeroBanner>` (events have their own structured header)
- Card shape: image + time-of-day badge overlay (Morning / Afternoon / Night / All day) → category chip · start date · time range · recurrence pill (Every week / Every month / Annual) · venue with map pin · "Get tickets" button when `eventDetails.ticketUrl` is set
- Filter UI: date-range picker + morning/afternoon/night chips → query keys `metaData_start_date / _end_date / _start_time / _end_time` translate server-side to `where[eventDetails.*]`

### Single article `/{area}/{topic}/{slug}` — `Templates/SingleV2.tsx`
- Breadcrumb (Home / Area / Topic) ABOVE the hero (was `md:absolute md:top-10 md:left-10 md:z-20` overlay, fixed 2026-04-30)
- Title + sub_title + author/date row
- Body, tags, share

---

## Public capability surface (UAT-verified 2026-04-29 → 2026-04-30)

The following user-facing features are validated end-to-end against production. Detailed test evidence in `../docs/full_test.md`.

### Routing — 64 area × topic combinations

8 areas × 8 topics = 64 cells, all return **HTTP 200** with the listing template. Empty cells render a clean "No article for this category" message + paginator.

| Areas | canggu, kuta, ubud, jimbaran, denpasar, kintamani, singaraja, nusa-penida |
|---|---|
| Topics | events, news, featured, dine, health-wellness, nightlife, activities, people-culture |
| URL pattern | `/{area-slug}/{topic-slug}` and `/{area-slug}/{topic-slug}/{article-slug}` for single articles |

Path resolution lives in `src/pages/Front/PathResolver.tsx`.

### Homepage CTAs

| Component | File | Wires to | Status |
|---|---|---|---|
| Newsletter subscribe | `src/components/front/Newsletter.tsx` | `POST /api/subscribers/subscribe` (public, idempotent) | working |
| Advertise modal | `src/components/front/AdvertiseModal.tsx` | `POST /api/advertise` (sends via Gmail OAuth from `ai@gaiada.com`) | working |
| Ask Elliot popup | `src/components/front/AIChatPopup.tsx` | `POST /api/ai-chat` (Vertex Gemini, scope-grounded to Essential Bali) | working |
| Social — top nav | `src/components/front/About.tsx` | facebook.com/essentialbali · instagram.com/essentialbali · twitter.com/essentialbali | working |
| Social — footer | (footer block) | + linkedin.com/company/essentialbali (4th channel only in footer) | working |

### Subscribe endpoint contract

Public `POST /api/subscribers/subscribe` (added during the 2026-04-29 UAT — replaces the legacy `/api/newsletter/subscribe` path that 404'd). Idempotent — repeat sign-ups return success without duplicating, and reactivate `unsubscribed`/`bounced` rows.

Request:
```json
{ "email": "alice@example.com", "source": "homepage" }
```

Response:
```json
{
  "success": true,
  "data": {
    "email": "alice@example.com",
    "subscribed_at": "2026-04-29T17:03:15.439Z",
    "message": "Thanks for subscribing to our newsletter!"
  }
}
```

The handler lives in `cms/src/app/(frontend)/api/subscribers/subscribe/route.ts`. The `source` field defaults to `"homepage"` when omitted.

---

## Local development

```bash
pnpm install
pnpm dev                  # Vite on :5173 — needs the SSR shell + Payload running
```

`pnpm dev` runs Vite in standalone mode for component work. For full-stack local dev (CMS + SSR), run `../backend` and `../cms` in parallel — see the root `README.md` "Operations" section.

### Build

```bash
pnpm build                # client bundle into dist/client/
pnpm build:ssr            # client + SSR entry into dist/
```

The SSR shell at `../backend/app.js` reads `dist/client/index.html` and the SSR entry from `dist/server/`, then serves the result on :8082. After a frontend code change in production, **rebuild + restart the backend** (the SSR shell holds a reference to the index template):

```bash
cd /var/www/essentialbali/frontend && pnpm build
pm2 restart essentialbali
```

### Environment

`.env.production` carries:

| key | example | what for |
|---|---|---|
| `VITE_BASE_PATH` | `/` | router base path |
| `VITE_SITE_URL` | `https://essentialbali.com` | canonical/OG tags |
| `VITE_IMAGE_URL` | `https://storage.googleapis.com/gda-essentialbali-media` | media host (Payload + GCS) |
| `VITE_WHATSNEW_BACKEND_URL` | empty (defaults to `window.location.origin`) | API base — leave blank in prod for same-origin calls |

---

## API client

`src/api.ts` is a singleton axios instance with `withCredentials: true` (Payload session cookies) and a 491-refresh interceptor for token rotation. All service modules in `src/services/` go through it:

| Service | Endpoints called | Notes |
|---|---|---|
| `newsletter.service.ts` | `subscribers/subscribe`, `newsletter/admin/count-subscribers` | subscribe verified working in UAT |
| (others as added) | | |

> **Note for external/scripted REST clients** (not browser): Payload v3's session cookies are not honoured when sent via the `Cookie:` header on `/api/*` REST calls — the admin UI works because Next/Payload manages the session internally, but curl/server-side clients must use `Authorization: JWT <token>` instead. Surfaced during the 2026-04-29 UAT.

---

## Console hygiene

Recent commits already shipped:

- NavLogo aspect-ratio lock (eliminated logo-load CLS) — `e0e313c6`
- Fontaine font-metric matching for CSS fallbacks — `e5dc38b`

Open console items (non-blocking, see `../docs/full_test.md` §6):

1. `PathResolver.js` logs 2 caught `Error` entries on listing pages — investigate fetch shape for empty-result sets.
2. `Directory.js` fires one `AxiosError 404` on listing pages — likely an articles-by-area+topic call returning 404 instead of `[]`.

---

## Architecture pointer

This README only covers the frontend. Whole-system architecture (nginx routing, Payload, the Elliot agent pipeline, Postgres schema) is in `../README.md`. The most recent end-to-end smoke + functional test report is in `../docs/full_test.md`.
