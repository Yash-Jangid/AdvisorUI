'use client';

import React, { useState, useEffect } from 'react';
import { Shield, X, Lock, Unlock, ZapOff, Zap, UserX, UserCheck } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { useUpdateAccessControl, type DownlineUser } from '@/lib/api/hooks/useHierarchy';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  targetUser: DownlineUser | null;
}

export function ManageAccessModal({ open, onClose, targetUser }: Props) {
  const { mutateAsync: updateAccess, isPending } = useUpdateAccessControl();

  // Local state for the toggles
  const [isActive, setIsActive] = useState(true);
  const [isBettingDisabled, setIsBettingDisabled] = useState(false);
  const [isUserCreationDisabled, setIsUserCreationDisabled] = useState(false);

  useEffect(() => {
    if (targetUser && open) {
      setIsActive(targetUser.isActive ?? true);
      setIsBettingDisabled(targetUser.isBettingDisabled ?? false);
      setIsUserCreationDisabled(targetUser.isUserCreationDisabled ?? false);
    }
  }, [targetUser, open]);

  if (!open || !targetUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAccess({
        userId: targetUser.id,
        isActive,
        isBettingDisabled,
        isUserCreationDisabled,
      });
      toast.success(`Access controls updated for ${targetUser.username}`);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to update access controls';
      toast.error(msg);
    }
  };

  const hasChanges = 
    isActive !== (targetUser.isActive ?? true) ||
    isBettingDisabled !== (targetUser.isBettingDisabled ?? false) ||
    isUserCreationDisabled !== (targetUser.isUserCreationDisabled ?? false);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl glass-card border border-border overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-background-tertiary/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon icon={Shield} size={20} />
            </div>
            <div>
              <Text variant="h4" weight="semibold">Manage Access</Text>
              <Text variant="caption" color="secondary" className="truncate max-w-[200px]">
                {targetUser.username}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div className="space-y-4">
            
            {/* Login Access Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", isActive ? "bg-success/10 text-success" : "bg-error/10 text-error")}>
                  <Icon icon={isActive ? Unlock : Lock} size={18} />
                </div>
                <div>
                  <Text variant="small" weight="semibold">Account Login</Text>
                  <Text variant="caption" color="tertiary">Allow user to sign in</Text>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-background-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
              </label>
            </div>

            {/* Betting Access Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", !isBettingDisabled ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>
                  <Icon icon={!isBettingDisabled ? Zap : ZapOff} size={18} />
                </div>
                <div>
                  <Text variant="small" weight="semibold">Betting & Predictions</Text>
                  <Text variant="caption" color="tertiary">Allow placing predictions</Text>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!isBettingDisabled} 
                  onChange={(e) => setIsBettingDisabled(!e.target.checked)} 
                />
                <div className="w-11 h-6 bg-background-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Downline Creation Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", !isUserCreationDisabled ? "bg-blue-500/10 text-blue-400" : "bg-slate-500/10 text-slate-400")}>
                  <Icon icon={!isUserCreationDisabled ? UserCheck : UserX} size={18} />
                </div>
                <div>
                  <Text variant="small" weight="semibold">Create Downlines</Text>
                  <Text variant="caption" color="tertiary">Allow adding team members</Text>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!isUserCreationDisabled} 
                  onChange={(e) => setIsUserCreationDisabled(!e.target.checked)} 
                  disabled={!isUserCreationDisabled && false} // Placeholder for future explicit role check
                />
                <div className={cn("w-11 h-6 bg-background-tertiary rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                  !isUserCreationDisabled ? "bg-blue-500 after:translate-x-full after:border-white" : "",
                  "cursor-pointer"
                )}></div>
              </label>
            </div>

          </div>

          <button
            type="submit"
            disabled={isPending || !hasChanges}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Saving Limits...' : 'Save Access Rules'}
          </button>
        </form>
      </div>
    </div>
  );
}
