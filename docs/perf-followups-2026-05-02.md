# Site follow-ups — captured 2026-05-02 (revised)

State at capture:
- 10-item perf series complete (commits `48cec03` through `a92c712`).
- Lighthouse mobile 67 / desktop 72. Target 90+ not hit.
- Reports: `/Users/rogerwoolie/Downloads/essentialbaliNopenclaw/lighthouse-2026-05-02-post-perf-series/`.
- Two Elliot UX gaps surfaced today: chat panel can't actually do
  things (#6/#7/#8), Imager Gallery refresh broken + 24-image dump
  too noisy (#9).

These nine are queued for later sessions. Each is sized so it can be
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
3. `sudo nginx -t` to validate.
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
`/etc/nginx/nginx.conf` and verify all 3 vhosts come up.

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

**Steps.**
1. `grep -rn "react-quill\|<Quill\|Quill.register" frontend/src` to
   confirm zero JS-level Quill usage.
2. Delete the two `import "react-quill-new/dist/...css"` lines from
   `AppLayout.tsx`.
3. Also remove the `.ql-*` class definitions in `frontend/src/index.css`
   (lines 1054–1063, 1322–1346).
4. Build, smoke, commit.

**Expected delta.** +2–3 perf points, –40 KB raw / –8 KB gz off the
shared CSS.

---

## 6. 🟡 Bump Elliot chat maxOutputTokens 600 → 4000

**Symptom captured 2026-05-02.** User asked Elliot in
`/admin/elliot` chat: "Cam you create three events. One Morning For
People & Culture, One Afternoon for Health & Fitness, One Night For
News…". Response cut off mid-sentence at "…focused on People &".

**Cause (the cosmetic half).** Vertex `generateContentResponse` at
`maxOutputTokens: 600` (`cms/src/app/(frontend)/api/ai-chat/route.ts`
line 152). 600 tokens ≈ 450 words; describing 3 events doesn't fit.

**Caveat.** Bumping tokens lets Elliot WRITE more, but does NOT
make him execute anything. See #7 + #8 for the real fix.

**Fix.** Change `maxOutputTokens: 600` → `maxOutputTokens: 4000`.
That's it. One line.

**Expected outcome.** Long answers complete instead of truncating.
Latency increases by 1–3 seconds on multi-paragraph answers; fine.

**Files.** `cms/src/app/(frontend)/api/ai-chat/route.ts`.

---

## 7. 🔴 Add "Execute" button to Elliot chat for content creation

**Symptom captured 2026-05-02.** User asked Elliot to create 3
events. Elliot's chat described what he WOULD create, but no rows
were written to the DB. Investigation showed the `/api/ai-chat`
route is Q&A-only — it has no tool-calling, no DB writes, no
shell-out to the agent host on `gda-ai01`.

**The architectural gap.** `/admin/elliot` UI lists 39 "skills"
(dispatch-article, generate-hero, pick-daily-feed, etc.). Those are
real scripts on `gda-ai01:/opt/.openclaw-ess/workspace-*/scripts/*.mjs`
and they DO create content. But they're invoked by SSH'ing to the
agent host — NOT by the chat panel. UI says "agent", behaves like
"chatbot".

**Fix (level B from the diagnosis).** Add a structured-output mode
to the chat:
1. When user prompts with content-creation intent, Elliot returns
   JSON-structured event/article specs alongside the prose answer.
2. Below each spec, render an **Execute** button.
3. Clicking Execute POSTs the spec to a new
   `/api/ai-chat/dispatch` route in the cms.
4. That route either SSHes to gda-ai01 and runs
   `workspace-main/scripts/dispatch-article.mjs` with the spec, or
   calls a relayed REST endpoint on the agent host.
5. UI streams "creating…" status, then "✓ created article #N" with
   a link to the admin row.

Human-in-the-loop gate preserved: nothing executes without a
deliberate button click.

**Steps.**
1. Extend the prompt: ask Gemini to wrap creation specs in
   `<spec>{json}</spec>` blocks alongside its prose.
2. Parse the spec blocks in `TalkToElliotView.tsx`, render each as a
   collapsible card with an Execute button.
3. New route `cms/src/app/(payload)/api/ai-chat/dispatch/route.ts` —
   takes a spec, ssh's to gda-ai01 (re-use the deployment-key auth
   from CLAUDE.md), runs dispatch-article, streams the JSON output.
4. UI: show success/failure chip, link to the new article.

**Expected outcome.** Elliot can ACTUALLY create content from the
chat, with one human approval click per item. The user's
"create three events" prompt would render 3 cards, click each →
3 articles materialize.

**Effort.** ~2 hours.

**Files.** `cms/src/app/(payload)/api/ai-chat/dispatch/route.ts`
(new), `cms/src/components/TalkToElliotView.tsx` (extend with spec
parsing + Execute button), `cms/src/app/(frontend)/api/ai-chat/route.ts`
(prompt extension to emit spec blocks).

---

## 8. 🟡 Full Vertex tool-calling in Elliot chat (level C)

**Status.** The "real agent" version. Bigger build, bigger payoff.
Treat as a follow-up to #7 — only worth doing if #7's button-driven
flow proves too clicky for the operator.

**Idea.** Use Vertex Gemini's function-calling spec to declare
`dispatch_article`, `generate_hero`, `pick_daily_feed` etc. as tools
Gemini can call directly. Stream the tool calls back to the UI so the
operator sees "Elliot is creating event 1 of 3…" in real time.

**Steps.**
1. Define Vertex tool schemas for each agent skill (one tool per
   skill, declared in JSON schema form).
2. Replace the simple `generateContent` call in ai-chat with a
   function-calling loop: Gemini emits tool-call → server executes
   tool → result fed back into Gemini → final answer.
3. Each tool execution still goes through the same SSH-to-gda-ai01
   bridge from #7, so the human-in-the-loop gate can be kept by
   adding a `confirm: true` parameter the first time the tool is
   used in a chat session.
4. UI: render tool-call events as a timeline, with manual abort.

**Expected outcome.** Conversational agent that creates content
without per-item button clicks. Operator says "create 3 events" and
they appear; operator says "actually replace the second one" and
Elliot does.

**Effort.** ~6 hours plus a quality-control pass.

**Files.** `cms/src/app/(frontend)/api/ai-chat/route.ts` (rewrite to
function-calling loop), `cms/src/components/TalkToElliotView.tsx`
(streaming tool-event timeline UI), backend bridge to gda-ai01.

---

## 9. 🟡 Redesign Imager Gallery — fix refresh + 8 lanes × 3 images, per-lane refresh

**Symptom captured 2026-05-02.** Two issues with
`/admin/elliot` → Imager Gallery panel:
1. **Refresh button doesn't work.** ↻ button click should re-fetch
   the 24 most recent imager media; currently silently does nothing
   (or silent error).
2. **24 images dumped flat is too noisy.** Operator wants
   curation-relevant slices, not a firehose.

**Final spec (per user 2026-05-02).** Reorganise the same 24-image
budget but distributed by topic:
- **8 topic lanes × 3 images each = 24 total.**
- Lanes (one per Bali topic): Events, News, Featured, Dine,
  Health & Wellness, Nightlife, Activities, People & Culture.
- Each lane shows the 3 most recent `source=imager` media
  belonging to that topic.
- **Per-lane ↻ refresh button** (not a single global refresh) so an
  operator can refresh just the lane they care about without
  re-querying the other 7. Lighter on the API and lighter on
  Elliot's attention.
- Single global "↻ refresh all" optional, kept smaller / less
  prominent.

**Investigation steps for the refresh bug.**
1. Open browser devtools on `/admin/elliot`.
2. Click ↻ refresh, watch Network tab.
3. Confirm the GET `/api/media?where[source][equals]=imager&...`
   fires. If yes, check whether the response replaces the grid
   (likely a state-update bug in `ImagerGallery.tsx` — the
   `setRefreshTick` is wired but maybe the useEffect deps are
   stale or the component memoizes incorrectly).
4. If no fetch fires, check `onClick={refresh}` binding.

**Steps for the redesign.**
1. Rewrite `ImagerGallery.tsx` to:
   - Hardcode the 8 topic slugs:
     `[events, news, featured, dine, health-wellness, nightlife,
       activities, people-culture]`
   - For each lane, fire one query:
     `/api/media?where[source][equals]=imager
      &where[topic][equals]=<topic-slug>
      &limit=3&sort=-createdAt&depth=0`
   - Render as 8 stacked horizontal lanes. Lane header = topic name +
     ↻ refresh button + count chip ("2/3" if a lane has only 2
     images so far).
   - Drop the single "24 most recent" flat query.
2. Per-lane refresh: re-fires only that one lane's query, updates
   only that lane's state slice.
3. Click-to-preview + Copy URL behaviour unchanged (modal already
   works).
4. Empty lane state: small "no imager output yet for this topic"
   note, with a hint to trigger generate-hero for that area/topic.

**Expected outcome.** Gallery becomes a curation tool. 8 visible
slices distributed by topic; per-lane refresh keeps churn low.
Refresh actually refreshes.

**Effort.** ~30–45 min.

**Files.** `cms/src/components/ImagerGallery.tsx`.

---

## How to pick these up

When ready: `git log --grep="^perf"` for the perf series reference,
open this file, pick an item, work through the steps. Each is a
single short-lived branch + single commit.

**Priority ordering for hitting 90+ Performance + a usable Elliot
chat:**
- #1 + #2 are the path to 90+ Lighthouse. Required.
- #6 + #7 are the path to a usable Elliot chat. #6 is 5 min, #7 is
  the real fix (~2 hr).
- #9 is operator UX polish — small improvement, high satisfaction.
- #3, #4, #5, #8 are cumulative polish — schedule when convenient.
