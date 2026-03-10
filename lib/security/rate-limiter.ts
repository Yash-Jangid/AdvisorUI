'use client';

import { CONFIG } from '@/lib/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// ─── ClientRateLimiter ────────────────────────────────────────────────────────
// Token bucket rate limiter for client-side use only.
// When NEXT_PUBLIC_RATE_LIMITER_ENABLED=false this is a no-op.

export class ClientRateLimiter {
  private readonly store = new Map<string, RequestRecord>();
  private readonly enabled: boolean;

  constructor() {
    this.enabled = CONFIG.security.rateLimiterEnabled;
  }

  checkLimit(key: string, opts: RateLimitConfig = {}): boolean {
    if (!this.enabled) return true;

    const maxRequests = opts.maxRequests ?? CONFIG.rateLimit.maxRequests;
    const windowMs = opts.windowMs ?? CONFIG.rateLimit.windowMs;
    const now = Date.now();

    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) return false;

    record.count++;
    this.store.set(key, record);
    return true;
  }

  getRemainingMs(key: string): number {
    const record = this.store.get(key);
    return record ? Math.max(0, record.resetTime - Date.now()) : 0;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) this.store.delete(key);
    }
  }
}

// Singleton
export const rateLimiter = new ClientRateLimiter();
