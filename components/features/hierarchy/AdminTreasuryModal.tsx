'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, Banknote, ShieldCheck } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useAdminTopUp } from '@/lib/api/hooks/useAdminTopUp';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminTreasuryModal({ open, onClose }: Props) {
  const { mutateAsync: mintPoints, isPending } = useAdminTopUp();
  const [amount, setAmount] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    try {
      await mintPoints({ amount: amountNum });
      toast.success(`Successfully minted ${amountNum.toLocaleString()} virtual points.`);
      onClose();
      setAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to mint virtual points. Are you the Root Admin?');
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl glass-card border border-warning/50 overflow-hidden shadow-2xl ring-1 ring-warning/30">
        
        {/* Danger Header */}
        <div className="flex items-center justify-between p-5 border-b border-warning/20 bg-warning/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-warning/20 flex items-center justify-center text-warning animate-pulse">
              <Icon icon={ShieldAlert} size={20} />
            </div>
            <div>
              <Text variant="h4" weight="bold" className="text-warning">Root Treasury</Text>
              <Text variant="caption" color="secondary" className="max-w-[200px]">
                Highly Restricted Area
              </Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-colors"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="rounded-lg bg-warning/10 p-4 border border-warning/20 flex gap-3 text-warning">
            <Icon icon={ShieldCheck} size={20} className="shrink-0 mt-0.5" />
            <Text variant="small">
              You have unlocked the Root Admin treasury. Minting points here creates new system currency out of thin air. This action is permanently logged.
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="mintAmount" className="text-sm font-medium text-text-secondary">
                Amount to Mint
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-tertiary">
                  <Icon icon={Banknote} size={20} />
                </div>
                <input
                  id="mintAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1000000"
                  className="w-full rounded-xl border border-border bg-background-tertiary/50 py-3 pl-12 pr-4 text-lg font-bold tabular-nums text-text-primary placeholder:font-normal placeholder:text-text-tertiary focus:border-warning focus:outline-none focus:ring-1 focus:ring-warning transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[10000, 50000, 100000, 1000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 rounded-lg border border-border bg-background-tertiary/30 py-1.5 text-xs font-medium text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors tabular-nums"
                >
                  {(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              className="w-full rounded-lg bg-warning px-4 py-3 text-sm font-bold text-warning-foreground transition-all hover:bg-warning/90 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]"
            >
              {isPending ? 'Minting...' : 'Mint Virtual Points'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
