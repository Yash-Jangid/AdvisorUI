import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { ApiError } from '../types';

export interface MarketOutcomeConfig {
  outcomeKey: string;
  label: string;
}

export interface MarketConfig {
  marketType: string;
  displayName: string;
  settlementTrigger: string;
  overround: number;
  minStake: number;
  maxStake: number;
  maxPayout: number;
  defaultLine?: number;
  defaultOutcomes: MarketOutcomeConfig[];
}

export const marketConfigKeys = {
  all: () => ['market-configs'] as const,
  detail: (type: string) => ['market-configs', type] as const,
};

export function useMarketConfigs() {
  return useQuery<MarketConfig[], ApiError>({
    queryKey: marketConfigKeys.all(),
    queryFn: () => api.get<MarketConfig[]>('/admin/market-configs'),
  });
}

export function useUpdateMarketConfig() {
  const queryClient = useQueryClient();

  return useMutation<MarketConfig, ApiError, { marketType: string; data: Partial<MarketConfig> }>({
    mutationFn: ({ marketType, data }) => api.patch(`/admin/market-configs/${marketType}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: marketConfigKeys.all() });
    },
  });
}
