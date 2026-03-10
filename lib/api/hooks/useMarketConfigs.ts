import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
export type MarketType = string;

interface MarketConfig {
  marketType: MarketType;
  displayName: string;
  settlementTrigger: string;
  overround: number;
  minStake: number;
  maxStake: number;
  maxPayout: number;
  defaultLine?: number;
  defaultOutcomes: Array<{ outcomeKey: string; label: string; baseProbability: number }>;
}

export const ENDPOINTS_MARKET_CONFIGS = {
  getAll: () => '/admin/market-configs',
  update: (marketType: MarketType) => `/admin/market-configs/${marketType}`,
};

const marketConfigsKeys = {
  all: ['marketConfigs'] as const,
  detail: (marketType: MarketType) => [...marketConfigsKeys.all, marketType] as const,
};

// ─── Fetch All Configs ────────────────────────────────────────────────────────
export function useMarketConfigs() {
  return useQuery<MarketConfig[]>({
    queryKey: marketConfigsKeys.all,
    queryFn: async () => {
      const response = await api.get<MarketConfig[]>(ENDPOINTS_MARKET_CONFIGS.getAll());
      return response;
    },
  });
}

// ─── Update Configuration ─────────────────────────────────────────────────────
export function useUpdateMarketConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { marketType: MarketType; data: Partial<MarketConfig> }) => {
      const response = await api.put<MarketConfig>(
        ENDPOINTS_MARKET_CONFIGS.update(params.marketType),
        params.data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: marketConfigsKeys.all });
      queryClient.invalidateQueries({ queryKey: marketConfigsKeys.detail(variables.marketType) });
    },
  });
}
