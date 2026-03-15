'use client';

import React, { useTransition } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { placePredictionSchema, type PlacePredictionSchema } from '@/lib/utils/validators';
import { formatOdds, formatPoints } from '@/lib/utils/formatters';
import { IdempotencyManager } from '@/lib/utils/idempotency';
import { usePlacePrediction } from '@/lib/api/hooks/usePredictions';
import { cn } from '@/lib/utils/cn';
import type { Match } from '@/lib/api/types';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

import type { Market, MarketOutcome } from '@/lib/api/types';

interface PredictionFormProps {
  match: Match;
  userBalance: number;
  onSuccess?: () => void;
  /** Optional: pre-selected market from MarketTabs */
  selectedMarket?: Market;
  /** Optional: pre-selected outcome from MarketTabs */
  selectedOutcome?: MarketOutcome;
}


// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PAYOUT = 100000; // Platform default limit

// ─── Component ────────────────────────────────────────────────────────────────

export function PredictionForm({ match, userBalance, onSuccess, selectedMarket, selectedOutcome }: PredictionFormProps) {
  const { mutate: placePrediction, isPending } = usePlacePrediction();
  const [isTransitionPending, startTransition] = useTransition();

  console.log("🖥️ PredictionForm Render:", {
    selectedMarket,
    selectedOutcome,
    predictionsLocked: match.predictionsLocked,
    isPending
  });

  const methods = useForm<PlacePredictionSchema>({
    resolver: zodResolver(placePredictionSchema),
    defaultValues: {
      matchId: match.id,
      marketId: String(selectedMarket?.id ?? (selectedMarket as any)?.mid ?? ''),
      outcomeKey: String(selectedOutcome?.outcomeKey ?? (selectedOutcome as any)?.sid ?? ''),
      stake: 0,
      idempotencyKey: IdempotencyManager.getKey(`prediction-${match.id}`),
    },
  });

  React.useEffect(() => {
    const mid = String(selectedMarket?.id ?? (selectedMarket as any)?.mid ?? '');
    const oid = String(selectedOutcome?.outcomeKey ?? (selectedOutcome as any)?.sid ?? '');
    console.log("🔄 Syncing Form Values:", { mid, oid });
    methods.setValue('marketId', mid, { shouldValidate: true });
    methods.setValue('outcomeKey', oid, { shouldValidate: true });
  }, [selectedMarket, selectedOutcome, methods]);

  const { watch, handleSubmit, reset } = methods;
  const stake = watch('stake');

  // Use market odds when a market is selected, else fall back to 1.90 default
  const selectedOdds = selectedOutcome?.decimalOdds ?? (selectedOutcome as any)?.currentOdds ?? (selectedOutcome as any)?.backOdds ?? (selectedOutcome as any)?.odds ?? 1.90;

  const potentialReturnVal = stake && selectedOdds ? stake * selectedOdds : 0;
  const isOverPayoutLimit = potentialReturnVal > MAX_PAYOUT;
  const potentialReturn = stake && selectedOdds
    ? potentialReturnVal.toFixed(0)
    : '—';

  const isMarketOpen = !selectedMarket || (selectedMarket as any).status === 'OPEN' || (selectedMarket as any).status === 'ACTIVE' || (selectedMarket as any).status === undefined;


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isTransitionPending) return;
    
    console.log("🚀 Form Submission Triggered");
    handleSubmit(
      (data) => {
        console.log("✅ Validation Success:", data);
        startTransition(() => {
          const payload: Record<string, unknown> = {
            matchId: data.matchId,
            stake: data.stake,
            marketId: (selectedMarket as any)?.id ?? (selectedMarket as any)?.mid ?? data.marketId,
            outcomeKey: (selectedOutcome as any)?.outcomeKey ?? (selectedOutcome as any)?.sid ?? data.outcomeKey,
            acceptedOdds: selectedOdds,
          };
          console.log("📡 Sending Payload:", payload);
          placePrediction(
            payload as any,
            {
              onSuccess: () => {
                toast.success('Prediction placed!', { description: `${formatPoints(data.stake)} staked` });
                reset({ ...methods.getValues(), idempotencyKey: IdempotencyManager.getKey(`prediction-${match.id}-${Date.now()}`) });
                onSuccess?.();
              },
              onError: (err: Error) => {
                console.error("❌ Placement Error:", err);
                toast.error('Failed to place prediction', { description: err.message });
              },
            }
          );
        });
      },
      (errors) => {
        console.error("❌ Validation Errors:", errors);
      }
    )(e);
  };

  const isSubmitting = isPending || isTransitionPending;
  const isButtonDisabled = isSubmitting || match.predictionsLocked || !selectedMarket || !selectedOutcome || isOverPayoutLimit || !isMarketOpen;
  const buttonText = match.predictionsLocked
    ? 'Predictions locked'
    : isSubmitting
      ? 'Placing…'
      : isOverPayoutLimit
        ? 'Payout exceeds limit'
        : !isMarketOpen
          ? 'Market Suspended'
          : selectedMarket
            ? `Place Bet • ${formatOdds(selectedOdds ?? 1)}`
            : 'Select a Market to Bet';

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>

        {/* Selected market / outcome display */}
        <div>
          <Text variant="caption" color="secondary" className="mb-2 uppercase tracking-wide font-medium">
            Selected Outcome
          </Text>
          {selectedMarket && selectedOutcome ? (
            <div className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg border",
              isMarketOpen ? "border-primary/40 bg-primary/5" : "border-error/40 bg-error/5"
            )}>
              <div>
                <p className="text-sm font-medium text-text-primary">{selectedOutcome.label}</p>
                <p className="text-xs text-text-secondary">
                  {selectedMarket.displayName ?? (selectedMarket as any).mname}
                  {!isMarketOpen && <span className="ml-2 text-error text-[10px] font-bold">SUSPENDED</span>}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold text-primary">{formatOdds(selectedOdds)}</span>
            </div>
          ) : (
            <div className="px-3 py-3 rounded-lg border border-dashed border-border bg-background-secondary text-center">
              <p className="text-xs text-text-tertiary">Select a market and outcome above to place a bet</p>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Text variant="caption" color="secondary" className="uppercase tracking-wide font-medium">
              Stake (pts)
            </Text>
            <Text variant="caption" color="tertiary">
              Balance: {formatPoints(userBalance)}
            </Text>
          </div>
          <Controller
            name="stake"
            control={methods.control}
            render={({ field, fieldState }) => (
              <div>
                <input
                  {...field}
                  type="number"
                  min={1}
                  max={userBalance}
                  placeholder="Enter amount"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className={cn(
                    'w-full px-3 py-2.5 rounded-lg border bg-background-secondary text-sm font-mono',
                    'text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30',
                    fieldState.error ? 'border-error' : 'border-border'
                  )}
                />
                {fieldState.error && (
                  <Text variant="caption" color="error" className="mt-1" role="alert">
                    {fieldState.error.message}
                  </Text>
                )}
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-tertiary">
          <Text variant="caption" color="secondary">Potential return</Text>
          <Text variant="caption" weight="semibold" color={isOverPayoutLimit ? "error" : "success"} className="font-mono">
            {potentialReturn !== '—' ? formatPoints(Number(potentialReturn)) : '—'}
          </Text>
        </div>
        {isOverPayoutLimit && (
          <Text variant="caption" color="error" className="mt-1 block px-1">
            Maximum potential payout is {formatPoints(MAX_PAYOUT)}
          </Text>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-lg',
            'font-semibold text-sm transition-all',
            isOverPayoutLimit || !isMarketOpen
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:ring-2 focus-visible:ring-primary'
          )}
        >
          <Icon icon={Zap} size={16} />
          {buttonText}
        </button>
      </form>
    </FormProvider>
  );
}
