import React, { useState } from 'react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useCasinoActiveMarket } from '@/lib/api/hooks/useCasino';
import { usePlaceBetTicket } from '@/lib/api/hooks/useBettingEngine';

interface BettingPanelProps {
  cid: number;
}

export function BettingPanel({ cid }: BettingPanelProps) {
  const { data: activeMarket, isLoading, isError } = useCasinoActiveMarket(cid);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stake, setStake] = useState<string>('');

  const {
    mutate: placeBet,
    isPending,
    isSuccess,
    reset,
    error,
  } = usePlaceBetTicket(cid);

  const disabled =
    !activeMarket ||
    activeMarket.status !== 'OPEN' ||
    isPending ||
    isError;

  const handleSubmit = () => {
    if (!activeMarket || !selectedId) return;
    const stakeNum = Number(stake);
    if (!Number.isFinite(stakeNum) || stakeNum <= 0) return;

    reset();
    placeBet({
      marketId: activeMarket.marketId,
      selectionId: selectedId,
      stake: stakeNum,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background-secondary p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <Text variant="h4" className="font-bold">
          Place Bet
        </Text>
        {activeMarket?.status === 'OPEN' ? (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-500">
            Open
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
            Suspended
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-text-tertiary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Text variant="small">Loading market...</Text>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
          <Icon icon={AlertTriangle} size={16} />
          <Text variant="small">Unable to load active market for this table.</Text>
        </div>
      )}

      {activeMarket && (
        <>
          <div className="flex flex-wrap gap-2">
            {activeMarket.selections.map((sel) => {
              const isSelected = sel.id === selectedId;
              const oddsNum = Number(sel.currentOdds);
              return (
                <button
                  key={sel.id}
                  type="button"
                  disabled={activeMarket.status !== 'OPEN' || isPending}
                  onClick={() => setSelectedId(sel.id)}
                  className={
                    'flex min-w-[5.5rem] flex-1 items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-all ' +
                    (isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background-tertiary text-text-secondary hover:border-primary/40 hover:text-text-primary')
                  }
                >
                  <span className="font-medium">{sel.label}</span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {Number.isFinite(oddsNum) ? `${oddsNum.toFixed(2)}x` : sel.currentOdds}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={stake}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStake(e.target.value)}
              placeholder="Stake"
              className="w-28 rounded-md border border-border bg-background-tertiary px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              disabled={disabled || !selectedId || !stake}
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing...
                </span>
              ) : (
                'Place Bet'
              )}
            </button>
          </div>

          {isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
              <Icon icon={CheckCircle2} size={16} />
              <Text variant="small">Bet placed successfully.</Text>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <Icon icon={AlertTriangle} size={16} />
              <Text variant="small">
                {(error.message && typeof error.message === 'string' && error.message) ||
                  'Failed to place bet.'}
              </Text>
            </div>
          )}
        </>
      )}
    </div>
  );
}

