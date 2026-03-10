import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface LedgerEntry {
  id: string;
  userId: string;
  type: 'CREDIT' | 'DEBIT' | 'WIN' | 'REFUND' | 'COMMISSION' | 'BET';
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface PaginatedLedger {
  data: LedgerEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useDownlineLedger(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['downline-ledger', page, limit],
    queryFn: () => api.get<PaginatedLedger>(ENDPOINTS.ledger.downlineHistory(page, limit)),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMyLedger(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['my-ledger', page, limit],
    queryFn: () => api.get<PaginatedLedger>(ENDPOINTS.ledger.myHistory(page, limit)),
    staleTime: 1000 * 30, // 30 seconds
  });
}
