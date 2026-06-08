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
    → dispatch-article.mjs           ← persona + brief + research_url + status=published
        → copywriter (draft-article)
        → imager (generate-hero)     ← Vertex Imagen 3, article-specific image
        → seo (optimize-meta)
        → web-manager (submit)       → status: published (auto-approved)
```

**Orchestrator:** `plan-wave.mjs --execute --limit=16 --gap=90 --status=published`
- Reads Payload state, auto-prioritises empty cells (Wave 1 first)
- Assigns persona by topic-affinity
- Calls `trend-scan.mjs` per dispatch for `research_url`
- Articles land as `published` directly (no pending_review queue)

**Script location:** `gda-ai01:/opt/.openclaw-ess/workspace-main/scripts/`

### Hero-ad images (listing page banners)
```
generate-hero-ad.mjs --limit=8
  → query inactive hero-ads from Payload
  → Vertex Imagen 3 (16:9, editorial banner style)
  → upload to Payload media (kind=hero_ads)
  → PATCH /api/hero-ads/{id} with creative + active=true
```

**Script:** `gda-ai01:/opt/.openclaw-ess/workspace-imager/scripts/generate-hero-ad.mjs`

---

## Daily Targets

| Asset | Per day | Runtime | Tool |
|---|---|---|---|
| Listing hero images | 8 | ~10 min | `generate-hero-ad.mjs --limit=8` |
| Articles | 16 | ~29 min | `plan-wave.mjs --execute --limit=16 --gap=90 --status=published` |
| Vertex Imagen calls | 24 total | | well within 1,000/day quota |
| Vertex Gemini calls | ~32 total | | well within 60/min quota |

Run by cron at **02:00 SGT (18:00 UTC)** on `gda-ai01`.
Articles are auto-published — no manual approval needed.

---

## Timeline

### Pre-flight ✓ COMPLETE

- [x] Wire `trend-scan.mjs` into `plan-wave.mjs` per-dispatch (pass top URL as `research_url`)
- [x] Build `generate-hero-ad.mjs` script
- [x] `--status=published` flag wired in `plan-wave.mjs`
- [x] Daily cron at 02:00 SGT on gda-ai01 (stops after Wave 1)
- [x] `update-progress.mjs` on gda-pn01 (post-run doc updater)

### Wave 1 — Full first coverage (Days 1–8)
**Priority: every empty cell gets at least 1 article before any cell gets a 2nd.**

- 44 empty article cells × 1 article = 44 articles (3 days at 16/day)
- All 64 hero-ad slots filled (61 needed ÷ 8/day = 8 days)

Milestone: all 64 cells have a listing banner + at least 1 article.

**Gate: cron self-stops. Review progress here before starting Wave 2.**

### Wave 2 — Depth building (Days 9–30+)
**To be replanned after Wave 1 gate review.**

Indicative targets at 16/day:
- +352 articles over 22 days

**End of Wave 2 forecast (Day 30):**

| Metric | Start | After 30 days | Full target |
|---|---|---|---|
| Hero-ads active | 3 / 64 | 64 / 64 ✓ | 64 / 64 |
| Articles total | 25 | ~505 | 1,280 |
| Cells with articles | 20 / 64 | 64 / 64 ✓ | 64 / 64 |
| Avg articles per cell | 0.4 | ~7.9 | 20 |

### Wave 3 — Completion (Days 31–93)
- Continue at 16/day
- All 1,280 articles complete ~Day 93

---

## Human review

Articles are auto-published. Spot-check at any time via:
`/admin/collections/articles?where[status][equals]=published`

---

## Automation (gda-ai01)

```
crontab: 0 18 * * *   /opt/.openclaw-ess/workspace-main/scripts/daily-run.sh
```

- Self-stops when Wave 1 is complete (all 64 cells + 64 hero-ads)
- After each run, SSHes to gda-pn01 and runs `node scripts/update-progress.mjs`
- Progress committed to `docs/publish_inventory.md` + this file automatically

---

## Progress (auto-updated 2026-06-08)

| Metric | Current | Wave 1 target | Final target |
|---|---|---|---|
| Hero-ads active | 21 / 64 | 64 / 64 | 64 / 64 |
| Articles total | 58 | ≥ 64 (one per cell) | 1,280 |
| Cells with articles | 57 / 64 | 64 / 64 | 64 / 64 |
| Avg articles per cell | 0.9 | 1.0 | 20 |

**Wave 1 status:** in progress

---|---|---|---|
| Hero-ads active | 13 / 64 | 64 / 64 | 64 / 64 |
| Articles total | 35 | ≥ 64 (one per cell) | 1,280 |
| Cells with articles | 34 / 64 | 64 / 64 | 64 / 64 |
| Avg articles per cell | 0.5 | 1.0 | 20 |

**Wave 1 status:** in progress

---|---|---|---|
| Hero-ads active | 5 / 64 | 64 / 64 | 64 / 64 |
| Articles total | 26 | ≥ 64 (one per cell) | 1,280 |
| Cells with articles | 25 / 64 | 64 / 64 | 64 / 64 |
| Avg articles per cell | 0.4 | 1.0 | 20 |

**Wave 1 status:** in progress

---

## Open gaps

All pre-flight gaps resolved. No blockers.
