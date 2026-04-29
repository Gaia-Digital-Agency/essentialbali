module.exports = {
  apps: [
    {
      name: 'essentialbali-cms',
      cwd: '/var/www/essentialbali/cms',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4008',
      env: {
        NODE_ENV: 'production',
        PORT: '4008',
      },
      max_memory_restart: '1G',
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
    //
    // Combined flags:
    //   cron_restart      : the firing schedule (server is in UTC)
    //   autorestart=false : after the script exits, do NOT immediately
    //                       restart it. The next cron tick fires it.
    //   instances=1       : single firing per tick.
    {
      name: 'essentialbali-daily-feed',
      cwd: '/var/www/essentialbali/cms',
      script: 'scripts/pick-daily-feed.mjs',
      interpreter: 'node',
      cron_restart: '0 20 * * *',
      autorestart: false,
      watch: false,
      exec_mode: 'fork',  // one-shot script — cluster mode would loop+die
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
