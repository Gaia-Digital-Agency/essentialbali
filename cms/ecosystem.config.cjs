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
  ],
};
