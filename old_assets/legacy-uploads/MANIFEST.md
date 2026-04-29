# Legacy uploads (pre-Payload, pre-GCS)

73 image files (~13 MB) from the original MySQL-era article system.
Articles in the old MySQL `essentialbali` DB referenced these via local
URLs like `/uploads/img_1234.webp`.

Today: every article is in Postgres + Payload, every image is in the
GCS bucket `gda-essentialbali-media`. New uploads NEVER land here.

## Why kept on disk

- Express still serves `/uploads/*` via a symlink
  (`backend/uploads -> ../old_assets/legacy-uploads`). If any old
  article body references a `/uploads/` URL we forgot about, it'll
  still resolve.
- File system safe to delete entirely once we have audited every
  published Payload article body for `/uploads/` references and
  re-pointed them at GCS URLs.

## How to safely delete

1. Audit Payload articles for `/uploads/` in body / hero / gallery.
2. Re-upload referenced images to GCS via `/api/media` + PATCH article.
3. Once nothing references `/uploads/` anymore, `rm -rf old_assets/legacy-uploads`
   and remove the `express.static('/uploads', ...)` mount in `backend/app.js`.

This file is here so future me / future you knows what these are.
