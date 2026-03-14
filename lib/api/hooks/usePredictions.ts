import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import { IdempotencyManager } from '@/lib/utils/idempotency';
import type { BetTicket, PaginatedResponse } from '@/lib/api/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const predictionKeys = {
  all: () => ['predictions'] as const,
  my: () => ['predictions', 'my'] as const,
  byMatch: (matchId: string) => ['predictions', 'match', matchId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** My prediction history — infinite scroll, feeds VirtualizedList */
export const useMyPredictions = (gameType?: string) =>
  useInfiniteQuery({
    queryKey: [...predictionKeys.my(), gameType],
    queryFn: async ({ pageParam = 1 }) => {
      const page = pageParam as number;
      if (gameType === 'CASINO') {
        const rawCasino = await api.get<any[]>(ENDPOINTS.betting.myTickets(page, 20, gameType));
        const casinoData: BetTicket[] = (rawCasino ?? []).map((item: any) => ({
          id: item.id ?? `casino-${page}-${Math.random()}`,
          userId: item.userId,
          marketId: item.marketId,
          selectionId: item.selectionId,
          oddsAtPlacement: item.oddsAtPlacement,
          stake: item.stake,
          potentialPayout: item.potentialPayout,
          status: item.status,
          settledAt: item.settledAt,
          createdAt: item.createdAt,
          selection: item.selection,
          market: item.market,
        }));
        return {
          data: casinoData,
          total: casinoData.length,
          page,
          limit: 20,
          nextPage: rawCasino.length === 20 ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        } as PaginatedResponse<BetTicket>;
      }
      const rawData = await api.get<any[]>(ENDPOINTS.predictions.my(page, 20));
      const mappedData: BetTicket[] = rawData.map(item => ({
        id: item._id || item.id,
        userId: item.userId,
        marketId: item.marketId,
        selectionId: item.outcomeKey,
        oddsAtPlacement: item.oddsAtPlacement,
        stake: item.amount,
        potentialPayout: item.potentialPayout,
        status: item.status,
        settledAt: item.settledAt,
        createdAt: item.createdAt,
        selection: {
          id: item.outcomeKey,
          label: item.outcomeLabel || item.outcome,
        },
        market: {
          id: item.marketId,
          displayName: item.marketType.replace(/_/g, ' '),
          marketType: item.marketType,
          gameEvent: {
            id: item.matchId,
            title: item.matchTitle ?? 'Cricket Match',
            gameEngine: {
              id: 'v1',
              name: 'CRICKET',
            },
          },
        },
      }));
      
      return {
        data: mappedData,
        total: mappedData.length,
        page,
        limit: 20,
        nextPage: rawData.length === 20 ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      } as PaginatedResponse<BetTicket>;
    },
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: CONFIG.query.staleTime,
    initialPageParam: 1,
  });

/** Predictions for a specific match */
export const usePredictionsByMatch = (matchId: string) =>
  useQuery({
    queryKey: predictionKeys.byMatch(matchId),
    queryFn: () => api.get<BetTicket[]>(ENDPOINTS.predictions.byMatch(matchId)),
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
      return api.post<BetTicket>(ENDPOINTS.predictions.place(), {
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
      qc.setQueryData(predictionKeys.my(), (old: { pages: BetTicket[][] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            [
              { ...newPrediction, id: 'optimistic', status: 'PENDING', createdAt: new Date().toISOString() } as BetTicket,
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
