import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { ENDPOINTS } from '../endpoints';
import { CasinoTableId, CasinoLiveData, CasinoRoundResult, CasinoDetailResult } from '../types';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const casinoKeys = {
  all: ['casino'] as const,
  tables: () => [...casinoKeys.all, 'tables'] as const,
  liveData: (type: number) => [...casinoKeys.all, 'live-data', type] as const,
  lastResult: (type: number) => [...casinoKeys.all, 'last-result', type] as const,
  detailResult: (type: number, mid: number) => [...casinoKeys.all, 'detail-result', type, mid] as const,
};

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch all available Casino tables.
 * Data is relatively static, caching for 5 minutes.
 */
export function useCasinoTables() {
  return useQuery({
    queryKey: casinoKeys.tables(),
    queryFn: async () => {
      return await api.get<CasinoTableId[]>(ENDPOINTS.casino.tables());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch live data for a specific Casino game (cards, status).
 * Polling every 3 seconds to ensure real-time updates.
 */
export function useCasinoLiveData(type: number, enabled = true) {
  return useQuery({
    queryKey: casinoKeys.liveData(type),
    queryFn: async () => {
      return await api.get<CasinoLiveData>(ENDPOINTS.casino.data(type));
    },
    enabled,
    refetchInterval: 3000, // 3 seconds polling
    staleTime: 2000,
  });
}

/**
 * Fetch the result of the last completed round.
 * Polling every 5 seconds.
 */
export function useCasinoLastResult(type: number, enabled = true) {
  return useQuery({
    queryKey: casinoKeys.lastResult(type),
    queryFn: async () => {
      return await api.get<CasinoRoundResult>(ENDPOINTS.casino.result(type));
    },
    enabled,
    refetchInterval: 5000, // 5 seconds polling
    staleTime: 4000,
  });
}

/**
 * Fetch detailed result for a specific past round.
 */
export function useCasinoDetailResult(type: number, mid: number, enabled = true) {
  return useQuery({
    queryKey: casinoKeys.detailResult(type, mid),
    queryFn: async () => {
      return await api.get<CasinoDetailResult>(ENDPOINTS.casino.detailResult(type, mid));
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}
