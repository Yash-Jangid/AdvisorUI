'use client';

import { useCallback } from 'react';
import { recaptchaService } from '@/lib/security/recaptcha';

// ─── useRecaptcha ─────────────────────────────────────────────────────────────
// Thin React hook that exposes reCAPTCHA v3 token generation.
// When NEXT_PUBLIC_RECAPTCHA_ENABLED=false, getToken() returns 'disabled'
// so every form works in local dev without a real site key.
//
// Usage:
//   const { getToken } = useRecaptcha();
//   const token = await getToken('login');
//   // pass token in form data / Server Action

export function useRecaptcha() {
  const getToken = useCallback(async (action: string): Promise<string> => {
    return recaptchaService.getToken(action);
  }, []);

  return { getToken };
}
