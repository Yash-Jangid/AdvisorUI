import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Match } from '@/lib/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BetCountsResult {
  matchId: string;
  totals: Record<string, number>;
  grandTotal: number;
}

export interface MatchBookEntry {
  _id: string;
  userId: string;
  matchId: string;
  marketId: string;
  marketType: string;
  outcomeKey: string;
  outcomeLabel: string;
  amount: number; // Prediction stores `amount` — not `stake`
  oddsAtPlacement: number;
  potentialPayout: number;
  status: string;
  createdAt: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const adminMatchKeys = {
  allMatches: () => ['admin', 'matches'] as const,
  betCounts: (matchId: string) => ['admin', 'betCounts', matchId] as const,
  matchBook: (matchId: string) => ['admin', 'matchBook', matchId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch all matches (live + upcoming + completed) for admin view */
export const useAdminAllMatches = () =>
  useQuery<Match[]>({
    queryKey: adminMatchKeys.allMatches(),
    queryFn: async () => {
      const [live, upcoming] = await Promise.all([
        api.get<Match[]>(ENDPOINTS.matches.live()),
        api.get<Match[]>(ENDPOINTS.matches.upcoming(100)),
      ]);
      const liveArr = Array.isArray(live) ? live : [];
      const upcomingArr = Array.isArray(upcoming) ? upcoming : [];
      // Merge and deduplicate by _id
      const seen = new Set<string>();
      return [...liveArr, ...upcomingArr].filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

/** Fetch bet counts (per-outcome) for a specific match */
export const useAdminBetCounts = (matchId: string) =>
  useQuery<BetCountsResult>({
    queryKey: adminMatchKeys.betCounts(matchId),
    queryFn: () => api.get<BetCountsResult>(ENDPOINTS.admin.betCounts(matchId)),
    enabled: !!matchId,
    staleTime: 10_000,
  });

/** Fetch match book (list of pending predictions) for a specific match */
export const useAdminMatchBook = (matchId: string) =>
  useQuery<MatchBookEntry[]>({
    queryKey: adminMatchKeys.matchBook(matchId),
    queryFn: () => api.get<MatchBookEntry[]>(ENDPOINTS.admin.matchBook(matchId)),
    enabled: !!matchId,
    staleTime: 10_000,
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Trigger sync of match fixtures from external provider */
export const useSyncMatches = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ synced: number }>(ENDPOINTS.matches.sync(), {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminMatchKeys.allMatches() });
    },
  });
};

/** Trigger full match settlement — optionally provide a manual winner to bypass cricket API */
export const useSettleMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, manualWinner }: { matchId: string; manualWinner?: string }) =>
      api.post<{ jobId: string }>(
        `${ENDPOINTS.admin.settle(matchId)}${manualWinner ? `?winner=${encodeURIComponent(manualWinner)}` : ''}`,
        {}
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminMatchKeys.allMatches() });
    },
  });
};

/** Manually settle a specific market with a winning outcome */
export const useSettleMarket = () =>
  useMutation({
    mutationFn: ({
      matchId,
      marketId,
      winningOutcomeKey,
    }: {
      matchId: string;
      marketId: string;
      winningOutcomeKey: string;
    }) =>
      api.post<{ settled: boolean }>(ENDPOINTS.admin.settleMarket(matchId, marketId), {
        winningOutcomeKey,
      }),
  });
