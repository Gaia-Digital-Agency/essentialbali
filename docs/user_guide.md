# Essential Bali — User Guide

Day-to-day operator guide. **How to use the app**, not how to deploy or run it.

Audience: you (the editor) sitting in front of the admin every day.

---

## Where to log in

```
https://essentialbali.gaiada.online/admin
```

Credentials are in the team password manager. The first time you land you'll
see the **Matrix Dashboard** — an 8 areas × 8 topics grid showing how many
published, approved, pending-review, and draft articles each (area, topic)
cell holds. The number on each cell is your at-a-glance progress toward the
1,280-article (8×8×20) target.

Click any cell → opens the Articles list filtered to that cell.

---

## The daily flow (90% of your time)

### 1. Check what's waiting for you

Sidebar → **Articles** → filter chip **Status = Pending Review**.

Direct URL:
```
/admin/collections/articles?where[status][equals]=pending_review
```

Anything Elliot has produced overnight lands here. **Nothing in this list
is on the public site yet** — pending_review is the holding pen.

### 2. Open one article

You'll see, top to bottom:

| Field | What it is | Edit it? |
|---|---|---|
| Title | The headline. ≤ ~60 chars reads best in search results. | ✅ |
| Slug | URL segment. Auto-generated from the first title. **Locked after first save** — editing the title later does NOT regenerate it (so links stay stable). | Only edit if you really mean to break the URL. |
| Sub-title | One-sentence deck under the title. | ✅ |
| Area / Topic / Persona | The cell + voice. Persona = the byline writer (Maya / Komang / Putu / Sari). | ✅ |
| Status | The lifecycle dropdown. See "What status means" below. | ✅ |
| Hero | The 16:9 hero image (Imagen 3 generated). Stored in our GCS bucket; URL is `https://storage.googleapis.com/gda-essentialbali-media/...` | Replace by uploading a new file. |
| Body | The article body in the Lexical rich-text editor. | ✅ — heaviest editing happens here. |
| SEO group | meta_title (≤60), meta_description (≤160), keywords. Auto-filled by the SEO agent on save when blank. | ✅ |
| Source group | url, site, hash. The hash is Elliot's idempotency key — see the FAQ. | Don't touch unless you know why. |

### 3. Three actions you can take

**(a) Approve** — flip Status to **Approved** and save.

* The Web Manager picks it up, sets `publishedAt`, flips Status to
  **Published**.
* Within seconds the article is live at
  `https://essentialbali.gaiada.online/{area}/{topic}/{slug}`.
* It joins `sitemap-articles.xml` automatically (Google sees it on the
  next crawl).

**(b) Edit and Save** — Status stays **Pending Review**, your edits are
preserved, the article is hash-locked so Elliot will not retry the same
brief and overwrite you.

**(c) Reject + Delete** — top-right trash icon → confirm.

* Path B in the dispatch system: deleting clears the hash. Next time
  Elliot is dispatched with the same brief, a fresh draft is produced
  from scratch.
* Use this when the draft is unsalvageable (wrong angle, banned phrases,
  factually off, persona mismatch, etc.).

> If you only want to flag "this is bad, try again" without losing the
> audit trail, set Status to **Rejected** instead. Hash is freed,
> Elliot will re-draft on the next dispatch, and you keep the original
> visible filterable by Status = Rejected.

### 4. What status means

| Status | What it means | Visible publicly | Counted toward 1,280 target |
|---|---|---|---|
| Draft | You created it manually but haven't sent for review | No | No |
| Pending Review | Elliot produced it, waiting for you | No | No |
| Approved | You said yes, Web Manager hasn't promoted yet | No | No |
| Published | Live on the public site | Yes | Yes |
| Rejected | You said no — keeps record, frees hash | No | No |

### 5. Banned-phrase guard

Elliot scans for AI-cliché phrases (delve, tapestry, hidden gem, bustling,
in the realm of, navigate the landscape, unveil, embark on a journey,
testament to, a myriad of, it goes without saying, game-changer).

If any are detected on a draft, the dispatch result includes
`banned_phrases_found`. The human reviewer (you) should reject + redraft.

