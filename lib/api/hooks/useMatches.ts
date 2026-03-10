import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import type { Match, LiveMatchScore } from '@/lib/api/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const matchKeys = {
  all: () => ['matches'] as const,
  upcoming: () => ['matches', 'upcoming'] as const,
  live: () => ['matches', 'live'] as const,
  byId: (id: string) => ['matches', id] as const,
  liveScore: (id: string) => ['matches', id, 'live'] as const,
  odds: (id: string) => ['matches', id, 'odds'] as const,
  diamondMarkets: (id: string) => ['matches', id, 'diamond', 'markets'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Upcoming matches — refreshes every 30s */
export const useUpcomingMatches = () =>
  useQuery({
    queryKey: matchKeys.upcoming(),
    queryFn: async () => {
      const data = await api.get<Match[]>(ENDPOINTS.matches.upcoming());
      // Guard: backend returns a plain array; if shape is wrong, return empty
      return Array.isArray(data) ? data : [];
    },
    staleTime: CONFIG.query.staleTime,
    refetchInterval: 60_000,
  });

/** Live matches — refreshes every 10s while window is focused */
export const useLiveMatches = () =>
  useQuery({
    queryKey: matchKeys.live(),
    queryFn: async () => {
      const data = await api.get<Match[]>(ENDPOINTS.matches.live());
      return Array.isArray(data) ? data : [];
    },
    staleTime: CONFIG.query.liveStaleTime,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });

/** Single match detail */
export const useMatchById = (id: string) =>
  useQuery({
    queryKey: matchKeys.byId(id),
    queryFn: () => api.get<Match>(ENDPOINTS.matches.byId(id)),
    staleTime: CONFIG.query.liveStaleTime,
    enabled: !!id,
  });

/**
 * Live score subscription via SSE.
 * Opens an EventSource connection and pushes data directly into React Query cache.
 * Returns the cached live score data.
 */
export const useLiveScore = (matchId: string) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const source = api.sse(ENDPOINTS.matches.sse(matchId));

    source.onmessage = (e: MessageEvent<string>) => {
      try {
        const score = JSON.parse(e.data) as LiveMatchScore;
        // Only update cache if this SSE event is for our match
        if (score.matchId === matchId) {
          qc.setQueryData(matchKeys.liveScore(matchId), score);
        }
      } catch {
        // Malformed SSE event — ignore
      }
    };

    source.onerror = () => {
      // SSE connection lost — EventSource auto-reconnects
    };

    return () => source.close();
  }, [matchId, qc]);

  return useQuery<LiveMatchScore | null>({
    queryKey: matchKeys.liveScore(matchId),
    // queryFn is a no-op stub required by TanStack Query v5.
    // Actual data is pushed into the cache by the SSE useEffect above via setQueryData.
    // This function is never called because enabled: false.
    queryFn: () => null,
    enabled: false,
  });
};

export interface LiveOdds {
  teamAWin: number;
  teamBWin: number;
  draw: number;
}

/** Current live odds — 5s auto-refetch. Only active when match is LIVE. */
export const useMatchOdds = (matchId: string, isLive = false) =>
  useQuery<LiveOdds | null>({
    queryKey: matchKeys.odds(matchId),
    queryFn: () => api.get<LiveOdds | null>(ENDPOINTS.matches.odds(matchId)),
    staleTime: 2_000,
    refetchInterval: isLive ? 5_000 : false,
    enabled: isLive && !!matchId,
  });

/** Fetch full Diamond markets payload for a match */
export const useMatchDiamondMarkets = (matchId: string) =>
  useQuery<any[] | null>({
    queryKey: matchKeys.diamondMarkets(matchId),
    queryFn: () => api.get<any[] | null>(ENDPOINTS.matches.diamondMarkets(matchId)),
    staleTime: 5_000, // Slightly longer cache, SSE will push updates
    enabled: !!matchId,
  });

/**
 * Streams real-time Diamond markets updates via SSE and writes them to React Query cache.
 */
export const useLiveDiamondMarkets = (matchId: string) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const source = api.sse(ENDPOINTS.matches.sse(matchId));

    // Listen specifically to the 'markets-update' event
    source.addEventListener('markets-update', (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        // Overwrite the query cache directly with the new array of markets
        qc.setQueryData(matchKeys.diamondMarkets(matchId), payload);
      } catch {
        // Ignore JSON parse errors
      }
    });

    return () => source.close();
  }, [matchId, qc]);
};
