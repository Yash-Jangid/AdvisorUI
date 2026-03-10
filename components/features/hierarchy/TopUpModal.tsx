'use client';

import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { useTransferPoints, type TransferResult } from '@/lib/api/hooks/useHierarchy';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatPoints } from '@/lib/utils/formatters';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUsername: string;
}

const INPUT_CLS =
  'w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/50 transition';

// ── Component ─────────────────────────────────────────────────────────────────

export function TopUpModal({ open, onClose, targetUserId, targetUsername }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { mutateAsync: transfer, isPending } = useTransferPoints();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const myBalance = currentUser?.balance ?? 0;
  const amountNum = parseFloat(amount) || 0;

  const validate = (): boolean => {
    if (!amount || amountNum <= 0) { setError('Enter a valid amount'); return false; }
    if (amountNum < 1) { setError('Minimum transfer is 1 point'); return false; }
    if (amountNum > myBalance) { setError(`You only have ${formatPoints(myBalance)} points`); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await transfer({
        toUserId: targetUserId,
        amount: amountNum,
        description: description || undefined,
      }) as TransferResult;
      toast.success(
        `✅ Transferred ${formatPoints(amountNum)} pts to ${targetUsername}. Your new balance: ${formatPoints(result.fromBalance)} pts`,
      );
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Transfer failed';
      toast.error(msg);
    }
  };

  const presets = [100, 500, 1000, 5000].filter((p) => p <= myBalance);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl glass-card border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Icon icon={Zap} size={20} className="text-primary" />
            <div>
              <Text variant="h4" weight="semibold">Top-Up Points</Text>
              <Text variant="caption" color="secondary">→ {targetUsername}</Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-colors"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        {/* Balance info */}
        <div className="mb-4 rounded-xl bg-background-secondary px-4 py-3">
          <Text variant="caption" color="secondary">Your available balance</Text>
          <Text variant="h4" weight="bold" className="text-primary">
            {formatPoints(myBalance)} pts
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Quick presets */}
          {presets.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={cn(
                    'rounded-lg border px-3 py-1 text-xs font-medium transition-colors',
                    amount === String(p)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary',
                  )}
                >
                  +{formatPoints(p)}
                </button>
              ))}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Amount (pts)
            </label>
            <input
              id="topup-amount"
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className={cn(INPUT_CLS, error && 'border-error')}
              placeholder="Enter points to transfer"
              min={1}
              max={myBalance}
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
            {amountNum > 0 && amountNum <= myBalance && (
              <p className="mt-1 text-xs text-text-tertiary">
                Balance after: {formatPoints(myBalance - amountNum)} pts
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Note <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              id="topup-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. Monthly allocation"
              maxLength={200}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !amount}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Transferring…' : `Transfer ${amountNum > 0 ? formatPoints(amountNum) + ' pts' : 'Points'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
