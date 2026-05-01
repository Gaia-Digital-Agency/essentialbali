# Performance follow-ups — captured 2026-05-02

State at capture:
- 10-item perf series complete (commits `48cec03` through `a92c712`).
- Lighthouse mobile 67 / desktop 72. Target 90+ not hit.
- Reports: `/Users/rogerwoolie/Downloads/essentialbaliNopenclaw/lighthouse-2026-05-02-post-perf-series/`.

These five are queued for later sessions. Each is sized so it can be
done independently in 30–90 minutes.

---

## 1. 🔴 Diagnose mobile LCP regression (priority)

**Symptom.** Mobile LCP went from 6.1s pre-series to 7.2s post-series
(+1.1s, **wrong direction**). TTFB also climbed 260ms → 340ms.
Expected outcome from the LCP-preload work in `5a9002a` was a 1–2s
*drop*, not a rise.

**Hypothesis.** `getInitialArticleHeroImage()` in
`backend/src/ssr/articles.fetch.js` does a Payload REST call against
`/api/hero-ads?where…&depth=2` during the SSR pass. That's blocking
the initial HTML response. The 80ms TTFB increase confirms it.
The preload `<link>` lands in the head, but only AFTER the response
has paid the cost of that synchronous Payload roundtrip.

**Investigation steps.**
1. Time the Payload call in isolation (`curl -w "%{time_total}"` on
   `/api/hero-ads?…`) to confirm it's the slow step.
2. Compare with: hero-ad query result cached in-memory for ≥30s
   (the underlying data only changes when the operator presses
   "🎲 Refresh" or edits the hero ad row).
3. If caching helps, add a tiny LRU around `getInitialArticleHeroImage`
   in `articles.fetch.js`. 30s TTL is fine; the operator can wait
   that long for a hero-ad change to surface.
4. If caching doesn't help (Payload itself is the slow part),
   consider hard-coding the homepage hero URL pattern OR pre-resolving
   it at build time and reading from a static JSON file.

**Expected delta.** Mobile Performance +10–15, mobile LCP back below
3s.

**Files.** `backend/src/ssr/articles.fetch.js` lines 216–245 (the
`getInitialArticleHeroImage` helper).

---

## 2. 🔴 Find + fix desktop CLS (priority)

**Symptom.** Desktop CLS still 1.382 — unchanged after the perf
series. Mobile CLS is 0 (fix in `48cec03` worked). Whatever's
causing desktop shift is something my DailyEssentials change didn't
touch.

**Hypothesis.** Likely candidates:
1. **HeroBanner state transitions** — the component renders a
   placeholder (no/empty hero), then mounts and fetches
   `/api/hero-ads`, then swaps in the real hero. If the placeholder
   has different height than the real hero on desktop, CLS spikes.
2. **Newsletter section**'s `<input>` and submit button mounting
   asynchronously after font swap.
3. **DailyEssentials grid resizing** — the title/subtitle line clamp
   may compute differently when fonts load on desktop than mobile.

**Investigation steps.**
1. Lighthouse desktop run → open the trace, find the layout-shift
   events, get the offending nodes from the CLS audit's
   `details.items[].node.selector`.
2. Check `HeroBanner.tsx` — confirm the wrapping `<section>` has
   `aspectRatio: "1200 / 628"` set (it does, line 159) but verify
   the parent doesn't change height on desktop.
3. Check the homepage HTML rendered statically: does it pre-reserve
   space for the HeroBanner's actual height?

**Expected delta.** Desktop Performance +10–15 once CLS drops below
0.1.

**Files.** `frontend/src/components/front/HeroBanner.tsx`,
`frontend/src/components/front/Newsletter.tsx`.

---

## 3. 🟡 Install Brotli (deferred from Perf #8)

**Status.** Skipped during Perf #8 to avoid swapping the nginx
binary mid-series on production.

**Steps.**
1. Plan a maintenance window (5 min downtime acceptable; nginx
   reload is graceful but cold-start of `nginx-extras` may differ).
2. `sudo apt install nginx-extras` (already in apt).
3. `sudo nginx -t` to validate (the `nginx-extras` binary still reads
   `/etc/nginx/nginx.conf`).
4. Add to `nginx.conf` http block:
   ```
   brotli on;
   brotli_comp_level 5;
   brotli_static on;
   brotli_types
     text/plain text/css text/xml text/javascript
     application/json application/javascript
     application/x-javascript application/xml application/xml+rss
     application/atom+xml application/wasm
     image/svg+xml font/eot font/otf font/ttf;
   ```
5. `sudo systemctl reload nginx`.
6. Verify: `curl -sSI -H "Accept-Encoding: br" /assets/vendor-misc-...js
   | grep content-encoding`.

**Expected delta.** Mobile/Desktop Performance +3–5, ~10–15% smaller
transfer than gzip.

**Risk.** `nginx-extras` is a different package; pin a backup of
`/etc/nginx/nginx.conf` and verify all 3 vhosts (`essentialbali.com`,
`subdomains.gaiada.online`, `essentialbali.com` apex) come up.

---

## 4. 🟡 Trim vendor-misc (556 KB / 165 KB gz)

**Status.** Perf #5's manualChunks split worked, but the `vendor-misc`
catch-all is now 556 KB raw. Likely contents: axios, helmet, GSAP-
react, react-helmet-async, possibly `quill` + `react-quill-new` CSS.

**Steps.**
1. Audit what's in `vendor-misc` — `vite build --mode analyze` or
   add `rollup-plugin-visualizer` for a treemap.
2. Identify large deps that:
   - Aren't actually used on the public site (Quill is the prime
     suspect — see #5)
   - Can be split further into their own chunks for parallel fetch
3. For each, either: drop the import (#5), or add another
   `manualChunks` rule.

**Expected delta.** +5–8 perf points if vendor-misc drops from
556 KB → 350 KB.

**Files.** `frontend/vite.config.ts` (manualChunks),
`frontend/src/layout/AppLayout.tsx` (the suspect Quill imports).

---

## 5. 🟢 Drop Quill CSS imports (low risk, low impact)

**Status.** Surfaced during Perf #9. `react-quill-new` is imported
*for CSS only* in `frontend/src/layout/AppLayout.tsx`:
```ts
import "react-quill-new/dist/quill.core.css"
import "react-quill-new/dist/quill.snow.css"
```
But no Quill component is rendered anywhere on the public site.
The CSS contributes maybe 30–60 KB raw / 5–10 KB gz to the bundle
without any runtime benefit.

**Steps.**
1. `grep -rn "react-quill\|<Quill\|Quill.register" frontend/src` to
   confirm zero JS-level Quill usage. (`AppLayout.tsx` should be the
   only hit, and only for the CSS imports.)
2. Delete the two `import "react-quill-new/dist/...css"` lines from
   `AppLayout.tsx`.
3. Also remove the `.ql-*` class definitions in `frontend/src/index.css`
   lines 1054–1063 and the `.ql-custom-image` / `.ql-embed-article`
   rules at 1322–1346 (they reference FontAwesome which we already
   dropped in Perf #9).
4. Build, smoke, commit.

**Expected delta.** +2–3 perf points, –40 KB raw / –8 KB gz off the
shared CSS.

**Risk.** Minimal — CSS rules with no rendering component are inert.
If a future component reintroduces Quill, the imports come back with
it.

---

## How to pick these up

When you're ready: `git log --grep="^perf"` to see the perf series
commits as reference, open this file, pick an item, work through
the steps. Each is a single short-lived branch + single commit.

The 90+ Performance target needs items 1 + 2 to land. Items 3, 4, 5
add cumulative polish but aren't critical for the headline number.
