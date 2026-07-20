// PM2 process manager config for production (Hostinger VPS).
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   # keep alive across reboots
//
// Prereqs: `pnpm install` in both server/ and client/, and `pnpm build` in client/.
module.exports = {
  apps: [
    {
      name: 'ecproject-server',
      cwd: './server',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'ecproject-client',
      cwd: './client',
      // Run the built Next.js app in production (NOT `next dev`).
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
