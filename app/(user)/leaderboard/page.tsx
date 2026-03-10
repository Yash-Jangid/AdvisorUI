'use client';

import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { UserAvatar } from '@/components/molecules/UserAvatar';
import { SkeletonList } from '@/components/skeletons/SkeletonList';
import { useLeaderboard, useMyRank } from '@/lib/api/hooks/useLeaderboard';
import { formatPoints } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { LeaderboardEntry } from '@/lib/api/types';

// ─── Rank badge icons for top 3 ───────────────────────────────────────────────

const RANK_ICONS = [Crown, Trophy, Medal] as const;
const RANK_COLORS = ['text-accent-gold', 'text-muted-foreground', 'text-accent-pink'] as const;

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    const RankIcon = RANK_ICONS[rank - 1]!;
    return <Icon icon={RankIcon} size={18} className={RANK_COLORS[rank - 1]} />;
  }
  return (
    <Text variant="caption" color="tertiary" className="font-mono w-5 text-center">
      {rank}
    </Text>
  );
}

function LeaderRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors',
        isMe ? 'bg-primary/8' : 'hover:bg-background-secondary/50'
      )}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        <RankCell rank={entry.rank} />
      </div>

      <UserAvatar name={entry.username} size="sm" className="shrink-0" />

      <Text variant="small" weight={isMe ? 'semibold' : 'medium'} truncate className="flex-1">
        {entry.username}
        {isMe && (
          <span className="ml-2 text-xs text-primary font-semibold">(You)</span>
        )}
      </Text>

      <Text variant="small" weight="semibold" className="font-mono shrink-0">
        {formatPoints(entry.totalPoints)} pts
      </Text>
    </div>
  );
}

// ─── My Rank Banner ───────────────────────────────────────────────────────────

function MyRankBanner() {
  const { data: myRank, isLoading } = useMyRank();

  if (isLoading || !myRank) return null;

  return (
    <div className="glass-card rounded-xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <Text variant="caption" color="tertiary" className="uppercase tracking-wide font-semibold">
          Your Rank
        </Text>
        <Text variant="h3" weight="bold" className="mt-0.5">
          {myRank.rank ? `#${myRank.rank}` : '—'}
        </Text>
      </div>
      <div className="text-right">
        <Text variant="caption" color="tertiary">Points</Text>
        <Text variant="small" weight="semibold" className="font-mono">
          {formatPoints(myRank.totalPoints ?? 0)} pts
        </Text>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: myRank } = useMyRank();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Text variant="h2" weight="bold">Leaderboard</Text>

        <MyRankBanner />

        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <Text variant="small" weight="semibold">Top Players</Text>
            <Icon icon={Trophy} size={16} className="text-accent-gold" />
          </div>

          {isLoading ? (
            <div className="p-4">
              <SkeletonList />
            </div>
          ) : leaderboard?.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Icon icon={Trophy} size={32} className="text-muted-foreground/30 mb-3" />
              <Text variant="small" color="secondary">No entries yet. Be the first!</Text>
            </div>
          ) : (
            leaderboard?.map((entry) => (
              <LeaderRow
                key={entry.userId}
                entry={entry}
                isMe={entry.userId === myRank?.userId}
              />
            ))
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
