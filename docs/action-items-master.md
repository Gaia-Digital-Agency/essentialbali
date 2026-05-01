# Essential Bali — Master Action Items

**Inventory consolidated 2026-05-02.** Combines the original
`docs/essentialbali_actions.md` (items 1–89) with everything shipped
since, the 9 currently-unactioned follow-ups, and remaining
strategic items.

Status legend
- ✅ done · committed and live
- ⚠ partial · scaffolded or part-done; flagged in unactioned section
- ❌ unactioned · queued, not started
- 🚫 obsolete · no longer applicable (note why)

---

## Section A — Original 89 actions (2026-04-27 baseline)

### A.1 Foundation, schema, seed (1–17)

| # | Item | Status |
|---|---|---|
| 1 | Fix /sitemap.xml 500 (defensive guards on missing taxonomy fields) | ✅ |
| 2 | Fix robots.txt — Sitemap line uses https:// | ✅ |
| 3 | Add root README.md documenting structure + architecture | ✅ |
| 4 | Document Postgres schema in README (Phase D plan) | ✅ |
| 5 | Provision Postgres database `essentialbali_db` and user `essentialbali_user` | ✅ |
| 6 | Payload v3.84.1 scaffold with 10 collections | ✅ |
| 7 | Seed 8 areas, 8 topics, 4 personas, 64 hero-ad placeholders, super_admin | ✅ |
| 8 | Seed 64 article placeholders (1 per area×topic, status=draft) | ✅ (later wiped intentionally) |
| 9 | Floating Back-to-Top + initial Ask AI buttons on legacy frontend | ✅ |
| 10 | Footer "Admin" link | ✅ |
| 11 | Archive 132 legacy media to old_assets/ + manifest.tsv | ✅ |
| 12 | Payload login-hint card on /admin/login | ✅ |
| 13 | Phase E cutover — full Payload Next.js stack on port 4008 | ✅ |
| 14 | Path-aware nginx routing | ✅ |
| 15 | Initial Talk-to-Elliot view in /admin | ✅ |
| 16 | Sidebar nav link "Channels → Talk to Elliot" | ✅ |
| 17 | MatrixDashboard 8×8 as admin home | ✅ |

### A.2 Admin polish (18–33)

| # | Item | Status |
|---|---|---|
| 18 | ArticlesMatrixFilter (matrix + status chips above Articles list) | ✅ |
| 19 | NewslettersIntro panel | ✅ |
| 20 | Newsletters collection + send-on-save workflow | ✅ |
| 21 | Subscribers / Newsletters separation | ✅ |
| 22 | Hide unused collections from admin nav | ✅ |
| 23 | Dark-theme tokens migrated across custom admin components | ✅ |
| 24 | Ask-Elliot popup widget on legacy public frontend | ✅ |
| 25 | AreaMenuPanel switched from grid to one-line flex | ✅ |
| 26 | Header logo bottom margin | ✅ |
| 27 | Remove tracked node_modules symlinks | ✅ |
| 28 | Merge dev → main (Phase E cutover landing) | ✅ |
| 29 | 504 hang fix — skipVerify on Payload nodemailer adapter | ✅ |
| 30 | ai-agent role + JWT login for Elliot — CRUD verified | ✅ |
| 31 | /api/ai-chat route (Vertex Gemini, Elliot persona, Redis rate limit) | ✅ |
| 32 | /signin + /signup → 410 Gone | ✅ |
| 33 | Favicon on /admin browser tab + app/icon.png | ✅ |

### A.3 Agent host scaffold (34–51)

