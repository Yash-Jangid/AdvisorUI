import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import { IdempotencyManager } from '@/lib/utils/idempotency';
import type { Prediction, PlacePredictionDto, PaginatedResponse } from '@/lib/api/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const predictionKeys = {
  all: () => ['predictions'] as const,
  my: () => ['predictions', 'my'] as const,
  byMatch: (matchId: string) => ['predictions', 'match', matchId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** My prediction history — infinite scroll, feeds VirtualizedList */
export const useMyPredictions = () =>
  useInfiniteQuery({
    queryKey: predictionKeys.my(),
    queryFn: ({ pageParam = 1 }) =>
      api.get<PaginatedResponse<Prediction>>(ENDPOINTS.predictions.my(pageParam as number)),
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: CONFIG.query.staleTime,
    initialPageParam: 1,
  });

/** Predictions for a specific match */
export const usePredictionsByMatch = (matchId: string) =>
  useQuery({
    queryKey: predictionKeys.byMatch(matchId),
    queryFn: () => api.get<Prediction[]>(ENDPOINTS.predictions.byMatch(matchId)),
    enabled: !!matchId,
    staleTime: CONFIG.query.liveStaleTime,
  });

/**
 * Place prediction with:
 * - Optimistic insert into cache
 * - Rollback on failure
 * - Cache invalidation on settle
 * - Auto-generated idempotency key (persisted in localStorage)
 */
export const usePlacePrediction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      const idempotencyKey = IdempotencyManager.getKey(
        `prediction-${String(payload.matchId)}-${String(payload.outcomeKey ?? payload.outcome)}-${String(payload.marketId ?? '')}`
      );
      return api.post<Prediction>(ENDPOINTS.predictions.place(), {
        ...payload,
        idempotencyKey,
      });
    },

    onMutate: async (newPrediction) => {
      // 1. Cancel in-flight refetches to avoid race
      await qc.cancelQueries({ queryKey: predictionKeys.my() });

      // 2. Snapshot for rollback
      const previousData = qc.getQueryData(predictionKeys.my());

      // 3. Optimistic insert — prepend to first page
      qc.setQueryData(predictionKeys.my(), (old: { pages: Prediction[][] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            [
              { ...newPrediction, id: 'optimistic', status: 'PENDING' } as Prediction,
              ...old.pages[0]!,
            ],
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, ctx) => {
      // 4. Rollback on failure
      if (ctx?.previousData) {
        qc.setQueryData(predictionKeys.my(), ctx.previousData);
      }
    },

    onSettled: () => {
      // 5. Always resync from server after mutation
      void qc.invalidateQueries({ queryKey: predictionKeys.my() });
    },
  });
};
