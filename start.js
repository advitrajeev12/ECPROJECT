// Railway single-service launcher.
//
// Runs BOTH processes inside one container:
//   • Express API + admin panel  → internal port 5001 (NOT public)
//   • Next.js client             → public port $PORT (Railway routes here)
//
// This layout is deliberate: the client's next.config rewrites and its
// server-component fetches both target localhost:5001, so the API must live in
// the same container at that exact port. Don't change API_PORT unless you also
// update client/next.config.mjs and the server-component fetch fallbacks.
const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const PUBLIC_PORT = process.env.PORT || '3000';      // Railway injects PORT
const API_PORT = process.env.API_PORT || '5001';     // internal only

let shuttingDown = false;

function run(name, cmd, args, cwd, extraEnv) {
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[launcher] "${name}" exited (code=${code}, signal=${signal}). Stopping container so Railway restarts it.`);
    shuttingDown = true;
    process.exit(code == null ? 1 : code);
  });
  child.on('error', (err) => {
    console.error(`[launcher] failed to start "${name}": ${err.message}`);
    process.exit(1);
  });
  return child;
}

// 1. Express API on the fixed internal port.
const server = run(
  'server',
  process.execPath, // node
  ['index.js'],
  path.join(root, 'server'),
  { PORT: API_PORT, NODE_ENV: 'production' }
);

// 2. Next.js client on the public port. Bind 0.0.0.0 so Railway can reach it.
const nextBin = path.join(root, 'client', 'node_modules', '.bin', 'next');
const client = run(
  'client',
  nextBin,
  ['start', '-p', PUBLIC_PORT, '-H', '0.0.0.0'],
  path.join(root, 'client'),
  { NODE_ENV: 'production', PORT: PUBLIC_PORT }
);

// Forward termination so both children die with the container.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    shuttingDown = true;
    server.kill(sig);
    client.kill(sig);
    process.exit(0);
  });
}
