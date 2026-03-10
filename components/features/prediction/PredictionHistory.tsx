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
import type { Prediction } from '@/lib/api/types';

// ─── Status icon map ──────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: Prediction['status'] }) => {
  const map = {
    WON:       { icon: CheckCircle, className: 'text-success' },
    LOST:      { icon: XCircle,     className: 'text-error'   },
    PENDING:   { icon: Clock,       className: 'text-warning'  },
    REFUNDED:  { icon: RefreshCw,   className: 'text-info'     },
    CANCELLED: { icon: XCircle,     className: 'text-muted-foreground' },
  }[status];

  return <Icon icon={map.icon} size={16} className={map.className} />;
};

// ─── Row component ────────────────────────────────────────────────────────────

function PredictionRow({ prediction }: { prediction: Prediction }) {
  const isWon = prediction.status === 'WON';

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-background-secondary transition-colors">
      <StatusIcon status={prediction.status} />

      <div className="flex-1 min-w-0 space-y-0.5">
        <Text variant="small" weight="medium" truncate>
          {prediction.match?.title ?? `Match ${prediction.matchId.slice(-6)}`}
        </Text>
        <Text variant="caption" color="secondary">
          {formatEnumLabel(prediction.outcome)} · {prediction.side} · {formatOdds(prediction.oddsAtPlacement.teamAWin)}
        </Text>
      </div>

      <div className="text-right space-y-0.5 shrink-0">
        <Text
          variant="small"
          weight="semibold"
          color={isWon ? 'success' : 'primary'}
          className="font-mono"
        >
          {formatPoints(prediction.amount)}
        </Text>
        <Text variant="caption" color="tertiary">
          {formatRelative(prediction.createdAt)}
        </Text>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PredictionHistory() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyPredictions();

  if (isLoading) return <SkeletonList rows={6} hasBadge />;

  const allPredictions = data?.pages.flatMap((page) => page.data) ?? [];

  if (allPredictions.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
        <Icon icon={Target} size={32} className="text-muted-foreground/30 mb-3" />
        <Text variant="small" color="secondary">No predictions yet. Place your first prediction!</Text>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <VirtualizedList
        items={allPredictions}
        estimateSize={72}
        className="max-h-[600px]"
        renderItem={(prediction) => <PredictionRow key={prediction.id} prediction={prediction} />}
      />

      {/* Load more */}
      {hasNextPage && (
        <div className="p-4 border-t border-border text-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-background-secondary transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
