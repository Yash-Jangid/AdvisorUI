'use client';

import { CONFIG } from '@/lib/constants/config';

// ─── reCAPTCHA v3 Service ────────────────────────────────────────────────────
// Invisible, score-based bot detection.
// When NEXT_PUBLIC_RECAPTCHA_ENABLED=false → getToken() returns 'disabled'.

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

class RecaptchaService {
  private static instance: RecaptchaService;
  private loaded = false;

  static getInstance(): RecaptchaService {
    if (!RecaptchaService.instance) {
      RecaptchaService.instance = new RecaptchaService();
    }
    return RecaptchaService.instance;
  }

  async load(): Promise<void> {
    if (!CONFIG.security.recaptchaEnabled || this.loaded) return;
    if (!CONFIG.security.recaptchaSiteKey) return;

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-recaptcha]');
      if (existing) {
        this.loaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${CONFIG.security.recaptchaSiteKey}`;
      script.async = true;
      script.defer = true;
      script.dataset['recaptcha'] = 'true';
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('reCAPTCHA failed to load'));
      document.head.appendChild(script);
    });
  }

  async getToken(action: string): Promise<string> {
    if (!CONFIG.security.recaptchaEnabled) return 'disabled';

    await this.load();

    if (!window.grecaptcha) throw new Error('reCAPTCHA not ready');

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(CONFIG.security.recaptchaSiteKey, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  }
}

export const recaptchaService = RecaptchaService.getInstance();
