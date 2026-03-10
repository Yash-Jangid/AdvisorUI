'use client';

import { useCallback, useEffect, useRef } from 'react';
import { ClientRateLimiter } from '@/lib/security/rate-limiter';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

// ─── useRateLimiter ───────────────────────────────────────────────────────────
// Provides a per-component rate limiter instance backed by ClientRateLimiter.
// When NEXT_PUBLIC_RATE_LIMITER_ENABLED=false, checkLimit always returns true.
//
// Usage:
//   const { checkLimit, getRemainingMs } = useRateLimiter();
//   const allowed = checkLimit('place-prediction', { maxRequests: 3, windowMs: 60_000 });
//   if (!allowed) toast.error(`Rate limited. Try again in ${getRemainingMs('place-prediction')}ms`);

export function useRateLimiter() {
  // One limiter instance per component mount — not shared across components
  const limiterRef = useRef<ClientRateLimiter | null>(null);

  if (limiterRef.current === null) {
    limiterRef.current = new ClientRateLimiter();
  }

  // Cleanup stale windows every minute
  useEffect(() => {
    const interval = setInterval(() => {
      limiterRef.current?.cleanup();
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const checkLimit = useCallback(
    (key: string, opts?: RateLimitOptions): boolean => {
      return limiterRef.current!.checkLimit(key, opts);
    },
    []
  );

  const getRemainingMs = useCallback((key: string): number => {
    return limiterRef.current!.getRemainingMs(key);
  }, []);

  return { checkLimit, getRemainingMs };
}
