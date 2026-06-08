# Publish Inventory

Last updated: 2026-06-08

**Two separate assets per cell:**
- **Listing Page Hero** (`hero-ads` collection) — the full-width banner image shown at the top of each area/topic listing page. One slot per cell; `✓` = active with image, `—` = empty placeholder.
- **Articles** (`articles` collection) — editorial content. Each article carries its own dedicated hero image. Number shown = article count in that cell.

Target: 1 listing hero + 20 articles per cell (640 articles total across 64 cells).

---

## Listing Page Hero Images (hero-ads)

`✓` = active with image · `—` = empty placeholder

| Area           | Activities         | Dine               | Featured           | Health & Wellness  | News               | Nightlife          | People & Culture   | Events             |
|----------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|
| Ubud           | —                  | —                  | —                  | ✓                  | —                  | —                  | —                  | —                  |
| Canggu         | —                  | ✓                  | —                  | —                  | —                  | ✓                  | —                  | —                  |
| Kuta           | —                  | —                  | —                  | —                  | —                  | —                  | —                  | —                  |
| Jimbaran       | —                  | —                  | —                  | —                  | —                  | —                  | —                  | —                  |
| Denpasar       | —                  | —                  | —                  | —                  | —                  | —                  | —                  | —                  |
| Singaraja      | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  |
| Kintamani      | —                  | —                  | —                  | —                  | —                  | —                  | ✓                  | ✓                  |
| Nusa Penida    | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  | ✓                  |

**Active: 21 / 64 · Empty: 43 / 64**

---

## Articles (each article has its own hero image)

Number = article count in that cell. `—` = none yet.

| Area           | Activities         | Dine               | Featured           | Health & Wellness  | News               | Nightlife          | People & Culture   | Events             |
|----------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|
| Ubud           | 1                  | —                  | —                  | 1                  | 1                  | —                  | —                  | 1                  |
| Canggu         | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  |
| Kuta           | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  |
| Jimbaran       | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  |
| Denpasar       | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 2                  | 1                  |
| Singaraja      | 1                  | 1                  | 1                  | 1                  | 1                  | —                  | —                  | 1                  |
| Kintamani      | 1                  | —                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  |
| Nusa Penida    | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  | 1                  |

**58 articles total · 57 / 64 cells with at least one article · 7 cells empty**
All published articles have a dedicated hero image (stored in GCS: `gda-essentialbali-media`).
