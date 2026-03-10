'use client';

import React, { useState } from 'react';
import { ShieldCheck, Coins, RefreshCw, AlertCircle } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useAdminTopUp } from '@/lib/api/hooks/useAdminTopUp';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function TreasuryPage() {
  const [amount, setAmount] = useState<string>('');
  const { mutateAsync: topUp, isPending, error } = useAdminTopUp();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;

    try {
      await topUp({ amount: value });
      toast.success(`Minted ${value.toLocaleString()} pts successfully.`);
      setAmount('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mint points');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <Text variant="h3" className="font-semibold text-text-primary">
          Treasury
        </Text>
        <Text variant="body" color="secondary" className="mt-1">
          Root platform point distribution and general ledger. Mint points to the root Admin.
        </Text>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon icon={Coins} size={24} />
          </div>
          <div>
            <Text variant="small" weight="semibold">Mint Core Points</Text>
            <Text variant="caption" color="tertiary">
              Inject new points into the global supply pool
            </Text>
          </div>
        </div>

        <form onSubmit={handleMint} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              Amount to Mint (pts)
            </label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              placeholder="e.g. 50000"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-mono text-text-primary focus:border-primary outline-none transition-all disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-error">
              <Icon icon={AlertCircle} size={16} className="mt-0.5 shrink-0" />
              <div className="text-sm">
                <span className="font-semibold block">Mint Failed</span>
                {(error as any)?.response?.data?.message || error.message}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !amount || parseFloat(amount) <= 0}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isPending ? (
              <>
                <Icon icon={RefreshCw} size={18} className="animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Icon icon={ShieldCheck} size={18} />
                Mint Points Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
