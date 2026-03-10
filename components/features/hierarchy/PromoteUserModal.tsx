'use client';

import React, { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { usePromoteUser } from '@/lib/api/hooks/useHierarchy';
import { useRoles } from '@/lib/api/hooks/useRoles';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

export function PromoteUserModal({ open, onClose, targetUser }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { activeRoles, isLoadingActive } = useRoles();
  const { mutateAsync: promoteUser, isPending } = usePromoteUser();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState('');

  if (!open || !targetUser) return null;

  // Filter roles: A user can only be promoted to a role that is strictly
  // HIGHER than their current role (lower numeric level)
  // AND STRICTLY LOWER than the promoter's role (higher numeric level).
  // e.g., if Promoter = Level 1 (Master) and Target = Level 5 (User),
  // Target can be promoted to Level 2 (Sub-Master), 3 (Agent), 4 (Sub-Agent).
  const availableRoles = activeRoles.filter(
    (r) => r.level < targetUser.role.level && r.level > (currentUser?.role?.level ?? 99)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setError('Please select a role');
      return;
    }

    try {
      await promoteUser({ userId: targetUser.id, roleId: selectedRoleId });
      toast.success(`${targetUser.username} has been promoted successfully!`);
      setSelectedRoleId('');
      setError('');
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }, message?: string })?.response?.data?.message || (err as { message?: string })?.message || 'Failed to promote user';
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
            <Icon icon={TrendingUp} size={20} className="text-secondary" />
            <Text variant="h4" weight="semibold">Promote User</Text>
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

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-200">
            <strong>Note:</strong> Promoting a user will disconnect them from their current parent and reattach them directly to you.
          </div>

          {/* Role Selection */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Select Promotion Role
            </label>
            <select
              id="promotion-role"
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
                You do not have permission to grant any roles strictly between this user's level and your own level.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || availableRoles.length === 0}
            className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Executing Promotion…' : 'Promote User'}
          </button>
        </form>
      </div>
    </div>
  );
}
