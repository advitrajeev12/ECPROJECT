import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '192.168.0.100', 'localhost', '127.0.0.1', '10.11.3.41', '172.20.10.2', '192.168.29.5', '0.0.0.0'],
  turbopack: {
    root: path.join(__dirname, '..'),
  },

  // ── Faster compilation ──────────────────────────────────────────────────
  // SWC-based transforms (replaces Babel) — dramatically speeds up builds

  // Reduce unnecessary rebuilds in dev
  reactStrictMode: false,

  // Optimise dev-server memory use
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 3,
  },

  images: {
    // Re-enable Next.js image optimisation (avoids sending raw 2-4 MB PNGs)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1440],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: 'http://127.0.0.1:5001/admin/:path*',
      },
      {
        source: '/admin',
        destination: 'http://127.0.0.1:5001/admin/login',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5001/api/:path*',
      },
      {
        source: '/css/:path*',
        destination: 'http://127.0.0.1:5001/css/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://127.0.0.1:5001/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
