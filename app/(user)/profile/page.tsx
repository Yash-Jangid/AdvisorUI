'use client';

import React, { useState } from 'react';
import { User, Mail, Shield, Wallet, Edit3, Check, X } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { UserAvatar } from '@/components/molecules/UserAvatar';
import { StatCard } from '@/components/molecules/StatCard';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatPoints } from '@/lib/utils/formatters';
import { useMyRank } from '@/lib/api/hooks/useLeaderboard';
import { cn } from '@/lib/utils/cn';

// ─── Editable field component ─────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave?: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onSave?.(draft.trim() || value);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Text variant="caption" color="tertiary" className="w-24 shrink-0">
        {label}
      </Text>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            className="flex-1 bg-background-secondary border border-primary/40 rounded-md px-3 py-1.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={commit} className="text-success hover:opacity-80 transition-opacity" aria-label="Save">
            <Icon icon={Check} size={16} />
          </button>
          <button onClick={cancel} className="text-error hover:opacity-80 transition-opacity" aria-label="Cancel">
            <Icon icon={X} size={16} />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between">
          <Text variant="small">{value || '—'}</Text>
          {onSave && (
            <button
              onClick={() => setEditing(true)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label={`Edit ${label}`}
            >
              <Icon icon={Edit3} size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: myRank, isLoading: rankLoading } = useMyRank();

  const roleDisplay = typeof user?.role === 'object' 
    ? (user.role.displayName || user.role.name) 
    : user?.role;

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <SkeletonCard lines={4} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Text variant="h2" weight="bold">Profile</Text>

        {/* Avatar + name card */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
          <UserAvatar name={user.username} size="lg" />
          <div>
            <Text variant="h3" weight="bold">{user.username}</Text>
            <Text variant="small" color="secondary" className="mt-0.5">
              {roleDisplay ?? 'User'} · Member
            </Text>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Wallet}
            label="Balance"
            value={`${formatPoints(user.balance ?? 0)} pts`}
            variant="info"
          />
          {rankLoading ? (
            <SkeletonCard lines={1} />
          ) : (
            <StatCard
              icon={Shield}
              label="Global Rank"
              value={myRank ? `#${myRank.rank}` : '—'}
              variant="success"
            />
          )}
        </div>

        {/* Account details */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <Text variant="small" weight="semibold">Account Details</Text>
          </div>
          <div className="px-5">
            <EditableField label="Username" value={user.username} />
            <EditableField label="Email" value={user.email ?? '—'} />
            <div className={cn('flex items-center gap-2 py-3')}>
              <Text variant="caption" color="tertiary" className="w-24 shrink-0">Role</Text>
              <div className="flex items-center gap-2">
                <Icon icon={Shield} size={14} className="text-primary" />
                <Text variant="small" weight="medium">{roleDisplay ?? 'User'}</Text>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
