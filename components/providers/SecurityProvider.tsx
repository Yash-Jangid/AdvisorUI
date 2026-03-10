'use client';

import { useEffect, type ReactNode } from 'react';
import { recaptchaService } from '@/lib/security/recaptcha';
import { IdempotencyManager } from '@/lib/utils/idempotency';
import { rateLimiter } from '@/lib/security/rate-limiter';
import { CONFIG } from '@/lib/constants/config';

export function SecurityProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Load reCAPTCHA (no-op if feature is disabled)
    recaptchaService.load().catch(() => {
      // Non-fatal — reCAPTCHA may be blocked by ad blockers
    });

    // Clean up expired idempotency keys from localStorage
    IdempotencyManager.cleanup();

    // Periodic cleanup every hour
    const idempotencyInterval = setInterval(
      () => IdempotencyManager.cleanup(),
      60 * 60 * 1000
    );

    // Rate limiter cleanup every minute (only matters if enabled)
    const rateLimitInterval = CONFIG.security.rateLimiterEnabled
      ? setInterval(() => rateLimiter.cleanup(), 60_000)
      : null;

    return () => {
      clearInterval(idempotencyInterval);
      if (rateLimitInterval) clearInterval(rateLimitInterval);
    };
  }, []);

  return <>{children}</>;
}
