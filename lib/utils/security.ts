// ─── XSS / Security Utilities ─────────────────────────────────────────────────
// Client-side: wraps DOMPurify for user-generated content.
// Server-side: lightweight tag-strip fallback (no DOM available).
// Toggle via NEXT_PUBLIC_XSS_SANITIZE_ENABLED env var.
//
// Usage:
//   import { sanitizeHtml, sanitizeUrl } from '@/lib/utils/security';
//   const safe = sanitizeHtml(userSuppliedContent);
//   const safeHref = sanitizeUrl(userSuppliedLink);

const isEnabled =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_XSS_SANITIZE_ENABLED !== 'false';

// ─── HTML Sanitizer ───────────────────────────────────────────────────────────

/**
 * Strips dangerous HTML tags and attributes from a string.
 * On the client uses DOMPurify for full compliance.
 * On the server falls back to a simple tag-stripping regex.
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  if (!isEnabled) return dirty;

  // Client-side: load DOMPurify dynamically (tree-shaken out on server)
  if (typeof window !== 'undefined') {
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol'],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });
  }

  // Server-side fallback: strip all tags
  return stripAllTags(dirty);
}

/**
 * Synchronous HTML sanitizer — uses regex strip only.
 * Prefer sanitizeHtml() on the client; use this only in Server Components.
 */
export function sanitizeHtmlSync(dirty: string): string {
  if (!isEnabled) return dirty;
  return stripAllTags(dirty);
}

// ─── URL Sanitizer ────────────────────────────────────────────────────────────

// Blocked protocols that can execute script
const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Validates a URL and returns '#' if it contains a dangerous protocol.
 * Use this before rendering user-supplied hrefs.
 */
export function sanitizeUrl(url: string): string {
  if (!isEnabled) return url;

  const trimmed = url.trim().toLowerCase();
  const isBlocked = BLOCKED_PROTOCOLS.some((proto) => trimmed.startsWith(proto));
  return isBlocked ? '#' : url;
}

// ─── Text Sanitizer ───────────────────────────────────────────────────────────

/**
 * Escapes HTML special characters for safe insertion into HTML attributes or
 * text nodes without a full parser. Fast and synchronous.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function stripAllTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}