| # | Item | Status |
|---|---|---|
| 34 | Initial .openclaw-ess scaffold (Elliot + 6 sub-agent workspaces) | ✅ |
| 35 | workspace-main HEARTBEAT / MEMORY / TOOLS / USER files | ✅ |
| 36 | openclaw-ess README — Payload contract + Vertex wiring | ✅ |
| 37 | Mission Control gateway service on gda-ai01:19290 | ✅ |
| 38 | ess.gaiada0.online DNS + Let's Encrypt cert + nginx | ✅ |
| 39 | Vertex AI key copied to /opt/.openclaw-ess/credentials/ | ✅ |
| 40 | Gateway runtime artifacts after first start | ✅ |
| 41 | Google Doc fetching — OAuth token reused from /var/www/gdrive | ✅ |
| 42 | workspace-scraper/scripts/read-google-doc.py | ✅ |
| 43 | workspace-scraper/scripts/check-doc-access.py | ✅ |
| 44 | workspace-scraper/scripts/pull-xlsx-from-drive.py | ✅ |
| 45 | workspace-scraper/scripts/process-inbox.py | ✅ |
| 46 | Drive folder pattern documented | ✅ |
| 47 | workspace-crawler/scripts/crawl-benchmark.mjs | ✅ |
| 48 | workspace-scraper/scripts/read-articles-xlsx.py | ✅ |
| 49 | workspace-main/SKILL-CRAWL-BENCHMARK.md | ✅ |
| 50 | workspace-main/SKILL-READ-INBOX.md | ✅ |
| 51 | bridge/sync-articles-inbox.sh moved to openclaw-ess repo | ✅ |

### A.4 Repo / branch hygiene (52–58)

| # | Item | Status |
|---|---|---|
| 52 | Local README mirror at /Users/rogerwoolie/downloads/essentialbaliNopenclaw | ✅ |
| 53 | Dev branch retired; main-only workflow | ✅ |
| 54 | PM2 essentialbali-cms cwd flipped to main worktree | ✅ |
| 55 | essentialbali README rewrite (single-domain architecture) | ✅ |
| 56 | openclaw-ess README rewrite (agent skills table) | ✅ |
| 57 | Talk-to-Elliot view rewritten with real skill depth | ✅ |
| 58 | Skill summary visible in /admin/elliot | ✅ |

### A.5 Advertise + Gmail integration (59–65)

| # | Item | Status |
|---|---|---|
| 59 | Advertise With Us — replace mailto with form (AdvertiseModal) | ✅ |
| 60 | /api/advertise route (Gmail API + Redis rate limit) | ✅ |
| 61 | Gmail SMTP path retired — Gmail API via OAuth refresh token | ✅ |
| 62 | cms/src/lib/gmail-api.ts helper | ✅ |
| 63 | SMTP env vars rotated to GOOGLE_CLIENT_*  | ✅ |
| 64 | Footer wired to AdvertiseModal | ✅ |
| 65 | Smoke test: real ad-inquiry email delivered to info@gaiada.com | ✅ |

### A.6 Domain + DNS (66–69)

| # | Item | Status |
|---|---|---|
| 66 | essentialbali.com — apex A → 34.124.244.233 (Damian) | ✅ |
| 67 | essentialbali.com — www A record at Hostinger | ✅ |
| 68 | essentialbali.com — AAAA Hostinger IPv6 removed | ✅ |
| 69 | certbot --nginx -d essentialbali.com -d www.essentialbali.com | ✅ |

### A.7 Article + Media + Sitemap (70–79)

