/**
 * App-wide numeric / string constants.
 *
 * Keep this file small. Anything that varies per environment goes
 * in import.meta.env.VITE_* instead.
 */

/**
 * Articles per page on /{area}/{topic} listing pages.
 *
 * Single source of truth — both the SSR fetcher
 * (`backend/src/ssr/content.fetch.js`) and the client SPA paginator
 * (`pages/Front/Templates/Directory.tsx`) import this. Before this
 * constant existed they drifted (SSR=9, client=12) which gave you
 * different first-paint vs second-page article counts.
 *
 * Design target is 20 (matches the 20-per-cell article-count goal
 * from the homepage redesign plan).
 */
export const LISTING_PAGE_SIZE = 20;

/**
 * Number of tiles in the homepage <DailyEssentials> grid.
 *   16 = 4 × 4 = 2 articles per topic × 8 topics
 *
 * The picker (`cms/scripts/pick-daily-feed.mjs`) writes up to this
 * many slots per day. The frontend grid shrinks-and-centres when
 * the actual count is lower.
 */
export const DAILY_ESSENTIALS_SIZE = 16;
