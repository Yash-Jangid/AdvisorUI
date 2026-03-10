'use client';

import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { useAdminTopUp } from '@/lib/api/hooks/useAdminTopUp';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESETS = [1000, 5000, 10000, 50000, 100000];

const INPUT_CLS =
  'w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/50 transition';

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SelfTopUpModal({ open, onClose }: Props) {
  const { mutateAsync: adminTopUp, isPending } = useAdminTopUp();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    try {
      await adminTopUp({ amount: parsed });
      toast.success(`✅ ${parsed.toLocaleString()} points minted to your account!`);
      setAmount('');
      setError('');
      onClose();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to top-up account'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      {/* <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} /> */}

      {/* <div className="relative z-10 w-full max-w-sm rounded-2xl glass-card border border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon icon={Zap} size={20} className="text-warning" />
            <Text variant="h4" weight="semibold">Self Top-Up</Text>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-colors"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-300">
            <strong>Admin only.</strong> This mints new points directly into your account. Use responsibly.
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setAmount(String(p)); setError(''); }}
                className={cn(
                  'rounded-lg border px-3 py-1 text-xs font-medium transition',
                  amount === String(p)
                    ? 'bg-warning/20 border-warning/40 text-warning'
                    : 'border-border text-text-secondary hover:border-warning/30 hover:text-text-primary',
                )}
              >
                {p.toLocaleString()} pts
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Custom Amount
            </label>
            <input
              id="self-topup-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className={cn(INPUT_CLS, error && 'border-error')}
              placeholder="Enter points amount"
            />
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-warning px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Minting…' : 'Mint Points'}
          </button>
        </form>
      </div> */}


    </div>
  );
}