---

## Ask Elliot to write a new article

Two ways:

### A. Via the chat at /admin/elliot

Sidebar → **AI agent → Talk to Elliot**.

You can ask Elliot questions about the production matrix, what's in flight,
what's been published. The chat is conversational — it reads from the
Payload data so its answers are live.

### B. Trigger a dispatch (SSH or via Elliot in the future)

Today this is a one-line on the agent host:

```
ssh gda-ai01 'echo "{\"area\":\"canggu\",\"topic\":\"dine\",\
\"persona\":\"maya\",\"brief\":\"three honest warungs in Canggu\",\
\"target_words\":600}" | node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs'
```

Required fields in the JSON: `area`, `topic`, `persona`, `brief`.

Optional: `target_words`, `research_url` (seed crawler), `skip_imager` (for
faster smoke tests).

The article appears in **Pending Review** within ~30 seconds.

### Hash lock — what happens on a re-run

Elliot computes `sha256(area | topic | brief | research_url)` and stores
it on the article as `source.hash`. If you dispatch the SAME brief again:

| Existing article matching the hash | What happens |
|---|---|
| Pending Review / Approved / Published | **Blocked** — Elliot returns `skipped_hash_locked`. Stops you from making accidental duplicates. |
| Rejected | Allowed — fresh draft produced. |
| Article was deleted | Allowed — fresh draft produced. (Path B) |

---

## Hero ads grid (the 64 ad slots)

Sidebar → **Collections → Hero Ads**.

You see an 8 × 8 grid — one cell per (area × topic). Each cell shows:

* A green dot + **ACTIVE** label when the ad is live.
* A grey dot + **Placeholder** label when the cell shows the default
  "Ads space > {Area} > {Topic}" text on the public site.
