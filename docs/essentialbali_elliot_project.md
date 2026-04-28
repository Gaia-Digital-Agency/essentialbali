# Essential Bali × Elliot — Project Brief

## What

A Bali lifestyle publication — by area, by topic — paired with **Elliot**, an AI orchestrator that produces, reviews and pushes content into the site's CMS so a small human team can manage a 1,000+ article library without burning out.

- Public site: **Essential Bali** (https://essentialbali.gaiada.online and https://essentialbali.com)
- AI agent: **Elliot** (https://ess.gaiada0.online — Mission Control)
- Areas: Canggu · Kuta · Ubud · Jimbaran · Denpasar · Kintamani · Singaraja · Nusa Penida (8)
- Topics: Events · News · Featured · Dine · Health & Wellness · Nightlife · Activities · People & Culture (8)
- Production matrix: 8 × 8 = **64 cells**, target ~20 articles each ≈ **1,280 articles**

## Why

A site that aspires to be the canonical Bali guide needs depth across every (area, topic) cell — and refreshes for time-sensitive ones (Events, News). Doing that manually means a full editorial team. Doing it with stock content means slop. The middle path: an AI system that produces drafts under a human approval gate.

- **Coverage** — Elliot plans waves so the 64 cells fill in without holes.
- **Quality gate** — every article enters Payload as `pending_review`; a human approves before `published`.
- **SEO + ad-revenue** — the matrix is also a hero-ad placement grid: 64 fixed slots, each toggleable by the admin.
- **Scaling without hiring** — Elliot's six sub-agents specialise (write / image / SEO / push / crawl / extract); volume rises without per-article human cost.

## How

**Stack:** PostgreSQL · Python (Elliot's scraper) · Payload v3.84 · Vite SSR · React 18 · TailwindCSS v4 · Node 20

```
                        ┌──────────────────┐
                        │ Visitor / Crawler│
                        └────────┬─────────┘
                                 │ HTTPS
                                 ▼
                  ┌──────────────────────────────┐
                  │ nginx @ gda-s01 (path-aware) │
                  └─────┬────────────────┬───────┘
                        │ /admin /_next  │ everything
                        │ Payload /api/* │ else
                        ▼                ▼
              ┌────────────────────┐  ┌─────────────────────┐
              │ Payload CMS :4008  │  │ Vite SSR + Express  │
              │ Next.js 15         │  │ :8082 (legacy front)│
              │ 10 collections     │  │ Original brand UX   │
              │ /api/ai-chat       │  │ AdvertiseModal +    │
              │ /api/advertise     │  │ Ask Elliot popup    │
              └─────────┬──────────┘  └─────────────────────┘
                        ▼
                ┌──────────────┐
                │ PostgreSQL   │
                │ source of    │
                │ truth        │
                └──────────────┘

         ┌─────────────── HTTPS / JWT ───────────────┐
         │                                           │
         ▼                                           ▼
  ┌────────────────────────────────────┐       Vertex AI
  │ Elliot @ gda-ai01:/opt/.openclaw-ess│         (Gemini 2.5)
  │   Orchestrator (Haiku 4.5)         │       Imagen 3
  │   ├─ Crawler   benchmark sites     │       Gmail API
  │   ├─ Scraper   xlsx + Google Docs  │       Drive API
  │   ├─ Copywriter article body       │
  │   ├─ Imager    hero + inline       │
  │   ├─ SEO       meta + schema       │
  │   └─ Web Mgr   Payload REST        │
  └────────────────────────────────────┘
```

**Two ingestion paths into Payload:**

1. **Crawler benchmark research → article**
   `crawler.discover` across whatsnewindonesia / honeycombers/bali / nowbali / thebalibible (robots-respecting, 1 req/s) → `crawler.analyze` for top candidates → `copywriter.draft-article` (persona-driven) → `imager.generate-hero` → `seo.optimize-meta` → `web-manager.submit-article` (status=pending_review).

2. **xlsx tracker → article**
   `Essential Bali Proofread.xlsx` lives in Google Drive. `scraper.pull-xlsx-from-drive` → `scraper.read-articles-xlsx` extracts ~8 row-briefs → `scraper.read-google-doc` pulls each Draft Link body (when shared with `ai@gaiada.com`) → `process-inbox` emits per-row records with `body_source = "draft" | "metadata"` → Copywriter expands metadata-only rows → Web Manager pushes.

**Personas:** Maya (foodie) · Komang (activities/wellness) · Putu (culture/news) · Sari (nightlife/events) — for E-E-A-T SEO signal.

**Approval workflow:** AI submits as `pending_review` → human reviews title/image/body in Payload admin → approve to `published` → article appears live on https://essentialbali.gaiada.online and is added to `/sitemap.xml`.

**Talk to Elliot in CMS:** `/admin/elliot` — full chat panel with agent picker, skill listings, production matrix card. Powered by `/api/ai-chat` (Vertex Gemini, Elliot persona, Redis rate limit).

## Where

| Layer | Location |
|---|---|
| Public site source | `gda-s01:/var/www/essentialbali` |
| Site processes (PM2) | `essentialbali` (Vite SSR :8082), `essentialbali-cms` (Payload Next.js :4008) |
| Public URLs | https://essentialbali.gaiada.online · https://essentialbali.com |
| Admin URL | /admin (login: `super_admin@email.com` / `Teameditor@123`) |
| Talk to Elliot | /admin/elliot |
| Repo | `git@github.com:Gaia-Digital-Agency/essentialbali.git` |
| Branch model | `main` only |
| Database | PostgreSQL `essentialbali_db` on gda-s01:5432 |
| Elliot instance | `gda-ai01:/opt/.openclaw-ess` |
| Elliot gateway | `systemctl --user status openclaw-ess-gateway` (port 19290) |
| Elliot Mission Control | https://ess.gaiada0.online |
| Elliot repo | `git@github.com:Gaia-Digital-Agency/openclaw-ess.git` |
| Drive inbox folder | "Essential Bali — Elliot Inbox" (shared with `ai@gaiada.com`) |
| Vertex AI key | `gda-ai01:/opt/.openclaw-ess/credentials/gda-viceroy-vertex.json` |
| Gmail auth | OAuth refresh token, mirrored from `/var/www/templategen/.env` |
