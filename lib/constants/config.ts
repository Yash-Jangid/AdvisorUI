// ─── App-Wide Configuration ───────────────────────────────────────────────────
// All env-driven values accessed through this module.
// Never access process.env directly outside this file.

const getEnv = (key: string, fallback = ''): string =>
  (typeof process !== 'undefined' ? (process.env[key] ?? fallback) : fallback);

export const CONFIG = {
  // ── API ─────────────────────────────────────────────────────────────────
  // Browser: relative /api is proxied by Next.js → backend:8000/api
  // Server: INTERNAL_API_URL is used directly for absolute URL required by Node.js
  apiUrl: typeof window === 'undefined' 
    ? `${getEnv('INTERNAL_API_URL', 'http://localhost:8000')}/api` 
    : getEnv('NEXT_PUBLIC_API_URL', '/api'),
  wsUrl: getEnv('NEXT_PUBLIC_WS_URL', 'ws://localhost:8000'),

  // ── App Identity ─────────────────────────────────────────────────────────
  appName: getEnv('NEXT_PUBLIC_APP_NAME', 'Advisor Cricket'),
  appShortName: getEnv('NEXT_PUBLIC_APP_SHORT_NAME', 'Advisor'),

  // ── Security Feature Flags ────────────────────────────────────────────────
  security: {
    recaptchaEnabled: getEnv('NEXT_PUBLIC_RECAPTCHA_ENABLED') === 'true',
    recaptchaSiteKey: getEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY'),
    rateLimiterEnabled: getEnv('NEXT_PUBLIC_RATE_LIMITER_ENABLED') === 'true',
    xssSanitizeEnabled: getEnv('NEXT_PUBLIC_XSS_SANITIZE_ENABLED') === 'true',
  },

  // ── Idempotency ───────────────────────────────────────────────────────────
  idempotency: {
    /** localStorage key prefix for stored idempotency keys */
    storagePrefix: 'idem_',
    /** TTL in milliseconds (24 hours) */
    ttlMs: 24 * 60 * 60 * 1000,
  },

  // ── React Query Defaults ──────────────────────────────────────────────────
  query: {
    /** Default stale time for most queries (30 seconds) */
    staleTime: 30_000,
    /** Live match data stale time (10 seconds) */
    liveStaleTime: 10_000,
    /** Retry attempts on failure */
    retryCount: 2,
  },

  // ── Rate Limiter Defaults ─────────────────────────────────────────────────
  rateLimit: {
    /** Max mutations per windowMs */
    maxRequests: 10,
    /** Window duration in ms */
    windowMs: 60_000,
  },

  // ── Pagination ────────────────────────────────────────────────────────────
  pagination: {
    defaultPageSize: 20,
    leaderboardPageSize: 50,
  },
} as const;
