'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Trophy, RotateCcw, BadgeDollarSign, Coins, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import { formatPoints, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { LedgerEntry, LedgerBalance } from '@/lib/api/types';
import { format } from 'date-fns';
import { useAuthStore } from '@/lib/stores/authStore';
import { useDownlineLedger } from '@/lib/api/hooks/useDownlineLedger';

// ─── Query hooks (local to this page) ────────────────────────────────────────

const ledgerKeys = {
  balance: () => ['ledger', 'balance'] as const,
  history: (page: number, limit: number) => ['ledger', 'history', page, limit] as const,
};

function useLedgerBalance() {
  return useQuery({
    queryKey: ledgerKeys.balance(),
    queryFn: () => api.get<LedgerBalance>(ENDPOINTS.ledger.myBalance()),
    staleTime: CONFIG.query.staleTime,
    refetchInterval: 30_000,
  });
}

function usePaginatedLedgerHistory(page = 1, limit = 50) {
  return useQuery({
    queryKey: ledgerKeys.history(page, limit),
    queryFn: () =>
      api.get<{ data: LedgerEntry[]; meta: { total: number; page: number; totalPages: number; hasNextPage: boolean } }>(
        ENDPOINTS.ledger.myHistory(page, limit)
      ),
    staleTime: CONFIG.query.staleTime,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TX_TYPE_CONFIG: Record<string, { label: string; icon: any; cls: string; credit: boolean }> = {
  CREDIT: { label: 'Credit', icon: ArrowDownLeft, cls: 'text-emerald-400 bg-emerald-400/10', credit: true },
  DEBIT: { label: 'Debit', icon: ArrowUpRight, cls: 'text-red-400 bg-red-400/10', credit: false },
  WIN: { label: 'Win', icon: Trophy, cls: 'text-yellow-400 bg-yellow-400/10', credit: true },
  REFUND: { label: 'Refund', icon: RotateCcw, cls: 'text-cyan-400 bg-cyan-400/10', credit: true },
  COMMISSION: { label: 'Commission', icon: BadgeDollarSign, cls: 'text-violet-400 bg-violet-400/10', credit: true },
  BET: { label: 'Bet', icon: Coins, cls: 'text-orange-400 bg-orange-400/10', credit: false },
};

const TX_FILTER_TYPES = ['ALL', 'CREDIT', 'DEBIT', 'WIN', 'REFUND', 'COMMISSION', 'BET'];

function getTypeConfig(type: string) {
  return TX_TYPE_CONFIG[type] ?? { label: type, icon: Coins, cls: 'text-text-secondary bg-background-tertiary', credit: true };
}

// ─── Table Row ───────────────────────────────────────────────────────────────

function TxTableRow({ tx }: { tx: LedgerEntry }) {
  const cfg = getTypeConfig(tx.type);

  return (
    <tr className="hover:bg-background-tertiary/30 transition-colors group border-b border-border/40">
      <td className="px-4 py-3">
        <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold', cfg.cls)}>
          <Icon icon={cfg.icon} size={12} />
          {cfg.label}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={cn('font-mono text-sm font-semibold', cfg.credit ? 'text-emerald-400' : 'text-red-400')}>
          {cfg.credit ? '+' : '-'}{formatPoints(Math.abs(Number(tx.amount)))} pts
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{formatPoints(Number(tx.balanceAfter))} pts</td>
      <td className="px-4 py-3">
        <Text variant="caption" color="secondary" className="max-w-xs truncate" title={tx.description ?? undefined}>
          {tx.description || '—'}
        </Text>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-text-tertiary whitespace-nowrap">
        {tx.userId?.slice(0, 8) || '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-text-tertiary whitespace-nowrap">
        {format(new Date(tx.createdAt), 'MMM dd, HH:mm')}
      </td>
    </tr>
  );
}

// ─── Balance Banner ───────────────────────────────────────────────────────────

function BalanceBanner({ balance, transactions }: { balance: LedgerBalance; transactions: LedgerEntry[] }) {
  const isCredit = (type: string) => ['CREDIT', 'WIN', 'REFUND', 'COMMISSION'].includes(type);
  const totalIn = transactions.filter(t => isCredit(t.type)).reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions.filter(t => !isCredit(t.type)).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-4 rounded-xl bg-primary/10 text-primary">
          <Icon icon={Wallet} size={28} />
        </div>
        <div>
          <Text variant="caption" color="tertiary" className="uppercase tracking-wide font-semibold">
            Current Balance
          </Text>
          <Text variant="h2" weight="bold" className="font-mono mt-0.5">
            {formatPoints(balance.balance)} pts
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-success mb-0.5">
            <Icon icon={TrendingUp} size={14} />
            <Text variant="caption" color="success" weight="semibold">Total In (Page)</Text>
          </div>
          <Text variant="small" weight="semibold" className="font-mono">
            {formatPoints(totalIn)} pts
          </Text>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-error mb-0.5">
            <Icon icon={TrendingDown} size={14} />
            <Text variant="caption" color="error" weight="semibold">Total Out (Page)</Text>
          </div>
          <Text variant="small" weight="semibold" className="font-mono">
            {formatPoints(totalOut)} pts
          </Text>
        </div>
      </div>
    </div>
  );
}

// ─── Table Component ─────────────────────────────────────────────────────────

function PaginatedTableContainer({
  title,
  data,
  isLoading,
  error,
  page,
  setPage,
  refetch
}: {
  title: string;
  data: any;
  isLoading: boolean;
  error: any;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  refetch: () => void;
}) {
  const [typeFilter, setTypeFilter] = useState('ALL');

  const transactions: LedgerEntry[] = (data?.data ?? []).filter(
    (tx: LedgerEntry) => typeFilter === 'ALL' || tx.type === typeFilter
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-background-tertiary/50">
        <Text variant="small" weight="semibold">{title}</Text>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-2 py-1 text-xs text-text-secondary bg-background border border-border rounded hover:bg-background-tertiary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={cn(isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-border bg-background-tertiary/20 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {TX_FILTER_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                typeFilter === t
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-background text-text-secondary border border-border hover:bg-background-tertiary'
              )}
            >
              {t === 'ALL' ? 'All Types' : t}
            </button>
          ))}
        </div>
        <Text variant="caption" color="secondary">
          Page {page} of {data?.meta?.totalPages ?? '?'}
        </Text>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[500px] scrollbar-thin">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 z-10 bg-background-tertiary text-xs uppercase text-text-secondary border-b border-border shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Balance After</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-text-secondary">Loading…</td></tr>
            )}
            {error && !isLoading && (
              <tr><td colSpan={5} className="p-8 text-center text-error">Failed to load transactions.</td></tr>
            )}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Text color="secondary">No entries found.</Text>
                </td>
              </tr>
            )}
            {!isLoading && transactions.map(tx => (
              <TxTableRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-border bg-background-tertiary flex items-center justify-between text-sm text-text-secondary">
        <span>Showing {transactions.length} of {data?.meta?.total ?? 0} entries</span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-background hover:bg-background-tertiary border border-border rounded disabled:opacity-50 transition-colors"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >Prev</button>
          <span className="font-mono">{page}</span>
          <button
            className="px-3 py-1 bg-background hover:bg-background-tertiary border border-border rounded disabled:opacity-50 transition-colors"
            disabled={!data?.meta?.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >Next</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LedgerPage() {
  const user = useAuthStore((s) => s.user);
  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const isEndUser = roleName?.toUpperCase() === 'USER';

  const [ledgerPageNum, setLedgerPageNum] = useState(1);
  const { data: balance, isLoading: balanceLoading } = useLedgerBalance();
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = usePaginatedLedgerHistory(ledgerPageNum);

  // States for the bonus transactions section (only used by End Users)
  const [txPageNum, setTxPageNum] = useState(1);
  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
    refetch: refetchTx
  } = useDownlineLedger(txPageNum);

  const transactions = historyData?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Text variant="h2" weight="bold">Ledger</Text>

        {/* Balance Banner */}
        {balanceLoading ? (
          <div className="animate-pulse bg-background-tertiary h-32 rounded-2xl" />
        ) : balance ? (
          <BalanceBanner balance={balance} transactions={transactions} />
        ) : null}

        {/* My Ledger Entries Table */}
        <PaginatedTableContainer
          title="Ledger Entries"
          data={historyData}
          isLoading={historyLoading}
          error={historyError}
          page={ledgerPageNum}
          setPage={setLedgerPageNum}
          refetch={refetchHistory}
        />

        {/* Bonus View: Transactions for End Users */}
        {/* {isEndUser && (
          <PaginatedTableContainer
            title="Transactions"
            data={txData}
            isLoading={txLoading}
            error={txError}
            page={txPageNum}
            setPage={setTxPageNum}
            refetch={refetchTx}
          />
        )} */}

      </div>
    </DashboardLayout>
  );
}
