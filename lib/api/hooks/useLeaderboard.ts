import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import type { LeaderboardEntry, MyRankResponse } from '@/lib/api/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const leaderboardKeys = {
  all:    () => ['leaderboard'] as const,
  top:    (limit: number) => ['leaderboard', 'top', limit] as const,
  myRank: () => ['leaderboard', 'my-rank'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Top N leaderboard entries — refreshes every 30s */
export const useLeaderboard = (limit = CONFIG.pagination.leaderboardPageSize) =>
  useQuery({
    queryKey: leaderboardKeys.top(limit),
    queryFn:  () => api.get<LeaderboardEntry[]>(ENDPOINTS.leaderboard.top(limit)),
    staleTime: CONFIG.query.staleTime,
    refetchInterval: 30_000,
  });

/** My current rank — refreshes every 10s while focused */
export const useMyRank = () =>
  useQuery({
    queryKey: leaderboardKeys.myRank(),
    queryFn:  () => api.get<MyRankResponse>(ENDPOINTS.leaderboard.myRank()),
    staleTime: CONFIG.query.liveStaleTime,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