* The client name (if you've set one).
* A thumbnail of the creative (if uploaded).
* A small **edit →** link in the corner that opens the full detail page
  (so you can set client name, upload creative image, set start/end dates).

**One click on a cell** flips active / inactive. The change saves
immediately (optimistic UI — if the save fails it reverts and shows an
error bar).

---

## Newsletters

Sidebar → **Collections → Newsletters**.

Top of page shows a quick stats card (active subscribers count) and a
"Compose new" button.

To send:

1. Click **Create new** (or **Compose new** if visible).
2. Fill subject + body (rich text).
3. Set Status = **Sending** and save.
4. The system queues + sends to all active subscribers via the Gmail API
   (sender = `ai@gaiada.com`, reply-to = the newsletter's `replyTo` if set).
5. Status auto-flips to **Sent** when delivery is complete; failed
   recipients are listed in the entry.

Don't manually flip Status to "Sent" yourself.

---

## Subscribers

Sidebar → **Collections → Subscribers**.

* New subscriptions arrive automatically when someone uses the
  "Subscribe" form on the public site footer.
* `active = true` means receive newsletters; `false` means unsubscribed
  but kept for audit.
* You can flip `active` manually if a recipient asks to opt out via email.
* Export the full list with the **Export** button (CSV) when you need it
  for a third-party tool.

---

## Advertise inquiries (Footer "Advertise With Us" form)

Inquiries are sent as email to `info@gaiada.com` (rate-limited to 4 per
hour per IP to avoid spam). Nothing is stored in Payload — fire-and-forget.
You handle them in your inbox.

---

## Public-site quick reference

| URL | What |
|---|---|
| `https://essentialbali.gaiada.online/` | Home (hero rotation, trending, most popular) |
| `/{area}` | Area landing page (e.g. `/canggu`) |
| `/{area}/{topic}` | Topic-within-area listing (e.g. `/canggu/dine`) |
| `/{area}/{topic}/{slug}` | Individual article |
| `/sitemap.xml` | Index → points to areas / topics / articles sub-sitemaps |
| `/robots.txt` | Allow Googlebot etc. |
| `/api/advertise` | Public POST endpoint (the Advertise modal hits this) |

`https://www.essentialbali.com/` and `https://essentialbali.com/` serve the
same site (same nginx config, same Payload + Vite SSR backends).

---

## Talk to Elliot — what it can do

`/admin/elliot` is a chat surface backed by Vertex Gemini 2.5 Flash with
read access to your Payload data. It's good at:

* "How many published articles do we have for Canggu?"
* "Which areas have zero approved articles?"
* "Summarize what's in pending review right now."
* "What did the last dispatch produce?"

It's NOT a write surface — it cannot publish, delete, or edit anything.
For that, you click in the admin yourself or run the dispatch script.

---

## Agent skills reference

### One-line summary — Elliot + 6 agents = 39 skills

(Was billed as ~37 in earlier notes — actual current count is 39 after
plan-wave + dispatch-article landed live and Scraper picked up its
helpers.)

| # | Who | What they can do | Skills |
|---|---|---|---:|
| 1 | **Elliot** (orchestrator) | Plans content waves, dispatches the chain, gates quality before submit | 5 |
| 2 | **Copywriter** | Drafts article body in one of 4 personas (maya / komang / putu / sari), banned-phrase guarded | 4 |
| 3 | **SEO** | Meta title (≤60), meta description (≤160), keywords, internal-link anchors, JSON-LD schema | 5 |
| 4 | **Imager** | Hero image (16:9) + inline images (1:1) via Imagen 3, with auto alt-text | 4 |
| 5 | **Web Manager** | Bridge to Payload — submit, upload media, link hero, toggle hero-ads, fetch status, list pending | 7 |
| 6 | **Crawler** | Research from 4 benchmark Bali sites (honeycombers, whatsnew, nowbali, balibible), 1 req/s, robots.txt respected, never republishes | 4 |
| 7 | **Scraper** | Reads xlsx tracker + Google Docs deterministically (no LLM); fetches, parses listings, extracts articles + JSON-LD, geocodes places | 10 |

**Total: 39 skills** across 7 entities. Detail below.

All 7 agents and what each skill does, marked **🟢 LIVE** when verified
end-to-end or **🟡 scaffolded** when documented but not yet wired.

### 🟢 Elliot — orchestrator

Workspace: `/opt/.openclaw-ess/workspace-main/`
Model: Anthropic Claude Haiku 4.5, fallback Vertex Gemini 2.5 Flash

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `plan-wave` | 🟢 LIVE | `node workspace-main/scripts/plan-wave.mjs [--limit=N] [--execute] [--dry-run] [--gap=SECONDS]` | Reads Payload counts per (area, topic), computes deficit vs 20-per-cell target, picks persona + brief from rotating templates, emits prioritised dispatch queue. With `--execute` runs the queue at 1/min default with retry. |
| `dispatch-article` | 🟢 LIVE | `echo '{...}' \| node workspace-main/scripts/dispatch-article.mjs` | Full chain: copywriter → seo → imager → web-manager. Hash-locked (Path B). |
| `review-gate` | 🟡 scaffolded | (in-script in dispatch) | Pre-flight checks before submit: word count, persona match, hero present, SEO non-empty, banned-phrase scan, source.hash dedupe. Currently runs as part of `dispatch-article`; not exposed as a standalone skill. |
| `status-report` | 🟡 scaffolded | — | Per-cell summary (published / approved / pending_review / draft). Available data via Payload `/api/articles?where[status][...]&limit=0`; no dedicated skill yet. |
| `maintenance-pass` | 🟡 scaffolded | — | Find stale Events past their date or News > 30 days old, queue refreshes. Not built yet. |

### 🟢 Copywriter — drafts article bodies

Workspace: `/opt/.openclaw-ess/workspace-copywriter/`
Model: Vertex Gemini 2.5 Flash (response bound to JSON schema)

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `draft-article` | 🟢 LIVE | `echo '{"area":"...","topic":"...","persona":"...","brief":"..."}' \| node workspace-copywriter/scripts/draft-article.mjs` | Drafts title + body_markdown + sub_title + meta + sources, in the chosen persona's voice. |
| `rewrite-article` | 🟡 scaffolded | — | Pass `{article, instruction}` and re-prompt. Today: re-run `draft-article` with brief = original + instruction. |
| `regenerate-title` | 🟡 scaffolded | — | Produce 5 alternative titles. Today: re-prompt with low temperature for title-only JSON. |
| `persona-check` | 🟡 scaffolded | — | Score voice match 0–10 against persona guidelines. Owned by Elliot post-draft. |

**Personas (voice presets):**
- **maya** — local foodie. Warm, sensory. Names ingredients specifically.
- **komang** — activities + wellness. Practical, calm, safety-aware.
- **putu** — cultural insider. Italicises Balinese terms on first use.
- **sari** — nightlife + events. Energetic, short paragraphs, names DJs/dates.

**Banned-phrase blocklist** (regex enforced in-script):
`delve`, `tapestry`, `hidden gem`, `bustling`, `in the realm of`,
`navigate the landscape`, `unveil`, `embark on a journey`, `testament to`,
`a myriad of`, `it goes without saying`, `game-changer`.

### 🟢 SEO — meta + keywords + schema

Workspace: `/opt/.openclaw-ess/workspace-seo/`
Implementation: `cms/src/lib/seo-agent.ts` (single source of truth)
Model: Vertex Gemini 2.5 Flash

Single source — same `optimizeSeo()` function is used by:
- `Articles.beforeChange` hook (in-process, when you save an article with empty SEO fields)
- HTTP service `POST /api/seo-optimize` (called by Elliot's `dispatch-article`)

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `optimize-meta` | 🟢 LIVE | `POST https://essentialbali.gaiada.online/api/seo-optimize` (JWT auth) with `{area, topic, title, bodyText?, subTitle?, existingMetaTitle?}` | Returns `meta_title` (≤60), `meta_description` (≤160), `internal_link_anchors[]`. |
| `keyword-research` | 🟢 LIVE | same endpoint | Returns `primary_keyword` + `long_tail_keywords[]` as part of optimize-meta output. |
| `schema-markup` | 🟢 LIVE | (auto-generated server-side from article fields) | Schema.org Article JSON-LD emitted at render time on the public page. |
| `internal-link` | 🟢 LIVE | same endpoint | Returns `internal_link_anchors[]` (3–5 short noun phrases for inbound link bait). |
| `competitor-gap` | 🟡 scaffolded | — | Diff what benchmarks rank for vs us. Crawler feeds the data; SEO ranks gaps. |

### 🟢 Imager — hero + inline images

Workspace: `/opt/.openclaw-ess/workspace-imager/`
Model: Vertex Imagen 3 (`imagen-3.0-generate-002`)

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `generate-hero` | 🟢 LIVE | `echo '{"area":"...","topic":"...","title":"...","summary":"..."}' \| node workspace-imager/scripts/generate-hero.mjs` | One 16:9 hero image (Imagen native ~1408×768). Per-area visual cues + per-topic composition cues + persona hint. Auto-uploads to GCS via `/api/media`. |
| `generate-inline` | 🟢 LIVE | same script with `--inline=N` (max 4) | N square 1024×1024 inline images, varied compositions. |
| `regenerate` | 🟡 scaffolded | — | Re-call generate-hero with extra `--negative` and adjusted summary based on operator feedback. |
| `alt-text` | 🟢 LIVE | (auto-generated per file) | `{title} — {area} {topic} editorial photograph` written automatically to media doc. |

**Visual standards:**
- Photographic, editorial — never stock-photo cliché.
- Always includes the area name in the prompt for visual specificity.
- Negative prompt blocks watermarks, logos, text overlays, blurry, low quality.
- No close-up faces of people unless explicitly requested.

### 🟢 Web Manager — bridge to Payload

Workspace: `/opt/.openclaw-ess/workspace-web-manager/`
Auth: JWT login at `https://essentialbali.gaiada.online/api/users/login` as `elliot@gaiada.com`

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `submit-article` | 🟢 LIVE | `POST /api/articles` with `Authorization: JWT <token>` | Idempotent submit via `source.hash`. Always sets `status: "pending_review"`. |
| `upload-media` | 🟢 LIVE | `POST /api/media` (multipart) | Uploads file to GCS bucket `gda-essentialbali-media`, returns Payload media doc with public GCS URL. |
| `link-hero` | 🟢 LIVE | `PATCH /api/articles/{id}` with `{hero: mediaId}` | Sets `Article.hero` to the uploaded media. |
| `submit-comment` | 🟢 LIVE | `POST /api/comments` | Used by Elliot if it generates persona-style first-comment seed. |
| `toggle-hero-ad` | 🟢 LIVE | `PATCH /api/hero-ads/{id}` with `{active: bool}` | Flip an ad slot (you do this via the Hero Ads grid; agent can do it programmatically). |
| `fetch-status` | 🟢 LIVE | `GET /api/articles/{id}` | Read the current status. |
| `list-pending-review` | 🟢 LIVE | `GET /api/articles?where[status][equals]=pending_review` | What's in your review queue. Drives Elliot's status-report. |

### 🟢 Crawler — benchmark research

Workspace: `/opt/.openclaw-ess/workspace-crawler/`
Sources: thehoneycombers.com/bali · whatsnewindonesia.com · nowbali.co.id · thebalibible.com
Manners: `EssentialBaliBot/1.0` user-agent, 1 req/s rate limit, robots.txt respected, **research only — never republished**.

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `discover` | 🟢 LIVE | `node workspace-crawler/scripts/crawl-benchmark.mjs --discover --site=... --area=... --topic=...` | List up to 10 candidate URLs from one of the 4 benchmark sites for a given (area, topic). |
| `analyze` | 🟢 LIVE | `node workspace-crawler/scripts/crawl-benchmark.mjs <url>` | Fetch one URL, extract title + h1/h2/h3 + paragraphs + hero image + outbound links + word count. JSON to stdout. |
| `trend-scan` | 🟡 scaffolded | — | Merge candidates across all 4 sources, sort by recency. Useful for "what's getting written about Bali this week." |
| `gap-report` | 🟡 scaffolded | — | What benchmarks cover that we don't (cell-level). Pairs with SEO `competitor-gap`. |

### 🟢 Scraper — deterministic data extraction

Workspace: `/opt/.openclaw-ess/workspace-scraper/`
Stack: Python venv with `openpyxl`, `requests`, `bs4`. No LLM.

| Skill | Status | Invocation | What it does |
|---|---|---|---|
| `read-articles-xlsx` | 🟢 LIVE | `python3 workspace-scraper/scripts/read-articles-xlsx.py [--month=Apr] [--status=draft]` | Parse the `Essential Bali Proofread.xlsx` tracker → JSON list of rows ready to ingest. |
| `pull-xlsx-from-drive` | 🟢 LIVE | `python3 workspace-scraper/scripts/pull-xlsx-from-drive.py` | Download the xlsx from Drive (auto-exports Google Sheets). Replaces the local rsync bridge. |
| `read-google-doc` | 🟢 LIVE | `python3 workspace-scraper/scripts/read-google-doc.py <doc-url>` | Fetch a shared Google Doc body as Markdown. (Doc must be shared with `ai@gaiada.com`.) |
| `check-doc-access` | 🟢 LIVE | `python3 workspace-scraper/scripts/check-doc-access.py` | Per-row report of which Draft Links are reachable for `ai@gaiada.com` and which still need sharing. |
| `process-inbox` | 🟢 LIVE | `python3 workspace-scraper/scripts/process-inbox.py [--pull] [--month=Apr] [--status=draft]` | End-to-end: optionally refresh xlsx from Drive, parse rows, fetch each Draft Link's body if accessible, emit one record per row with `body_source ∈ {"draft","metadata"}`. **Never skips a row** — falls back to xlsx metadata when the Doc isn't shared yet. |
| `fetch` | 🟢 LIVE | (helper used by other scripts) | HTTP GET with proper UA + rate limit + retry. |
| `extract-article` | 🟢 LIVE | (helper) | title, dateline, body, hero, author, tags from arbitrary HTML. |
| `extract-listing` | 🟢 LIVE | (helper) | List items per CSS/XPath selectors. |
| `extract-jsonld` | 🟢 LIVE | (helper) | Pull all Schema.org JSON-LD blobs. |
| `geocode` | 🟢 LIVE | (helper) | Area/place name → lat/lng (Google Geocoding API, cached aggressively). |

---

## Quick command cookbook

```bash
# See what plan-wave WOULD do (no side effects)
ssh gda-ai01 'node /opt/.openclaw-ess/workspace-main/scripts/plan-wave.mjs --limit=10'

# Fire 5 dispatches, 60s pacing, lands in pending_review
ssh gda-ai01 'node /opt/.openclaw-ess/workspace-main/scripts/plan-wave.mjs --execute --limit=5'

# One-off article in canggu / dine, foodie persona
ssh gda-ai01 'echo "{\"area\":\"canggu\",\"topic\":\"dine\",\"persona\":\"maya\",\
\"brief\":\"three honest warungs in Canggu\"}" | \
  node /opt/.openclaw-ess/workspace-main/scripts/dispatch-article.mjs'

# Crawl one benchmark URL for research
ssh gda-ai01 'node /opt/.openclaw-ess/workspace-crawler/scripts/crawl-benchmark.mjs \
  https://thehoneycombers.com/bali/best-warungs-canggu/'

# Refresh xlsx tracker from Drive + extract rows
ssh gda-ai01 'python3 /opt/.openclaw-ess/workspace-scraper/scripts/process-inbox.py --pull'

# Check which Draft Links still need to be shared with ai@gaiada.com
ssh gda-ai01 'python3 /opt/.openclaw-ess/workspace-scraper/scripts/check-doc-access.py'
```

---

## FAQ

**Q. Where do AI-generated images go?**
GCS bucket `gda-essentialbali-media`, public-read. The article body
references `https://storage.googleapis.com/gda-essentialbali-media/...`
URLs directly — Payload doesn't serve image bytes itself.

**Q. I deleted an article — is the image also deleted?**
Yes. The Payload media collection is wired to the GCS adapter; deleting
the media doc deletes the GCS object too.

**Q. What's `source.hash`?**
sha256 of (area + topic + brief + research_url), truncated to 16 chars.
Elliot uses it to detect duplicates. **Don't edit it manually.**

**Q. Can I dispatch the same brief twice?**
Only if the previous output is no longer in `pending_review`, `approved`,
or `published`. Otherwise it's blocked. Delete or set to Rejected to
unblock. (See the hash-lock table.)

**Q. Where do I see what Elliot is currently doing?**
`/admin/elliot` shows agent statuses (live / scaffolded / wip) and the
production matrix. Per-dispatch logs aren't surfaced in the UI yet —
ssh into `gda-ai01` and `tail -f /opt/.openclaw-ess/logs/*` if you need
trace output.

**Q. The site looks broken / unstyled. What now?**
Try a hard refresh first (`Cmd-Shift-R`). 90% of the time it's a stale
cached asset from a previous deploy. If still broken in incognito,
something on the server side has actually broken — escalate.

**Q. Banned phrases keep slipping through. Can I add to the blocklist?**
Yes — edit `BANNED` regex in
`/opt/.openclaw-ess/workspace-copywriter/scripts/draft-article.mjs` and
in `cms/src/collections/Articles.ts` if you want a server-side guard
on the save path.

**Q. Where does the email "From" address come from?**
`ai@gaiada.com` for everything Payload sends (the Gmail API OAuth was
authorized as that user). To send AS another address, re-authorize the
OAuth as that user.

**Q. Where does the Drive xlsx tracker live?**
`Essential Bali — Elliot Inbox` Google Drive folder. Share it with
`ai@gaiada.com` (Editor) once and Elliot can read every doc inside.

---

## Done. That's the whole loop

1. Open admin → matrix dashboard.
2. Filter Articles by Pending Review.
3. Read, decide: approve / edit / reject / delete.
4. Once a day, dispatch Elliot for the next batch (or schedule it).
5. Repeat until all 64 cells have ~20 published articles each.

The deploy details, server topology, agent internals, and credential
plumbing are all in `README.md` (root) and `cms/README.md`. This file
intentionally avoids them.
