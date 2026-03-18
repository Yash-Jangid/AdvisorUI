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
    share: 0,
    matchCommPct: 0,
    sessionCommPct: 0,
    casinoCommPct: 0,
    matkaCommPct: 0,
    commissionType: 'BET BY BET',
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
      setForm({ username: '', email: '', password: '', roleId: '', share: 0, matchCommPct: 0, sessionCommPct: 0, casinoCommPct: 0, matkaCommPct: 0, commissionType: 'BET BY BET' });
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
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-card border border-border p-6 shadow-2xl">
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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Top Section: Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Share & Commissions Layout */}
          <div className="pt-4 border-t border-border">
            <Text variant="small" weight="bold" className="mb-4 uppercase tracking-wider text-text-primary">
              Match and Share Info
            </Text>
            
            {(() => {
              const isAdmin = currentUser?.role && (typeof currentUser.role === 'object' ? currentUser.role.level === 0 : currentUser.role === 'ADMINISTRATOR');
              const defaultLimits = { share: 100, commissionType: 'BET BY BET', matchCommPct: 100, sessionCommPct: 100, casinoCommPct: 100, matkaCommPct: 100 };
              const myLimits = isAdmin ? defaultLimits : (currentUser?.reportConfig || { share: 0, commissionType: 'BET BY BET', matchCommPct: 0, sessionCommPct: 0, casinoCommPct: 0, matkaCommPct: 0 });
              const selectedRole = availableRoles.find(r => r.id === form.roleId);
              const targetLabel = selectedRole ? selectedRole.displayName.toUpperCase() : 'DOWNLINE';

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Share % */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Match Share*</label>
                    <input type="number" readOnly value={myLimits.share} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Match Share*</label>
                    <input type="number" min="0" max={myLimits.share} value={form.share} onChange={(e) => setForm((f) => ({ ...f, share: Number(e.target.value) }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")} />
                  </div>

                  {/* Commission Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Commission Type*</label>
                    <input type="text" readOnly value={myLimits.commissionType} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Commission Type*</label>
                    <select value={form.commissionType} onChange={(e) => setForm((f) => ({ ...f, commissionType: e.target.value }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")}>
                      <option value="BET BY BET">BET BY BET</option>
                      <option value="NO COMM">NO COMM</option>
                    </select>
                  </div>

                  {/* Match Comm */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Match Comm*</label>
                    <input type="number" readOnly value={myLimits.matchCommPct} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Match Comm*</label>
                    <input type="number" min="0" max={myLimits.matchCommPct} value={form.matchCommPct} onChange={(e) => setForm((f) => ({ ...f, matchCommPct: Number(e.target.value) }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")} />
                  </div>

                  {/* Session Comm */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Session Comm*</label>
                    <input type="number" readOnly value={myLimits.sessionCommPct} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Session Comm*</label>
                    <input type="number" min="0" max={myLimits.sessionCommPct} value={form.sessionCommPct} onChange={(e) => setForm((f) => ({ ...f, sessionCommPct: Number(e.target.value) }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")} />
                  </div>

                  {/* Casino Comm */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Casino Comm*</label>
                    <input type="number" readOnly value={myLimits.casinoCommPct} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Casino Comm*</label>
                    <input type="number" min="0" max={myLimits.casinoCommPct} value={form.casinoCommPct} onChange={(e) => setForm((f) => ({ ...f, casinoCommPct: Number(e.target.value) }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")} />
                  </div>

                  {/* Matka Comm */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5 uppercase tracking-wide">My Matka Comm*</label>
                    <input type="number" readOnly value={myLimits.matkaCommPct} className={cn(INPUT_CLS, "opacity-60 bg-background-tertiary cursor-not-allowed font-medium")} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-text-primary mb-1.5 uppercase tracking-wide">{targetLabel} Matka Comm*</label>
                    <input type="number" min="0" max={myLimits.matkaCommPct} value={form.matkaCommPct} onChange={(e) => setForm((f) => ({ ...f, matkaCommPct: Number(e.target.value) }))} className={cn(INPUT_CLS, "border-primary/30 focus:border-primary")} />
                  </div>
                </div>
              );
            })()}
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
