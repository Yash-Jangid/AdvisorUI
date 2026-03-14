'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, Target } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { SkeletonList } from '@/components/skeletons/SkeletonList';
import { useMyPredictions } from '@/lib/api/hooks/usePredictions';
import { formatPoints, formatOdds, formatRelative, formatEnumLabel } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { BetTicket } from '@/lib/api/types';

// ─── Status icon map ──────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: BetTicket['status'] }) => {
  const map = {
    WON: { icon: CheckCircle, className: 'text-success' },
    LOST: { icon: XCircle, className: 'text-error' },
    PENDING: { icon: Clock, className: 'text-warning' },
    REFUNDED: { icon: RefreshCw, className: 'text-info' },
    CANCELLED: { icon: XCircle, className: 'text-muted-foreground' },
  }[status];

  return <Icon icon={map.icon} size={16} className={map.className} />;
};

// ─── Row component ────────────────────────────────────────────────────────────

function BetTicketRow({ ticket }: { ticket: BetTicket }) {
  const isWon = ticket.status === 'WON';
  const eventTitle = ticket.market?.gameEvent?.title ?? 'Unknown Event';
  const selectionLabel = ticket.selection?.label ?? 'Unknown';
  const marketName = ticket.market?.displayName ?? '';

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-0 hover:bg-background-secondary transition-colors">
      <StatusIcon status={ticket.status} />

      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <Text variant="small" weight="bold" truncate>
            {eventTitle}
          </Text>
          {ticket.market?.gameEvent?.gameEngine?.name === 'CASINO' && (
             <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent font-bold uppercase tracking-wider">
               Casino
             </span>
          )}
        </div>
        <Text variant="caption" color="secondary" className="block">
          {marketName} · <span className="text-text-primary font-medium">{selectionLabel}</span> · @{formatOdds(ticket.oddsAtPlacement)}
        </Text>
      </div>

      <div className="text-right space-y-0.5 shrink-0">
        <Text
          variant="small"
          weight="bold"
          color={isWon ? 'success' : 'primary'}
          className="font-mono"
        >
          {formatPoints(ticket.stake)}
        </Text>
        <Text variant="caption" color="tertiary">
          {formatRelative(ticket.createdAt)}
        </Text>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PredictionHistory() {
  const [activeType, setActiveType] = React.useState<'CRICKET' | 'CASINO' | undefined>('CRICKET');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyPredictions(activeType);

  if (isLoading) return <SkeletonList rows={6} hasBadge />;

  const allTickets = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-background-secondary rounded-xl border border-border w-fit">
        {[
          { id: 'CRICKET', label: 'Cricket Bets' },
          { id: 'CASINO', label: 'Casino' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeType === tab.id
                ? "bg-background text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden min-h-[400px]">
        {allTickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Icon icon={Target} size={32} className="text-muted-foreground/30 mb-3" />
            <Text variant="small" color="secondary">
              No {activeType?.toLowerCase()} bets found.
            </Text>
          </div>
        ) : (
          <VirtualizedList
            items={allTickets}
            estimateSize={82}
            className="max-h-[700px]"
            renderItem={(ticket) => <BetTicketRow key={ticket.id} ticket={ticket} />}
          />
        )}

        {/* Load more */}
        {hasNextPage && (
          <div className="p-4 border-t border-border text-center bg-background/50">
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-background-secondary transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more history'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
