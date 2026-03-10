'use client';

import React, { useState } from 'react';
import { Trophy, Zap, TrendingUp, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { MatchCard, MatchCardSkeleton } from '@/components/features/match/MatchCard';
import { SelfTopUpModal } from '@/components/features/dashboard/SelfTopUpModal';
import { Text } from '@/components/atoms/Text';
import { useUpcomingMatches, useLiveMatches } from '@/lib/api/hooks/useMatches';
import { useMyRank } from '@/lib/api/hooks/useLeaderboard';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatPoints } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [showSelfTopUp, setShowSelfTopUp] = useState(false);
  // Handle both old string format ('ADMINISTRATOR') and new object format ({ level: 0 })
  const isRoot = (() => {
    const role = user?.role;
    if (!role) return false;
    if (typeof role === 'object') return (role as { level: number }).level === 0;
    return (role as unknown as string) === 'ADMINISTRATOR';
  })();

  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();
  const { data: upcomingMatches, isLoading: upcomingLoading } = useUpcomingMatches();
  const { data: myRank } = useMyRank();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Greeting */}
        <div>
          <Text variant="h2" weight="bold">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Champ'} 👋
          </Text>
          <Text variant="small" color="secondary" className="mt-1">
            Here&apos;s your cricket prediction dashboard.
          </Text>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Trophy}
            label="My Rank"
            value={myRank?.rank != null ? `#${myRank.rank}` : '—'}
            variant="success"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Points"
            value={myRank ? formatPoints(myRank.totalPoints ?? 0) : '—'}
          />
          <StatCard
            icon={Zap}
            label={isRoot ? 'Balance (click to top-up)' : 'Balance'}
            value={user ? formatPoints(user.balance) : '—'}
            variant="info"
            onClick={isRoot ? () => setShowSelfTopUp(true) : undefined}
          />
          <StatCard
            icon={Activity}
            label="Live Matches"
            value={liveMatches?.length ?? '—'}
            variant={liveMatches?.length ? 'error' : 'default'}
          />
        </div>

        {/* Live matches */}
        {(liveLoading || (liveMatches && liveMatches.length > 0)) && (
          <section aria-labelledby="live-section">
            <div className="flex items-center gap-2 mb-4">
              <span className="live-dot" />
              <Text id="live-section" variant="h4" weight="semibold">Live Now</Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {liveLoading
                ? Array.from({ length: 2 }).map((_, i) => <MatchCardSkeleton key={i} />)
                : liveMatches?.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* Upcoming matches */}
        <section aria-labelledby="upcoming-section">
          <Text id="upcoming-section" variant="h4" weight="semibold" className="mb-4">
            Upcoming Matches
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingLoading
              ? Array.from({ length: 3 }).map((_, i) => <MatchCardSkeleton key={i} />)
              : upcomingMatches && upcomingMatches.length > 0
                ? upcomingMatches.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)
                : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-center glass-card rounded-xl border-dashed border-2 border-border/50">
                    <Text variant="small" color="secondary">No upcoming matches scheduled.</Text>
                  </div>
                )
            }
          </div>
        </section>
      </div>

      <SelfTopUpModal open={showSelfTopUp} onClose={() => setShowSelfTopUp(false)} />
    </DashboardLayout>
  );
}
