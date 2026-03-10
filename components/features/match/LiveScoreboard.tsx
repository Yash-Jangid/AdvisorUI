'use client';

import React from 'react';
import { Signal, RefreshCw } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveScore } from '@/lib/api/hooks/useMatches';
import { formatEnumLabel } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { Match } from '@/lib/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveScoreboardProps {
  match: Match;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Subscribes to SSE via useLiveScore — the hook opens an EventSource connection
// and writes incoming events directly into React Query cache.

export function LiveScoreboard({ match }: LiveScoreboardProps) {
  const { data: score } = useLiveScore(match.id);
  const isLive = match.status === 'LIVE';

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-5 space-y-4',
        isLive && 'border border-primary/30 shadow-glow'
      )}
      aria-label="Live scoreboard"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <span className="live-dot" />
              <Icon icon={Signal} size={14} className="text-success" />
              <Text variant="caption" color="success" weight="semibold" className="uppercase tracking-wide">
                Live SSE
              </Text>
            </>
          ) : (
            <Text variant="caption" color="secondary" className="uppercase tracking-wide" suppressHydrationWarning>
              {formatEnumLabel(match.status)}
            </Text>
          )}
        </div>
        {score && (
          <Text variant="caption" color="tertiary" className="font-mono">
            {score.overs ?? ''} ov
          </Text>
        )}
      </div>

      {/* Score display */}
      {score ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Team A */}
          <div className="text-center space-y-1">
            <Text variant="caption" color="secondary" truncate>{match.teamA}</Text>
            <Text
              variant="h2"
              weight="bold"
              className={cn('font-mono tabular-nums', score.currentInnings === 1 && 'animate-score-pop')}
            >
              {score.teamAScore ?? '—'}
            </Text>
          </div>

          {/* Team B */}
          <div className="text-center space-y-1">
            <Text variant="caption" color="secondary" truncate>{match.teamB}</Text>
            <Text
              variant="h2"
              weight="bold"
              className={cn('font-mono tabular-nums', score.currentInnings === 2 && 'animate-score-pop')}
            >
              {score.teamBScore ?? '—'}
            </Text>
          </div>
        </div>
      ) : (
        // Loading state — SSE not yet received first event
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-10 w-24 mx-auto" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-10 w-24 mx-auto" />
          </div>
        </div>
      )}

      {/* SSE status */}
      {isLive && (
        <div className="flex items-center justify-center gap-1.5 text-text-tertiary">
          <Icon icon={RefreshCw} size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
          <Text variant="caption" color="tertiary">Updating live</Text>
        </div>
      )}
    </div>
  );
}
