# Essential Bali — Actions

1. Fix /sitemap.xml 500 (defensive guards on missing taxonomy fields)
2. Fix robots.txt — Sitemap line uses https://
3. Add root README.md documenting structure + architecture
4. Document Postgres schema in README (Phase D plan)
5. Provision Postgres database `essentialbali_db` and user `essentialbali_user`
6. Payload v3.84.1 scaffold with 10 collections (Users, Areas, Topics, Personas, Articles, Media, Comments, Tags, HeroAds, Subscribers)
7. Seed 8 areas, 8 topics, 4 personas, 64 hero ad placeholders, super_admin user
8. Seed 64 article placeholders (1 per area×topic, status=draft)
9. Floating Back-to-Top + initial Ask AI buttons on legacy frontend
10. Footer "Admin" link
11. Archive 132 legacy media to old_assets/ + manifest.tsv
12. Payload login-hint card on /admin/login (NEXT_PUBLIC_SHOW_LOGIN_HINT)
13. Phase E cutover — full Payload Next.js stack on port 4008
14. Path-aware nginx routing (/admin, /_next, Payload /api/* → :4008; rest → :8082)
15. Initial Talk-to-Elliot view in /admin
16. Sidebar nav link "Channels → Talk to Elliot"
17. MatrixDashboard 8×8 as admin home
18. ArticlesMatrixFilter (matrix + status chips above Articles list)
19. NewslettersIntro panel (stats + compose CTA + how-to)
20. Newsletters collection + send-on-save workflow (status=Sending → beforeChange dispatch)
21. Subscribers / Newsletters separation; Subscribers list cleanup
22. Hide unused collections from admin nav (Users, Media, Personas, Comments, Tags, Areas, Topics)
23. Dark-theme tokens migrated across all custom admin components
24. Ask-Elliot popup widget on legacy public frontend
25. AreaMenuPanel switched from grid to one-line flex layout
26. Header logo bottom margin (pt-5 pb-7 md:pb-10)
27. Remove tracked node_modules symlinks
28. Merge dev → main (Phase E cutover landing)
29. 504 hang fix — skipVerify: true on Payload nodemailer adapter
30. ai-agent role + JWT login for Elliot — CRUD verified on Articles, HeroAds, Subscribers, Newsletters
31. /api/ai-chat route (Vertex Gemini 2.5, Elliot persona, Redis rate limit, prompt-injection guard)
32. /signin + /signup → 410 Gone (legacy admin retired)
33. Favicon on /admin browser tab + app/icon.png Next.js convention
34. Initial .openclaw-ess scaffold (Elliot orchestrator + 6 sub-agent workspaces)
35. workspace-main HEARTBEAT / MEMORY / TOOLS / USER files
36. openclaw-ess README — Payload contract examples + Vertex wiring docs
37. Mission Control gateway service on gda-ai01:19290 + browser pairing approved
38. ess.gaiada0.online DNS + Let's Encrypt cert + nginx
39. Vertex AI key copied from /var/www/gaiadaweb to /opt/.openclaw-ess/credentials/
40. Gateway runtime artifacts (agents/, canvas/, completions/) after first start
41. Google Doc fetching — OAuth token reused from /var/www/gdrive (ai@gaiada.com)
42. workspace-scraper/scripts/read-google-doc.py — Markdown export of Doc bodies
43. workspace-scraper/scripts/check-doc-access.py — per-doc share status report
44. workspace-scraper/scripts/pull-xlsx-from-drive.py — replaces local rsync
45. workspace-scraper/scripts/process-inbox.py — end-to-end pipeline, never skips a row
46. Drive folder pattern documented in openclaw-ess README ("Essential Bali — Elliot Inbox")
47. workspace-crawler/scripts/crawl-benchmark.mjs (Node fetch, robots.txt, 1 req/s, EssentialBaliBot UA)
48. workspace-scraper/scripts/read-articles-xlsx.py — openpyxl reader of the tracker xlsx
49. workspace-main/SKILL-CRAWL-BENCHMARK.md — orchestration sequence
50. workspace-main/SKILL-READ-INBOX.md — orchestration sequence for xlsx ingestion
51. bridge/sync-articles-inbox.sh moved to openclaw-ess repo
52. Local README mirror at /Users/rogerwoolie/downloads/essentialbaliNopenclaw
53. Dev branch fully retired (remote + local + worktree); main-only workflow
54. PM2 essentialbali-cms cwd flipped to main worktree (/var/www/essentialbali/cms)
55. essentialbali README rewrite (single-domain architecture, admin features, branch model)
56. openclaw-ess README rewrite (agent skills table, two ingestion paths, credentials provenance)
57. Talk-to-Elliot view rewritten with real skill depth (agent picker + skills + signatures + statuses)
58. Skill summary visible in /admin/elliot (production matrix card + 7 agent cards)
59. Advertise With Us — replace mailto with form (AdvertiseModal.tsx)
60. /api/advertise route (Gmail API + Redis rate limit + IP capture + reply-to)
61. Gmail SMTP path retired — switched to Gmail API via OAuth refresh token
62. cms/src/lib/gmail-api.ts helper (token refresh, MIME multipart, base64url encode)
63. SMTP env vars rotated to GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN
64. Footer wired to AdvertiseModal (button + state + modal mount)
65. Smoke test: real ad-inquiry email delivered to info@gaiada.com (confirmed by user)
66. essentialbali.com — apex A record set to 34.124.244.233 (Damian)
67. essentialbali.com — www A record added at Hostinger
68. essentialbali.com — AAAA Hostinger IPv6 record removed at Hostinger
69. certbot --nginx -d essentialbali.com -d www.essentialbali.com (after DNS propagates)
70. Article seo.metaTitle auto-fill from title when AI agent submits empty
71. HeroAds 64-cell visual editor (mirror MatrixDashboard with active toggle + creative slot)
72. Sitemap split — sitemap-index.xml + sitemap-areas.xml + sitemap-topics.xml + sitemap-articles.xml
73. Payload media adapter switched to GCS bucket gda-s01-bucket (path: essentialbali/uploads/)
74. Decommission SendGrid creds in /var/www/gaiadaweb/.env (key exhausted, replaced by Gmail API)
75. Drop legacy MySQL essentialbali database after backup snapshot
76. Pin first-run article output — lock slug + verify homepage hero/sitemap reflect it
77. Smoke test full agent pipeline — Elliot crawler → 1 article → Payload pending_review → published → on homepage
78. Share Drive folder "Essential Bali — Elliot Inbox" with ai@gaiada.com (unblocks 8 draft Doc fetches)
79. Promote 8 placeholder articles to status=published once Elliot has filled bodies (Wave 1 seed)
