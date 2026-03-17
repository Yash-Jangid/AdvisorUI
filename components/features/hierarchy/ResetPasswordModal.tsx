import React, { useState } from 'react';
import { KeyRound, X, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import type { DownlineUser } from '@/lib/api/hooks/useHierarchy';
import { cn } from '@/lib/utils/cn';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  targetUser: DownlineUser | null;
}

export function ResetPasswordModal({ open, onClose, targetUser }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: (data: { userId: string; newPassword: string }) =>
      api.post(`/auth/downline/${data.userId}/reset-password`, { newPassword: data.newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      alert('Password reset successfully!');
      handleClose();
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to reset password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || newPassword.length < 8) return;
    resetMutation.mutate({ userId: targetUser.id, newPassword });
  };

  const handleClose = () => {
    setNewPassword('');
    resetMutation.reset();
    onClose();
  };

  if (!open || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={handleClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-5 bg-background-tertiary">
          <div className="flex items-center gap-2 text-warning">
            <Icon icon={KeyRound} size={20} />
            <Text variant="h4" weight="bold">Reset Password</Text>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-background hover:text-text-primary transition-colors"
          >
            <Icon icon={X} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex gap-3 text-warning">
            <Icon icon={AlertCircle} size={20} className="shrink-0" />
            <div className="text-sm">
              You are about to reset the password for <strong>{targetUser.username}</strong>. 
              They will be disconnected from any active sessions.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase font-semibold text-text-secondary">
              New Password
            </label>
            <input
              type="text"
              className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex gap-3 pt-2">
             <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-background-tertiary font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetMutation.isPending || newPassword.length < 8}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg",
                resetMutation.isPending || newPassword.length < 8 
                  ? "bg-warning/50 cursor-not-allowed shadow-none" 
                  : "bg-warning hover:bg-warning/90 shadow-warning/20 active:scale-95"
              )}
            >
              {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
