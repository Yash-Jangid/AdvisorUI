'use client';

import React, { useCallback, useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, Trophy, RotateCcw, BadgeDollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { SkeletonList } from '@/components/skeletons/SkeletonList';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { CONFIG } from '@/lib/constants/config';
import { formatPoints, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { LedgerEntry } from '@/lib/api/types';

// ─── Query hook (Infinite Scrolling version of useDownlineLedger) ───────────

function useDownlineLedgerInfinite() {
  return useInfiniteQuery({
    queryKey: ['downline-ledger', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<{ data: LedgerEntry[]; meta: { hasNextPage: boolean, page: number } }>(
        ENDPOINTS.ledger.downlineHistory(pageParam as number)
      ),
    getNextPageParam: (last) => last.meta.hasNextPage ? last.meta.page + 1 : undefined,
    staleTime: CONFIG.query.staleTime,
    initialPageParam: 1,
  });
}

// ─── List Row ───────────────────────────────────────────────────────────────

function TxListRow({ tx }: { tx: LedgerEntry }) {
  const isCredit = tx.amount > 0;

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-0 hover:bg-background-secondary/50 transition-colors">
      <div
        className={cn(
          'p-2 rounded-lg',
          isCredit ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        )}
      >
        <Icon icon={isCredit ? ArrowDownLeft : ArrowUpRight} size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <Text variant="small" weight="medium" truncate>
          {tx.description}
        </Text>
        <Text variant="caption" color="tertiary" className="flex items-center gap-2">
          <span>{formatDate(tx.createdAt)}</span>
          <span>•</span>
          <span className="font-mono">{tx.userId?.slice(0, 8) || 'System'}</span>
        </Text>
      </div>

      <div className="text-right">
        <Text
          variant="small"
          weight="semibold"
          className={isCredit ? 'text-success' : 'text-error'}
        >
          {isCredit ? '+' : ''}{formatPoints(tx.amount)}
        </Text>
        <Text variant="caption" color="tertiary">
          Bal: {formatPoints(tx.balanceAfter)}
        </Text>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const {
    data: historyData,
    isLoading: historyLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDownlineLedgerInfinite();

  // Flatten all pages into a single array for VirtualizedList
  const transactions: LedgerEntry[] = historyData?.pages.flatMap((p) => p.data) ?? [];

  // Load-more sentinel via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      });
      observerRef.current.observe(node);
      sentinelRef.current = node;
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2" weight="bold">Downline Transactions</Text>
            <Text variant="caption" color="secondary" className="mt-0.5">
              Financial history and ledger entries for your entire downline team
            </Text>
          </div>
        </div>

        {/* Transaction History List */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background-tertiary/50">
            <Text variant="small" weight="semibold">Transaction History</Text>
          </div>

          {historyLoading ? (
            <div className="p-4">
              <SkeletonList />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center">
              <Text variant="small" color="secondary">No transactions yet.</Text>
            </div>
          ) : (
            <>
              <div className="h-[650px]">
                <VirtualizedList
                  items={transactions}
                  estimateSize={72}
                  renderItem={(tx) => <TxListRow key={tx.id} tx={tx} />}
                  className="h-full"
                />
              </div>
              {/* Infinite scroll sentinel */}
              <div ref={sentinelCallback} className="h-1" aria-hidden="true" />
              {isFetchingNextPage && (
                <div className="py-3 text-center">
                  <Text variant="caption" color="tertiary">Loading more…</Text>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
