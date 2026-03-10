/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// ─── Content Security Policy ──────────────────────────────────────────────────
// Adjust connect-src and script-src domains to match your deployed backend URL.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *.gstatic.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com fonts.googleapis.com;
  img-src 'self' blob: data:;
  font-src 'self' data: fonts.gstatic.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'} ${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000'} *.google.com;
  frame-src 'self' *.google.com;
  worker-src 'self' blob:;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    // INTERNAL_API_URL is server-only (no NEXT_PUBLIC_ prefix).
    // It must be the absolute URL of the NestJS backend.
    // The browser uses NEXT_PUBLIC_API_URL=/api which hits this proxy.
    const backendOrigin =
      process.env.INTERNAL_API_URL ?? 'http://localhost:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Silence next-pwa workbox warnings in build output
  webpack(config) {
    return config;
  },
};

module.exports = withPWA(nextConfig);
