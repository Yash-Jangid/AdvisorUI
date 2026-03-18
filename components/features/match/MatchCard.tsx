'use client';

import React from 'react';
import NextLink from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { formatMatchTime, formatPoints, formatOdds, formatCompact } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import type { Match } from '@/lib/api/types';

// ─── Skeleton re-export ───────────────────────────────────────────────────────

export function MatchCardSkeleton() {
  return <SkeletonCard lines={3} hasFooter />;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'LIVE';

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <MatchCardSkeleton />;

  return (
    <NextLink
      href={ROUTES.user.matchDetail(match.id)}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <article
        className={cn(
          'glass-card rounded-xl p-4 space-y-4',
          'border border-border hover:border-primary/40',
          'transition-all duration-200 hover:shadow-glow',
          'group-hover:animate-fade-in',
          isLive && 'border-primary/30'
        )}
        aria-label={`${match.teamA} vs ${match.teamB}`}
      >
        {/* Status + time + category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLive ? (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  Live
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-text-tertiary">
                <Icon icon={Clock} size={12} />
                <span className="text-[10px] font-semibold">
                  {formatMatchTime(match.startTime)}
                </span>
              </div>
            )}
            {(match.category ?? '').toLowerCase() !== 'others' && (
              <span className="text-[10px] font-bold text-text-tertiary bg-background-tertiary px-2 py-0.5 rounded-full uppercase tracking-wide">
                {match.category}
              </span>
            )}
          </div>

          {match.predictionsLocked && (
            <span className="px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-medium">
              Locked
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Text variant="small" weight="semibold" truncate className="flex-1">
              {match.teamA}
            </Text>
            <span
              className="px-2.5 py-1 rounded-md bg-background text-center text-xs font-mono font-bold text-text-tertiary"
              aria-label="versus"
            >
              VS
            </span>
            <Text variant="small" weight="semibold" truncate className="flex-1 text-right">
              {match.teamB}
            </Text>
          </div>
        </div>

        {/* Odds row */}
        <div className="grid grid-cols-3 gap-2" role="list" aria-label="Odds">
          {[
            { label: match.teamA, value: match.odds?.teamAWin ?? 0 },
            { label: 'Draw', value: match.odds?.draw ?? 0 },
            { label: match.teamB, value: match.odds?.teamBWin ?? 0 },
          ].map(({ label, value }, i) => (
            <div
              key={`${i}-${label}`}
              role="listitem"
              className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-background-tertiary"
            >
              <Text variant="caption" color="tertiary" truncate className="w-full text-center px-1">
                {label}
              </Text>
              <Text variant="caption" weight="bold" className="font-mono text-text-primary">
                {formatOdds(value)}
              </Text>
            </div>
          ))}
        </div>

        {/* Footer: pool + participants */}
        <div className="flex items-center justify-between text-text-tertiary">
          <div className="flex items-center gap-1">
            <Icon icon={Users} size={12} />
            <Text variant="caption" color="tertiary">
              {formatCompact(match.predictionCount ?? 0)}
            </Text>
          </div>
          <Text variant="caption" color="tertiary">
            Pool: {formatPoints(match.totalPool ?? 0)}
          </Text>
        </div>
      </article>
    </NextLink>
  );
}
