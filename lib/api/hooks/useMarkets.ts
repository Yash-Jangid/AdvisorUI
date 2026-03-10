import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Market } from '@/lib/api/types';

export const marketKeys = {
  byMatch: (matchId: string) => ['markets', matchId] as const,
  byId: (matchId: string, marketId: string) => ['markets', matchId, marketId] as const,
};

/**
 * Fetch all markets for a match, grouped as returned by the backend.
 * Returns a flat array — grouping is done client-side in MarketTabs.
 * TTL: 10s while live, 60s otherwise.
 */
export const useMarketsForMatch = (matchId: string, enabled = true) =>
  useQuery({
    queryKey: marketKeys.byMatch(matchId),
    enabled: Boolean(matchId) && enabled,
    queryFn: async () => {
      const data = await api.get<Market[]>(ENDPOINTS.markets.byMatch(matchId));
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
