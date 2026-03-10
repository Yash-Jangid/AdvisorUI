'use client';

import React, { useState } from 'react';
import { X, TrendingDown } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { useDemoteUser } from '@/lib/api/hooks/useHierarchy';
import { useRoles } from '@/lib/api/hooks/useRoles';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    username: string;
    role: { level: number; name: string; displayName: string };
  } | null;
}

const INPUT_CLS =
  'w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/50 transition';

// ── Component ─────────────────────────────────────────────────────────────────

export function DemoteUserModal({ open, onClose, targetUser }: Props) {
  const { activeRoles, isLoadingActive } = useRoles();
  const { mutateAsync: demoteUser, isPending } = useDemoteUser();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState('');

  if (!open || !targetUser) return null;

  // For demotion: only show roles that are STRICTLY LOWER (numerically higher level) than the target's current role.
  // The Administrator can assign any lower role — no upper bound restriction applies.
  const availableRoles = activeRoles.filter((r) => r.level > targetUser.role.level);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setError('Please select a role to demote to');
      return;
    }
    try {
      await demoteUser({ userId: targetUser.id, roleId: selectedRoleId });
      toast.success(`${targetUser.username} has been demoted successfully.`);
      setSelectedRoleId('');
      setError('');
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to demote user';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl glass-card border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Icon icon={TrendingDown} size={20} className="text-error" />
            <Text variant="h4" weight="semibold">Demote User</Text>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-colors"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Target Info */}
          <div className="rounded-lg border border-border bg-background-tertiary p-3">
            <Text variant="small" className="text-text-secondary">Target User</Text>
            <Text variant="body" weight="medium">{targetUser.username}</Text>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Current Role:</span>
              <span className="rounded bg-background px-1.5 py-0.5 text-xs text-text-secondary">
                {targetUser.role.displayName} (Level {targetUser.role.level})
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
            <strong>Administrator only.</strong> This will sever the user from their current parent and reattach them directly under you at a lower role.
          </div>

          {/* Role Selection */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Select Demotion Role
            </label>
            <select
              id="demotion-role"
              value={selectedRoleId}
              onChange={(e) => {
                setSelectedRoleId(e.target.value);
                setError('');
              }}
              className={cn(INPUT_CLS, error && 'border-error')}
              disabled={isLoadingActive || availableRoles.length === 0}
            >
              <option value="">
                {isLoadingActive ? 'Loading roles…' : 'Select a role'}
              </option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.displayName} (Level {r.level})
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-xs text-error">{error}</p>}

            {!isLoadingActive && availableRoles.length === 0 && (
              <p className="mt-2 text-xs text-orange-400">
                This user is already at the lowest available role.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || availableRoles.length === 0}
            className="w-full rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Executing Demotion…' : 'Demote User'}
          </button>
        </form>
      </div>
    </div>
  );
}
