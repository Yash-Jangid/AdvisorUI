import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { LedgerEntry } from '@/lib/api/types';

interface AdminTopUpPayload {
  amount: number;
}

export function useAdminTopUp() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminTopUpPayload) => {
      const entry = await api.post<LedgerEntry>(ENDPOINTS.ledger.adminTopUp(), payload);
      return entry;
    },
    onSuccess: () => {
      // Invalidate balance entirely to reflect new minted points
      qc.invalidateQueries({ queryKey: ['ledger', 'balance'] });
      // Also invalidate user context metrics
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.invalidateQueries({ queryKey: ['hierarchy'] });
    },
  });
}
