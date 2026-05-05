/**
 * Unified PM2 ecosystem for essentialbali.
 *
 * Declares all three production processes in one file so a fresh deploy
 * needs only `pm2 start ecosystem.config.cjs` from the repo root. Was
 * previously split: the cms had its own ecosystem.config.cjs and the
 * backend Express server was started ad-hoc via `pm2 start app.js`,
 * which made it easy to drift between hosts.
 *
 * Process map:
 *   essentialbali             — Express SSR (port 8082, public-facing)
 *   essentialbali-cms         — Payload v3 / Next.js (port 4008, /admin + /api)
 *   essentialbali-daily-feed  — homepage feed picker (cron, no port)
 *
 * Used on gda-ce01 (production, post-migration). gda-s01 is being
 * decommissioned — that host's cms/ecosystem.config.cjs remains for
 * historical reference until /var/www/essentialbali on gda-s01 is
 * archived.
 */
module.exports = {
  apps: [
    {
      // Express + SSR. Reaches Payload via http://127.0.0.1:4008.
      // No SQL deps in package.json — DATABASE_* env vars in
      // backend/.env are vestigial from the legacy MySQL era.
      name: "essentialbali",
      cwd: "/var/www/essentialbali/backend",
      script: "app.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
    },
    {
      name: "essentialbali-cms",
      cwd: "/var/www/essentialbali/cms",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4008",
      env: {
        NODE_ENV: "production",
        PORT: "4008",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
    },
    // Daily homepage-feed picker — runs at 04:00 GMT+8 (= 20:00 UTC)
    // every day. Idempotent: if today's row already exists, exits 0
    // with no-op. The 4-hour offset from Bali midnight gives the
    // previous day's traffic time to settle.
    //
    // Why a separate pm2 entry rather than node-cron in-process:
    //   - the picker writes to articles + home_daily_feed tables;
    //     keeping it isolated from the long-running Next.js process
    //     means a misbehaving picker can't take down /admin
    //   - pm2 logs ('pm2 logs essentialbali-daily-feed') give a clean
    //     audit trail of every run
    //   - cron_restart fires the script and pm2 keeps the entry
    //     visible in `pm2 list` so it's discoverable
    {
      name: "essentialbali-daily-feed",
      cwd: "/var/www/essentialbali/cms",
      script: "scripts/pick-daily-feed.mjs",
      interpreter: "node",
      cron_restart: "0 20 * * *",
      autorestart: false,
      watch: false,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
