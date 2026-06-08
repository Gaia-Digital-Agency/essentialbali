# Content Population Plan — June–August 2026

## Goal

Fill the 8×8 publish inventory (64 cells) with:
- **1 active listing-page hero image** per cell (hero-ads collection)
- **20 published articles** per cell (1,280 total)

Current state: 3 hero-ads active · 25 articles published.

---

## Personas (8 writers)

| Slug | Name | Voice | Best for |
|---|---|---|---|
| `maya` | Maya | Warm, sensory, opinionated foodie | Dine, Featured |
| `komang` | Komang | Practical, calm, safety-aware | Activities, Health & Wellness |
| `putu` | Putu | Cultural insider, anthropology background | People & Culture, News |
| `sari` | Sari | Energetic nightlife & events reporter | Nightlife, Events |
| `nadia-puspita` | Nadia Puspita | Wellness, retreat, plant-medicine adjacent | Health & Wellness |
| `kira-bumi` | Kira Bumi | Outdoor/adventure, Kintamani-born | Activities |
| `sang-ayu-rai` | Sang Ayu Rai | Balinese ritual, ceremony, banjar life | People & Culture |
| `tomas-veld` | Tomas Veld | After-dark — beach clubs, late warungs, DJs | Nightlife |

---

## Pipeline

### Articles
```
trend-scan.mjs (area, topic)         ← Crawler: 4 benchmark sites, 1 req/s
  → top research_url
    → dispatch-article.mjs           ← persona + brief + research_url
        → copywriter (draft-article)
        → imager (generate-hero)     ← Vertex Imagen 3, article-specific image
        → seo (optimize-meta)
        → web-manager (submit)       → status: pending_review
```

**Orchestrator:** `plan-wave.mjs --execute --limit=20 --gap=90`
- Reads Payload state, auto-prioritises empty cells (Wave 1 first)
- Assigns persona by topic-affinity
- Generates brief per cell
- **Gap to fix before starting:** wire `trend-scan` output as `research_url` per dispatch

**Script location:** `gda-ai01:/opt/.openclaw-ess/workspace-main/scripts/`

### Hero-ad images (listing page banners)
```
generate-hero-ad.mjs (area, topic)   ← NEW SCRIPT NEEDED
  → Vertex Imagen 3 (1200×628, editorial banner style)
  → upload to GCS gda-essentialbali-media
  → PATCH /api/hero-ads/{id} with creative + active=true
```

**Gap:** script does not exist yet. Estimated effort: ~1 hour to build from `generate-hero.mjs` base.

---

## Daily Targets

| Asset | Per day | Runtime | Tool |
|---|---|---|---|
| Listing hero images | 10 | ~10 min | `generate-hero-ad.mjs` (TBD) |
| Articles | 20 | ~35 min | `plan-wave.mjs --execute --limit=20 --gap=90` |
| Vertex Imagen calls | 30 total | | well within 1,000/day quota |
| Vertex Gemini calls | ~40 total | | well within 60/min quota |

Run both as cron jobs on `gda-ai01` at 02:00 SGT. Articles land as `pending_review`; batch-approve in Payload admin `/admin/collections/articles`.

---

## Timeline

### Pre-flight (before Day 1)
- [ ] Wire `trend-scan.mjs` into `plan-wave.mjs` dispatch calls (pass top URL as `research_url`)
- [ ] Build `generate-hero-ad.mjs` script
- [ ] Add both as cron jobs on gda-ai01

### Wave 1 — Full first coverage (Days 1–6)
**Priority: every empty cell gets at least 2 articles before any cell gets a 3rd.**

- 44 empty article cells × 2 articles = 88 articles (4–5 days at 20/day)
- All 64 hero-ad slots filled (61 needed ÷ 10/day = 7 days)

Milestone: all 64 cells have a listing banner + at least 2 articles.

### Wave 2 — Depth building (Days 7–30)
- 20 articles/day, plan-wave auto-prioritises biggest gaps
- +460 articles over 23 days

**End of month forecast:**

| Metric | Start | After 30 days | Full target |
|---|---|---|---|
| Hero-ads active | 3 / 64 | 64 / 64 ✓ | 64 / 64 |
| Articles total | 25 | ~625 | 1,280 |
| Cells with articles | 20 / 64 | 64 / 64 ✓ | 64 / 64 |
| Avg articles per cell | 0.4 | ~9.8 | 20 |

### Wave 3 — Completion (Days 31–63)
- Continue at 20/day
- All 1,280 articles complete ~Day 63

---

## Human review

Articles land as `pending_review`. Approve in batches via Payload admin:
`/admin/collections/articles?where[status][equals]=pending_review`

Expected review queue: ~20 new articles/day. Spot-check title, hero image, body opening paragraph. One-click approve → status = `published` → live on site + sitemap.

---

## Open gaps (must fix before Day 1)

| # | Gap | Effort |
|---|---|---|
| 1 | Wire `trend-scan.mjs` into `plan-wave.mjs` per-dispatch | ~2h on gda-ai01 |
| 2 | Build `generate-hero-ad.mjs` (imager → GCS → hero-ads PATCH) | ~1h on gda-ai01 |
