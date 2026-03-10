'use client';

import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { useCreateDownline } from '@/lib/api/hooks/useHierarchy';
import { useRoles } from '@/lib/api/hooks/useRoles';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';

// ── Helpers ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

const INPUT_CLS =
  'w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary ' +
  'placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-primary/50 transition';

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateDownlineModal({ open, onClose }: Props) {
  const currentUser = useAuthStore((s) => s.user);
  const { activeRoles: rolesData, isLoadingActive: rolesLoading } = useRoles();
  const { mutateAsync: createDownline, isPending } = useCreateDownline();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  if (!open) return null;

  // Filter roles to only show roles that are strictly lower than the current user's role
  // (Backend enforces this too — this is just a UI hint)
  const availableRoles = (Array.isArray(rolesData) ? rolesData : []).filter(
    (r) => r.isActive,
  );

  const validate = (): boolean => {
    const errs: Partial<typeof form> = {};
    if (!form.username || form.username.length < 3) errs.username = 'Min 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers and _ only';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters';
    if (!form.roleId) errs.roleId = 'Select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createDownline(form);
      toast.success('Downline user created successfully!');
      setForm({ username: '', email: '', password: '', roleId: '' });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Failed to create user';
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
            <Icon icon={UserPlus} size={20} className="text-primary" />
            <Text variant="h4" weight="semibold">Add Team Member</Text>
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
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Username</label>
            <input
              id="downline-username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className={cn(INPUT_CLS, errors.username && 'border-error')}
              placeholder="e.g. john_agent"
              autoComplete="off"
            />
            {errors.username && <p className="mt-1 text-xs text-error">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
            <input
              id="downline-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={cn(INPUT_CLS, errors.email && 'border-error')}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
            <div className="relative">
              <input
                id="downline-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={cn(INPUT_CLS, 'pr-10', errors.password && 'border-error')}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon icon={showPassword ? EyeOff : Eye} size={16} />
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Role</label>
            <select
              id="downline-role"
              value={form.roleId}
              onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
              className={cn(INPUT_CLS, errors.roleId && 'border-error')}
              disabled={rolesLoading}
            >
              <option value="">
                {rolesLoading ? 'Loading roles…' : 'Select a role'}
              </option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.displayName} (Level {r.level})
                </option>
              ))}
            </select>
            {errors.roleId && <p className="mt-1 text-xs text-error">{errors.roleId}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create Team Member'}
          </button>
        </form>
      </div>
    </div>
  );
}
