'use client';

import React from 'react';
import { Market, MarketOutcome, MarketSettlementTrigger, MARKET_TIER_LABELS } from '@/lib/api/types';

interface MarketCardProps {
    market: Market;
    onSelectOutcome?: (marketId: string, outcome: MarketOutcome) => void;
    selectedOutcomeKey?: string;
}

function OddsButton({
    outcome,
    selected,
    disabled,
    onClick,
}: {
    outcome: MarketOutcome;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`odds-btn flex-1 flex flex-col items-center py-2 px-3 rounded-lg border transition-all duration-150
        ${selected
                    ? 'border-[var(--color-accent-primary)] bg-[rgba(16,185,129,0.15)] text-[var(--color-accent-primary)]'
                    : 'border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)] hover:bg-[rgba(16,185,129,0.07)]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className="text-[11px] font-medium truncate w-full text-center">{outcome.label}</span>
            <span className={`text-base font-bold tabular-nums ${selected ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                {outcome.decimalOdds.toFixed(2)}x
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
                {(outcome.impliedProbability * 100).toFixed(0)}%
            </span>
        </button>
    );
}

export function MarketCard({ market, onSelectOutcome, selectedOutcomeKey }: MarketCardProps) {
    const isLocked = market.status === 'LOCKED' || market.status === 'SETTLED' || market.status === 'VOID';
    const isSettled = market.status === 'SETTLED';
    const tierLabel = MARKET_TIER_LABELS[market.settlementTrigger] ?? market.settlementTrigger;

    return (
        <div className={`glass-card rounded-xl p-4 space-y-3 transition-opacity ${isLocked && !isSettled ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                        {market.displayName}
                    </p>
                    {market.line != null && (
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">Line: {market.line}</p>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Tier badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[rgba(255,255,255,0.06)] text-[var(--color-text-tertiary)] uppercase tracking-wider">
                        {tierLabel}
                    </span>
                    {/* Status badge */}
                    {market.status !== 'OPEN' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider
              ${market.status === 'SETTLED' ? 'bg-emerald-900/50 text-emerald-400' :
                                market.status === 'LOCKED' ? 'bg-amber-900/50  text-amber-400' :
                                    market.status === 'SUSPENDED' ? 'bg-red-900/50    text-red-400' :
                                        'bg-zinc-800      text-zinc-400'}`}>
                            {market.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Outcomes grid */}
            <div className={`flex gap-2 flex-wrap`}>
                {market.outcomes.map((outcome, oidx) => (
                    <OddsButton
                        key={outcome.outcomeKey || `outcome-${oidx}`}
                        outcome={outcome}
                        selected={selectedOutcomeKey === outcome.outcomeKey}
                        disabled={isLocked}
                        onClick={() => onSelectOutcome?.(market.id, outcome)}
                    />
                ))}
            </div>

            {/* Settled result */}
            {isSettled && market.winningOutcomeKey && (
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">Result:</span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                        {market.outcomes.find(o => o.outcomeKey === market.winningOutcomeKey)?.label ?? market.winningOutcomeKey}
                    </span>
                </div>
            )}

            {/* Liquidity footer */}
            <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] pt-1 border-t border-[var(--color-border)]">
                <span>{market.totalBetsCount.toLocaleString()} bets</span>
                <span>{market.totalStakedPoints.toLocaleString()} pts staked</span>
            </div>
        </div>
    );
}