| # | Item | Status |
|---|---|---|
| 70 | Article seo.metaTitle auto-fill from title when AI submits empty | ✅ |
| 71 | HeroAds 64-cell visual editor | ✅ (now 65 with homepage default) |
| 72 | Sitemap split — index + areas + topics + articles | ✅ |
| 73 | Payload media adapter switched to GCS bucket | ✅ |
| 74 | Decommission SendGrid creds | ✅ |
| 75 | Drop legacy MySQL essentialbali database (after backup snapshot) | ⚠ status uncertain — verify |
| 76 | Pin first-run article — lock slug + verify homepage hero/sitemap | ✅ (Phase 2/3 covered this) |
| 77 | Smoke test full agent pipeline — Elliot crawler → article → published | ✅ (Phase 3 ran it) |
| 78 | Share Drive folder "Essential Bali — Elliot Inbox" with ai@gaiada.com | ❌ unactioned |
| 79 | Promote 8 placeholder articles to status=published (Wave 1) | 🚫 obsolete (placeholders wiped; replaced by Phase 3's 19 articles) |

### A.8 "Tomorrow" — 10 scaffolded skills (80–89)

| # | Item | Status |
|---|---|---|
| 80 | Elliot review-gate skill | ✅ (openclaw-ess) |
| 81 | Elliot status-report skill | ✅ |
| 82 | Elliot maintenance-pass skill | ✅ |
| 83 | Copywriter rewrite-article | ✅ |
| 84 | Copywriter regenerate-title | ✅ |
| 85 | Copywriter persona-check | ✅ |
| 86 | SEO competitor-gap | ✅ |
| 87 | Imager regenerate | ✅ |
| 88 | Crawler trend-scan | ✅ |
| 89 | Crawler gap-report | ✅ |

---

## Section B — Actions added since the 89-item baseline

### B.1 Homepage redesign (post-Phase E, items A–I, May 2026)

These were lettered A–I in commit messages. Mapping to numeric IDs:

| # | Item | Status | Commit |
|---|---|---|---|
| 90 | A — HeroBanner + DailyEssentials components + NewsletterNotice | ✅ | `8d66b3a` |
| 91 | B — wire HeroBanner + DailyEssentials into Home; A B C resolved | ✅ | `ce06bf9` |
| 92 | C — area-menu preserve current topic when switching areas | ✅ | `d5c97b5` |
| 93 | D — RouteContext stale-merge fix | ✅ | `6732654` |
| 94 | E — area-only heroes (8 generated, strict semantics) | ✅ | `c3900b0` |
| 95 | F — mass actions on Articles + Hero Ads | ✅ | `0d68b46` |
| 96 | G — Imager Gallery picker for article hero | ✅ | `0845458` |
| 97 | H — newsletter quick-filter chips | ✅ | `d13a5d1` |
| 98 | I — hero-ad-versions audit collection + History panel | ✅ | `d6953b3` |
| 99 | M+N — breadcrumb above hero + push-button placement | ✅ | `e8224a0` |
| 100 | EventsV3 card refresh | ✅ | `4353ad4` |
| 101 | eventDetails group on Articles (date/time/venue) | ✅ | `09c37d2` |
| 102 | Daily homepage-feed picker + pm2 cron | ✅ | `6f168c3` |
| 103 | HomeDailyFeed collection + NewsletterNotice global | ✅ | `926d58f` |
| 104 | HeroGridView extends to 65 slots | ✅ | `49e1fbb` |
| 105 | Topic.showsHero flag — Events hidden from hero grid | ✅ | `dbb355a` |
| 106 | "Push to all" homepage hero button | ✅ | `c954702` |
| 107 | BreadcrumbStrip + Newsletter SSR alignment | ✅ | `5cac1a7` |

### B.2 Frontend perf burst (mixed-content fix + assets, late April)

| # | Item | Status | Commit |
|---|---|---|---|
| 108 | canonical/og:url use HTTPS gaiada.online + repair SSR build | ✅ | `d4038c5` |
| 109 | Header menu reads SSR initialData, fetch as fallback | ✅ | `d7b339c` |
| 110 | SSR — translate legacy query keys → Payload where-clauses | ✅ | `e74ee02` |
| 111 | SSR — remap legacy home-section slugs to existing topic slugs | ✅ | `5b0b4e3` |
| 112 | /api/article + /api/article/search adapter routes | ✅ | `da5cc8f` |
| 113 | Refresh SSR payload on intra-SPA nav via /api/content | ✅ | `af0a40f` |
| 114 | Optimise header logo (265KB → 13KB) | ✅ | `cbd84d0` |
| 115 | Lock NavLogo aspect-ratio (logo-load CLS) | ✅ | `0e313c6` |
| 116 | Wire Fontaine for font-metric-matched CSS fallbacks | ✅ | `e5dc38b` |

### B.3 Media naming convention — N1 to N8 (29 Apr–1 May 2026)

| # | Item | Status | Commit |
|---|---|---|---|
| 117 | N1 — media-naming helper (mediaName / parseMediaName) + spec | ✅ | `65983f3` |
| 118 | N5 — clean slate (wiped 7 media + Articles 69/70) + /logo.png mount | ✅ | `28cadcc` |
| 119 | N2 — Media schema (source/kind/area/topic/linkedArticle/linkedHeroAd) | ✅ | `16b7d96` |
| 120 | N3 — beforeOperation canonical-filename hook | ✅ | `a41ccca` |
| 121 | N4 — wire metadata flow (cms route + 2 mjs scripts) | ✅ | `5dc3645` + `7493120` |
| 122 | N6 — MediaUploadDock in /admin/elliot | ✅ | `c4194e9` |
| 123 | N7 — ImagerGallery + wire both into /admin/elliot | ✅ | `0829e91` |
| 124 | N8 — final verify + docs | ✅ | `aa61508` |

### B.4 Content campaign — Phase 0 to 5 (1 May 2026)

| # | Item | Status | Commit |
|---|---|---|---|
| 125 | Phase 0 v3 — pre-cleanup (HomeTemplate trim, +4 personas, orphan wipe) | ✅ | `226c11c` |
| 126 | Phase 0 v4 — `group` enum on articles + HomeTemplate rewrite (5×4) | ✅ | `2c4b521` |
| 127 | Phase 0b — /admin/homepage-curation UI + refresh API | ✅ | `647d1af` |
| 128 | Phase 1 — campaign benchmark sweep (10 cells × 2 sites = 88 candidate headlines) | ✅ | `8f50193` (oc-ess) |
| 129 | Phase 2 — 1 homepage hero ad ("Bali Hayu Travel") | ✅ data-only |
| 130 | Phase 3 — 19/20 articles auto-published, all canonical hero images | ✅ | `5971fac` (oc-ess) |
| 131 | Phase 5 — final audit + Lighthouse + docs touch | ✅ | `30ff113` |

### B.5 Pre-fixes + Perf series (1–2 May 2026)

| # | Item | Status | Commit |
|---|---|---|---|
| 132 | Pre — image-URL absolute-detection + smaller newsletter title | ✅ | `ee1c4f0` |
| 133 | Perf #1 — CLS aspect-ratio + skeleton parity | ✅ | `48cec03` |
| 134 | Perf #2 — preload LCP hero ad image | ✅ | `5a9002a` |
| 135 | Perf #3 — HTTP/2 on all 3 production domains | ✅ | `9bd5473` |
| 136 | Perf #4 — lazy-load audit + explicit eager on LCP | ✅ | `398db06` |
| 137 | Perf #5 — manualChunks vendor split | ✅ | `a90a178` |
| 138 | Perf #6 — Cache-Control on /api/* read endpoints | ✅ | `21516a4` |
| 139 | Perf #7 — preload critical fonts | ✅ | `8ce2e49` |
| 140 | Perf #8 — fix gzip on all asset types | ✅ | `10d2131` |
| 141 | Perf #9 — Tailwind JIT verified + drop unused FA @import | ✅ | `e44d6fc` |
| 142 | Perf #10 — preconnect/dns-prefetch for GCS | ✅ | `a92c712` |

### B.6 Documentation passes

| # | Item | Status | Commit |
|---|---|---|---|
| 143 | UAT report + READMEs for cms / frontend / backend | ✅ | `7fb8ced` |
| 144 | docs(perf): record 5 follow-up items | ✅ | `016fb22` |
| 145 | docs(followups): expand 5 → 9 (Elliot chat + gallery) | ✅ | `f7b3a8e` |
| 146 | docs(followups): refine #9 spec (8 lanes × 3 images) | ✅ | `cf0610a` |

---

## Section C — Currently unactioned (the 9 from `docs/perf-followups-2026-05-02.md`)

| # | P | Item | Effort |
|---|---|---|---|
| 147 | 🔴 | F1 — Diagnose mobile LCP regression (cache hero-ad SSR fetch) | ~60 min |
| 148 | 🔴 | F2 — Find + fix desktop CLS culprit | ~45 min |
| 149 | 🟡 | F3 — Install Brotli (`nginx-extras` package swap) | ~30 min |
| 150 | 🟡 | F4 — Trim vendor-misc 556 KB chunk | ~90 min |
| 151 | 🟢 | F5 — Drop Quill CSS imports | ~20 min |
| 152 | 🟡 | F6 — Bump Elliot chat maxOutputTokens 600→4000 | ~5 min |
| 153 | 🔴 | F7 — Execute button on Elliot chat (REAL fix for "create content") | ~2 hr |
| 154 | 🟡 | F8 — Full Vertex tool-calling in chat (level C) | ~6 hr |
| 155 | 🟡 | F9 — Imager Gallery → 8 lanes × 3 images, per-lane refresh | ~30–45 min |

**Priorities:**
- **147 + 148** → path to 90+ Lighthouse
- **152 + 153** → path to a usable Elliot chat
- **155** → operator UX polish (gallery)

---

## Section D — Strategic / open-ended (long-horizon, not yet sized)

| # | Item | Status | Notes |
|---|---|---|---|
| 156 | Generate the remaining 1,261 articles toward the 1,280 target (8 areas × 8 topics × 20 each) | ❌ | Phase 3 created 19. Long campaign — multiple waves over weeks. |
| 157 | Generate the remaining 64 hero ads toward the 65-slot grid (8 areas × 8 topics + 1 homepage) | ❌ | Phase 2 created 1 (homepage). Operator can fill manually OR Imager pipeline can batch. |
| 158 | Fill `eventDetails` (date/time/venue/lat/lng) on every article with topic=events | ❌ | Schema exists (item 101) but no events created with structured fields yet. Tied to F7. |
| 159 | Migrate `time_of_day` schema field (morning/afternoon/night) — defined in Articles.ts but not yet in DB migration set | ❌ | Inspected during Phase 0 v4. Skipped because non-blocking; events were created without it. Pick up when filling event details. |
| 160 | Cutover from gda-s01 to a real production stack — DB backup strategy, monitoring, secrets rotation policy | ❌ | Operational. Not a feature; readiness checklist for the day this becomes commercially active. |
| 161 | A11y pass — get accessibility from 85 → 95+ on Lighthouse | ❌ | Item not in #147–155. Easy wins: aria-labels, heading hierarchy, link purpose, color contrast on a few elements. |
| 162 | i18n / Indonesian language toggle | ❌ | Discussed conceptually. No prototype yet. |
| 163 | Search UX — replace the `<input>` placeholder with a real search results page powered by `/api/article/search` | ❌ | The endpoint exists (item 112) but the frontend listing/results page is stub. |
| 164 | Push notifications / email digests for active subscribers (the Subscribers collection exists at item 21) | ❌ | Newsletters collection is wired (#20). One-shot newsletter send works. Recurring digest doesn't. |
| 165 | Analytics — at minimum a privacy-first counter (Plausible / Umami) so we can see which content actually reads | ❌ | Currently no analytics on the public site. Lighthouse audit is a single-shot health check, not traffic data. |
| 166 | Create 3 events ad-hoc (Ubud morning / Canggu afternoon / Denpasar night, June 2026 dates) | ❌ | Spec ready in docs/perf-followups-2026-05-02.md "Bonus task" section. ~25 min wall, ~$0.15 Imagen. One-shot fulfilment from a 2026-05-02 chat ask; will be removed once executed. |

---

## Summary

| Section | Items | Status |
|---|---|---|
| A — Original 89 | 89 | 88 ✅ · 1 ⚠ (75) · 0 ❌ active · 1 🚫 (79) · 1 still-open (78) |
| B — Added since (1–6) | 57 (90–146) | 57 ✅ |
| C — Unactioned follow-ups | 9 (147–155) | 9 ❌ |
| D — Strategic / long-horizon | 11 (156–166) | 11 ❌ |
| **Total tracked items** | **166** | **145 ✅ · 1 ⚠ · 20 ❌ · 1 🚫** |

So roughly **88% complete**, with 19 items meaningfully open. Of those:
- **2 are unblocking the 90+ Lighthouse target** (147, 148)
- **2 are unblocking a usable Elliot chat** (152, 153)
- **1 is operator-UX polish** (155)
- **The other 14** are either small incremental wins or long-horizon strategic.

This file supersedes `docs/essentialbali_actions.md` as the master
inventory going forward. The original list is preserved for history
but new items should be added here.
