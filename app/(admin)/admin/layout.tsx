'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

// Admin access: role level must be 0 (Administrator) or 1 (Admin).
// Lower level number = higher privilege in this system.
const ADMIN_MAX_LEVEL = 1; // levels 0 and 1 can access the admin panel

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Resolve role level from both old string format ('ADMINISTRATOR'/'ADMIN')
  // and new object format ({ level: number }) to survive stale cached sessions.
  const resolveRoleLevel = (): number => {
    const role = user?.role;
    if (!role) return 999;
    if (typeof role === 'object') return (role as { level: number }).level;
    // Fallback for stale string-format sessions
    const STRING_LEVELS: Record<string, number> = {
      ADMINISTRATOR: 0,
      ADMIN: 1,
      SUPER_MASTER: 2,
      MASTER: 3,
      AGENT: 4,
      USER: 5,
    };
    return STRING_LEVELS[(role as unknown as string)] ?? 999;
  };

  // Client-side guard: middleware handles server-side, this handles hydrated state.
  // While user is null (loading), allow through so the content renders.
  const hasAccess = user ? resolveRoleLevel() <= ADMIN_MAX_LEVEL : true;

  if (user && !hasAccess) {
    router.replace(ROUTES.user.dashboard);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-3">
        <Icon icon={Shield} size={24} className="text-error" />
        <Text variant="small" color="secondary">Access denied. Redirecting…</Text>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
