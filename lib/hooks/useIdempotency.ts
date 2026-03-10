'use client';

import { useCallback } from 'react';
import { IdempotencyManager } from '@/lib/utils/idempotency';

// ─── useIdempotency ───────────────────────────────────────────────────────────
// Wraps IdempotencyManager for use in React components.
// The Axios interceptor already attaches Idempotency-Key on every mutation;
// this hook is for *per-operation* dedup when you need to reuse the same key
// across retries (e.g. PredictionForm double-submit prevention).
//
// Usage:
//   const { withIdempotency } = useIdempotency();
//   const result = await withIdempotency('place-prediction-match123', async (key) => {
//     return api.post(ENDPOINTS.predictions.place(), { ...data, idempotencyKey: key });
//   });

export function useIdempotency() {
  const getKey = useCallback((operationId: string): string => {
    return IdempotencyManager.getKey(operationId);
  }, []);

  const getCachedResponse = useCallback((operationId: string): unknown | null => {
    return IdempotencyManager.getCachedResponse(operationId);
  }, []);

  /**
   * Execute an async operation with idempotency protection.
   * - If `operationId` was already executed within 24h, returns the cached response.
   * - Otherwise runs `operation(key)` and stores the result.
   */
  const withIdempotency = useCallback(
    async <T>(
      operationId: string,
      operation: (idempotencyKey: string) => Promise<T>
    ): Promise<T> => {
      const cached = IdempotencyManager.getCachedResponse(operationId);
      if (cached !== null) {
        return cached as T;
      }

      const key = IdempotencyManager.getKey(operationId);
      const result = await operation(key);
      IdempotencyManager.storeResponse(operationId, result);
      return result;
    },
    []
  );

  return { getKey, getCachedResponse, withIdempotency };
}
