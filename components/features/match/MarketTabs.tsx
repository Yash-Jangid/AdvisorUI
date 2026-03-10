'use client';

import React, { useState, useMemo } from 'react';
import { Market, MarketOutcome, MarketSettlementTrigger, MARKET_TIER_LABELS } from '@/lib/api/types';
import { MarketCard } from './MarketCard';

const TIER_ORDER: MarketSettlementTrigger[] = [
    'on_match_end',
    'on_toss',
    'on_innings_end',
    'on_over_end',
    'on_ball',
];

interface MarketTabsProps {
    markets: Market[];
    onSelectOutcome?: (marketId: string, outcome: MarketOutcome, market: Market) => void;
}

export function MarketTabs({ markets, onSelectOutcome }: MarketTabsProps) {
    const [activeTier, setActiveTier] = useState<MarketSettlementTrigger>('on_match_end');
    const [selectedOutcome, setSelected] = useState<{ marketId: string; outcomeKey: string } | null>(null);

    /** Build tier → markets map (only tiers that have at least 1 market) */
    const tierMap = useMemo(() => {
        const map = new Map<MarketSettlementTrigger, Market[]>();
        for (const tier of TIER_ORDER) {
            const ms = markets.filter(m => m.settlementTrigger === tier);
            if (ms.length > 0) map.set(tier, ms);
        }
        return map;
    }, [markets]);

    const activeTiers = Array.from(tierMap.keys());

    // If our current tier got filtered out, fall back to first available
    const resolvedTier = tierMap.has(activeTier) ? activeTier : (activeTiers[0] ?? 'on_match_end');
    const visibleMarkets = tierMap.get(resolvedTier) ?? [];

    const handleOutcomeSelect = (marketId: string, outcome: MarketOutcome) => {
        setSelected({ marketId, outcomeKey: outcome.outcomeKey });
        const market = markets.find(m => m.id === marketId);
        if (market) onSelectOutcome?.(marketId, outcome, market);
    };

    if (markets.length === 0) {
        return (
            <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    Markets are being prepared for this match…
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Tier tab strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {activeTiers.map((tier) => {
                    const count = tierMap.get(tier)?.length ?? 0;
                    const isActive = tier === resolvedTier;
                    return (
                        <button
                            key={tier}
                            onClick={() => setActiveTier(tier)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150
                ${isActive
                                    ? 'bg-[var(--color-accent-primary)] text-black shadow-lg shadow-emerald-500/20'
                                    : 'bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.10)]'}`}
                        >
                            {MARKET_TIER_LABELS[tier]}
                            <span className={`text-[11px] rounded-full px-1.5 py-0.5
                ${isActive ? 'bg-black/20 text-black' : 'bg-[rgba(255,255,255,0.10)] text-[var(--color-text-tertiary)]'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Market cards for active tier */}
            <div className="space-y-3">
                {visibleMarkets.map((market, midx) => (
                    <MarketCard
                        key={market.id || `market-${midx}`}
                        market={market}
                        selectedOutcomeKey={
                            selectedOutcome?.marketId === market.id ? selectedOutcome.outcomeKey : undefined
                        }
                        onSelectOutcome={handleOutcomeSelect}
                    />
                ))}
            </div>
        </div>
    );
}
