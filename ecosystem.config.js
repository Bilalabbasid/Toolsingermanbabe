module.exports = {
  apps: [
    {
      name: 'coolwave-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      // Queue and rate limits are process-local. Multiple web instances would
      // lose jobs and multiply quotas until a shared queue/store is introduced.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1200M',
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './data/logs/pm2-err.log',
      out_file: './data/logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
