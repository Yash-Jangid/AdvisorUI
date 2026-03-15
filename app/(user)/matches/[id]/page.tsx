'use client';

import React, { use, useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { LiveScoreboard } from '@/components/features/match/LiveScoreboard';
import { MarketTabs } from '@/components/features/match/MarketTabs';
import { PredictionForm } from '@/components/organisms/Form/PredictionForm';
import { Text } from '@/components/atoms/Text';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { useMatchById } from '@/lib/api/hooks/useMatches';
import { useMarketsForMatch } from '@/lib/api/hooks/useMarkets';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatDate } from '@/lib/utils/formatters';
import { Market, MarketOutcome } from '@/lib/api/types';
import { DiamondMarketsPanel } from '@/components/features/match/DiamondMarketsPanel';
import { Info } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = use(params);
  const { data: match, isLoading: matchLoading } = useMatchById(id);
  const { data: markets = [], isLoading: marketsLoading } = useMarketsForMatch(id);
  const user = useAuthStore((s) => s.user);

  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  const isLoading = matchLoading || !isMounted;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={5} />
          </div>
          <SkeletonCard lines={6} hasFooter />
        </div>
      </DashboardLayout>
    );
  }

  if (!match) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Text variant="small" color="secondary">Match not found.</Text>
        </div>
      </DashboardLayout>
    );
  }

  const handleOutcomeSelect = (marketId: string, outcome: MarketOutcome, market: Market) => {
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
  };

  // Only role level 5 (USER/Player) accounts may place predictions.
  // Admins, Masters, Agents manage the platform — they don't bet.
  const isPlayer = user ? user.role?.level >= 5 : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Text variant="h2" weight="bold">{match.title}</Text>
          <Text variant="small" color="secondary" className="mt-1" suppressHydrationWarning>
            {match.teamA} vs {match.teamB} · {formatDate(match.startTime)}
          </Text>
        </div>

        {/* Odds Type Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <div className="flex gap-3">
            <div className="mt-0.5 p-1.5 rounded-lg bg-blue-500/10 h-fit">
              <Icon icon={Info} size={14} className="text-blue-400" />
            </div>
            <div>
              <Text variant="small" weight="semibold" className="text-blue-400">Platform Markets</Text>
              <Text variant="caption" color="tertiary" className="leading-relaxed">
                Internal odds managed by the platform. These are stable and follow standard settlement rules.
              </Text>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mt-0.5 p-1.5 rounded-lg bg-red-500/10 h-fit">
              <Icon icon={Info} size={14} className="text-red-400" />
            </div>
            <div>
              <Text variant="small" weight="semibold" className="text-red-400">Live Exchange Odds</Text>
              <Text variant="caption" color="tertiary" className="leading-relaxed">
                Real-time feed from external exchanges. Highly volatile prices with Back/Lay liquidity.
              </Text>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — scoreboard + market tabs */}
          <div className="lg:col-span-2 space-y-6">
            <LiveScoreboard match={match} />

            {/* Match info row */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <Text variant="caption" color="secondary" className="uppercase tracking-wide font-medium">
                Match Info
              </Text>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Text variant="caption" color="tertiary">Status</Text>
                  <Text variant="small" weight="medium">{match.status}</Text>
                </div>
                <div>
                  <Text variant="caption" color="tertiary">Predictions</Text>
                  <Text variant="small" weight="medium">{(match.predictionCount ?? 0).toLocaleString()}</Text>
                </div>
              </div>
            </div>

            {/* ── Market Tabs (Platform Markets) ───────────────────── */}
            <div className="space-y-3">
              <Text variant="h4" weight="semibold">Markets</Text>
              {marketsLoading ? (
                <SkeletonCard lines={4} />
              ) : (
                <MarketTabs
                  markets={markets}
                  onSelectOutcome={handleOutcomeSelect}
                />
              )}
            </div>

            {/* ── Diamond Live Markets ─────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Text variant="h4" weight="semibold">Live Odds</Text>
                {match.status === 'LIVE' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <DiamondMarketsPanel matchId={id} isLive={match.status === 'LIVE'} onSelectOutcome={handleOutcomeSelect as any} />
            </div>
          </div>

          {/* Right column — prediction form */}
          <div className="glass-card rounded-xl p-5 h-fit sticky top-6">
            <Text variant="h4" weight="semibold" className="mb-4">Place Prediction</Text>

            {/* Selected market context */}
            {selectedMarket && selectedOutcome && (
              <div className="mb-4 p-3 rounded-lg bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)]">
                <p className="text-[11px] text-[var(--color-text-tertiary)] mb-0.5">Market</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{(selectedMarket as any).displayName ?? (selectedMarket as any).mname}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5 mb-0.5">Your Selection</p>
                <p className="text-sm font-bold text-[var(--color-accent-primary)]">
                  {(selectedOutcome as any).label ?? (selectedOutcome as any).nat} @ {((selectedOutcome as any).decimalOdds ?? (selectedOutcome as any).currentOdds ?? (selectedOutcome as any).backOdds ?? (selectedOutcome as any).odds ?? 1.90).toFixed(2)}x
                </p>

              </div>
            )}

            {!user ? (
              <Text variant="small" color="secondary">Sign in to place a prediction.</Text>
            ) : !isPlayer ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                <p className="text-amber-400 text-xs font-semibold mb-1">Management Account</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Predictions are only available for Player accounts.
                  Your role ({user.role?.name}) manages the platform.
                </p>
              </div>
            ) : (
              <PredictionForm
                match={match}
                userBalance={user.balance}
                selectedMarket={selectedMarket ?? undefined}
                selectedOutcome={selectedOutcome ?? undefined}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
