import { nanoid } from 'nanoid';
import { CONFIG } from '@/lib/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredKey {
  key: string;
  timestamp: number;
  response?: unknown;
}

// ─── IdempotencyManager ───────────────────────────────────────────────────────
// Manages client-side idempotency keys stored in localStorage with 24hr TTL.
// Used by usePlacePrediction and all Server Actions that mutate data.

export class IdempotencyManager {
  private static prefix = CONFIG.idempotency.storagePrefix;
  private static ttl = CONFIG.idempotency.ttlMs;

  /** Get or create idempotency key for a named operation */
  static getKey(operationId: string): string {
    const storageKey = `${this.prefix}${operationId}`;

    const stored = this.readStorage(storageKey);
    if (stored && Date.now() - stored.timestamp < this.ttl) {
      return stored.key;
    }

    // Expired or not found — generate new key
    const key = nanoid(21);
    this.writeStorage(storageKey, { key, timestamp: Date.now() });
    return key;
  }

  /** Store the server response against an idempotency key (for dedup detection) */
  static storeResponse(operationId: string, response: unknown): void {
    const storageKey = `${this.prefix}${operationId}`;
    const stored = this.readStorage(storageKey);
    if (stored) {
      this.writeStorage(storageKey, { ...stored, response });
    }
  }

  /** Returns the cached response if the key is still valid */
  static getCachedResponse(operationId: string): unknown | null {
    const storageKey = `${this.prefix}${operationId}`;
    const stored = this.readStorage(storageKey);
    if (!stored) return null;

    if (Date.now() - stored.timestamp >= this.ttl) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return stored.response ?? null;
  }

  /** Purge all expired idempotency keys (called on app mount) */
  static cleanup(): void {
    const now = Date.now();
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((key) => {
        const stored = this.readStorage(key);
        if (stored && now - stored.timestamp >= this.ttl) {
          localStorage.removeItem(key);
        }
      });
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private static readStorage(key: string): StoredKey | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as StoredKey) : null;
    } catch {
      return null;
    }
  }

  private static writeStorage(key: string, data: StoredKey): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // localStorage quota exceeded — fail silently
    }
  }
}
