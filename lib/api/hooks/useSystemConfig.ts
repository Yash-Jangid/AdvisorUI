import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ApiError } from '../types';

export interface SystemConfig {
  preMarketOddsEnabled: boolean;
}

export const systemConfigKeys = {
  all: () => ['system-config'] as const,
};

export function useSystemConfig() {
  return useQuery<SystemConfig, ApiError>({
    queryKey: systemConfigKeys.all(),
    queryFn: () => api.get<SystemConfig>('/admin/system-config'),
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; preMarketOddsEnabled: boolean }, ApiError, SystemConfig>({
    mutationFn: (payload) => api.patch('/admin/system-config', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(systemConfigKeys.all(), { preMarketOddsEnabled: data.preMarketOddsEnabled });
    },
  });
}
