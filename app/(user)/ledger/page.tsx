'use client';

import React, { useState } from 'react';
import { Wallet, Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RotateCcw, BadgeDollarSign, Coins, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import { formatPoints } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

type VankyLedgerSummary = {
  dena: number;
  lena: number;
  balance: number;
  balanceLabel: string;
};

type LedgerEntry = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
  createdBy?: string | null;
  createdAt: string;
  collectionName?: string | null;
  paymentType?: string | null;
  remark?: string | null;
  postDate?: string | null;
  doneBy?: string | null;
  entryType?: string | null;
};

type PaginatedLedgerResponse = {
  data: LedgerEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: VankyLedgerSummary;
};

function useVankyLedgerHistory(page: number, limit: number, dateFrom: string, dateTo: string, entryType: string) {
  return useQuery({
    queryKey: ['ledger', 'vanky-history', page, limit, dateFrom, dateTo, entryType],
    queryFn: () => {
      let url = `${ENDPOINTS.ledger.myHistory()}?page=${page}&limit=${limit}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;
      if (entryType !== 'All') url += `&entryType=${entryType}`;
      return api.get<PaginatedLedgerResponse>(url);
    },
    staleTime: CONFIG.query.staleTime,
  });
}

function VankyLedgerSummaryBoxes({ summary }: { summary?: VankyLedgerSummary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Lena Box */}
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center border-t-2 border-t-emerald-500/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Text variant="caption" className="uppercase tracking-wider text-emerald-400 font-bold mb-1 relative z-10">Total Lena</Text>
        <Text variant="h3" className="font-mono text-emerald-400 font-bold relative z-10">{formatPoints(summary.lena)} pts</Text>
      </div>
      
      {/* Dena Box */}
      <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center border-t-2 border-t-red-500/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Text variant="caption" className="uppercase tracking-wider text-red-400 font-bold mb-1 relative z-10">Total Dena</Text>
        <Text variant="h3" className="font-mono text-red-400 font-bold relative z-10">{formatPoints(summary.dena)} pts</Text>
      </div>

      {/* Balance Box */}
      <div className={cn("glass-card rounded-xl p-4 flex flex-col items-center justify-center border-t-2 relative overflow-hidden group hover:-translate-y-1 transition-transform", summary.balance >= 0 ? "border-t-emerald-500" : "border-t-red-500")}>
        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity", summary.balance >= 0 ? "bg-emerald-500/5" : "bg-red-500/5")} />
        <Text variant="caption" className="uppercase tracking-wider text-text-secondary font-bold mb-1 relative z-10">Balance</Text>
        <Text variant="h3" className={cn("font-mono font-bold relative z-10", summary.balance >= 0 ? "text-emerald-400" : "text-red-400")}>
          {summary.balanceLabel}
        </Text>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [entryType, setEntryType] = useState('All');

  const { data, isLoading, error, refetch } = useVankyLedgerHistory(page, limit, dateFrom, dateTo, entryType);

  const entries = data?.data || [];
  const summary = data?.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto w-full pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Text variant="h2" weight="bold">Vanky Ledger</Text>
        </div>

        {/* Filters Box */}
        <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row flex-wrap gap-5 items-end shadow-sm border border-border/50">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-xs text-text-secondary uppercase font-semibold">From Date</label>
            <input 
              type="date" 
              className="bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors hover:border-border/80"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-xs text-text-secondary uppercase font-semibold">To Date</label>
            <input 
              type="date" 
              className="bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors hover:border-border/80"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className="text-xs text-text-secondary uppercase font-semibold">Type</label>
            <select 
              className="bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors hover:border-border/80"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Lena">Lena</option>
              <option value="Dena">Dena</option>
            </select>
          </div>
          <button 
            onClick={() => { setPage(1); refetch(); }}
            disabled={isLoading}
            className="bg-primary/90 text-primary-foreground hover:bg-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 min-w-[160px] justify-center"
          >
            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            Get Statement
          </button>
        </div>

        {/* Summaries */}
        {isLoading && !summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="animate-pulse bg-background-tertiary h-24 rounded-xl" />
            <div className="animate-pulse bg-background-tertiary h-24 rounded-xl" />
            <div className="animate-pulse bg-background-tertiary h-24 rounded-xl" />
          </div>
        ) : (
          <VankyLedgerSummaryBoxes summary={summary} />
        )}

        {/* Main Ledger Table */}
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col shadow-sm border border-border/50">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background-tertiary/30">
            <div className="flex items-center gap-2">
              <Icon icon={Wallet} className="text-primary" size={18} />
              <Text variant="body" weight="bold">Ledger Details</Text>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-background-tertiary/95 backdrop-blur-sm text-xs uppercase text-text-secondary border-b border-border shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                <tr>
                  <th className="px-5 py-3.5 font-bold tracking-wider">Date</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider">Collection Name</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider text-red-400">Debit</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider text-emerald-400">Credit</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider">Balance</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider">Payment Type</th>
                  <th className="px-5 py-3.5 font-bold tracking-wider">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading && (
                  <tr><td colSpan={7} className="p-12 text-center text-text-secondary"><RefreshCw className="animate-spin mx-auto mb-2 opacity-50" /> Loading statement...</td></tr>
                )}
                {error && !isLoading && (
                  <tr><td colSpan={7} className="p-12 text-center text-red-400 bg-red-400/5">Failed to load ledger entries. Please try again.</td></tr>
                )}
                {!isLoading && !error && entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Wallet size={48} className="mb-4" />
                        <Text variant="h4" weight="semibold">No entries found</Text>
                        <Text variant="small" color="secondary" className="mt-1">Adjust your date filters or type to see history.</Text>
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && !error && entries.map((tx) => {
                  const isCredit = ['CREDIT', 'WIN', 'REFUND', 'COMMISSION'].includes(tx.type) || tx.entryType === 'Lena';
                  const debitAmt = isCredit ? 0 : Math.abs(Number(tx.amount));
                  const creditAmt = isCredit ? Math.abs(Number(tx.amount)) : 0;

                  return (
                    <tr key={tx.id} className="hover:bg-background-tertiary/50 transition-colors group">
                      <td className="px-5 py-3.5 font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                        {format(new Date(tx.createdAt), 'dd-MM-yyyy HH:mm:ss')}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium">
                        {tx.collectionName || tx.description || 'System Entry'}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium">
                        {debitAmt > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                            {formatPoints(debitAmt)}
                          </span>
                        ) : <span className="text-text-tertiary px-2">0</span>}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-medium">
                        {creditAmt > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                            {formatPoints(creditAmt)}
                          </span>
                        ) : <span className="text-text-tertiary px-2">0</span>}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-text-primary bg-background-tertiary/10">
                        {formatPoints(Number(tx.balanceAfter))}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary">
                        {tx.paymentType ? (
                          <span className="bg-background-tertiary px-2 py-1 rounded border border-border/50">{tx.paymentType}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary max-w-[250px] truncate" title={tx.remark || undefined}>
                        {tx.remark || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3.5 border-t border-border bg-background-tertiary/50 flex flex-wrap items-center justify-between text-sm text-text-secondary gap-4">
            <div>
               Showing <span className="font-mono text-text-primary font-bold">{entries.length}</span> entries
               {data?.meta?.total ? ` out of ${data.meta.total} total` : ''}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-1.5 bg-background hover:bg-background-tertiary border border-border rounded-lg disabled:opacity-30 disabled:hover:bg-background transition-all font-semibold flex items-center gap-1 shadow-sm active:scale-95"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className="font-mono bg-background-tertiary px-3 py-1 rounded border border-border/50 text-text-primary">
                {page} / {data?.meta?.totalPages || 1}
              </div>
              <button
                className="px-4 py-1.5 bg-background hover:bg-background-tertiary border border-border rounded-lg disabled:opacity-30 disabled:hover:bg-background transition-all font-semibold flex items-center gap-1 shadow-sm active:scale-95"
                disabled={!data?.meta?.hasNextPage}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
