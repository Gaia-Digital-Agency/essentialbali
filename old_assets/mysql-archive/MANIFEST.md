# MySQL essentialbali — archive snapshot

Taken: 2026-04-28T04:52:34+00:00
File:  essentialbali-20260428-045228.sql.gz
Size:  84K

## Why this dump exists
Phase E cutover only rewired Payload for /admin, /api/(payload), /sitemap, /robots.
Public pages on essentialbali.gaiada.online still render via /var/www/essentialbali/backend/app.js
(Vite SSR backed by Sequelize + MySQL).

## When MySQL can be dropped
After every `backend/src/ssr/*.fetch.js` and `backend/src/services/*.service.js`
is either deleted or rewritten to call Payload REST instead of Sequelize.
Affected fetch modules: articles, locations, categories, tags, route, content.
Affected service modules: article, auth, subscription, tags, socmed, housing_property,
                          category, job_vacancy, location, setting.

## To restore
```
gunzip -c essentialbali-20260428-045228.sql.gz | sudo mysql essentialbali
```
