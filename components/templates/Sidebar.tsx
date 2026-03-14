'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Zap, TrendingUp, Wallet, Settings, Shield, User, Users, LogOut, Activity, BarChart2, Dices
} from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { logoutAction } from '@/lib/actions/auth.actions';

// ─── Nav Items ────────────────────────────────────────────────────────────────

const userNavItems = [
  { href: ROUTES.user.dashboard, icon: LayoutDashboard, label: 'Dashboard' },
  { href: ROUTES.user.matches, icon: Zap, label: 'Matches' },
  { href: ROUTES.user.predictions, icon: TrendingUp, label: 'Predictions' },
  { href: ROUTES.user.leaderboard, icon: Trophy, label: 'Leaderboard' },
  { href: ROUTES.user.ledger, icon: Wallet, label: 'Ledger' },
  { href: ROUTES.user.myTeam, icon: Users, label: 'My Team' },
  { href: ROUTES.user.casino, icon: Dices, label: 'Casino' },
  { href: ROUTES.user.profile, icon: User, label: 'Profile' },
] as const;

// Shown ONLY for sub-admin roles (canHaveChild but not top-level admin)
const subAdminNavItems = [
  { href: ROUTES.user.transactions, icon: BarChart2, label: 'Transactions' },
] as const;

const adminNavItems = [
  { href: ROUTES.admin.matches, icon: Settings, label: 'Matches' },
  { href: ROUTES.admin.users, icon: Shield, label: 'Users' },
] as const;

const rootAdminNavItems = [
  { href: ROUTES.admin.roles, icon: Settings, label: 'Roles' },
  { href: ROUTES.admin.marketConfigs, icon: Settings, label: 'Market Configs' },
  { href: ROUTES.admin.treasury, icon: Wallet, label: 'Treasury' },
  { href: ROUTES.admin.auditLogs, icon: Activity, label: 'Audit Logs' },
  { href: ROUTES.admin.systemConfig, icon: Settings, label: 'System Config' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Safely check role name whether it's the old string format or the new object format
  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
  const roleLevel = typeof user?.role === 'object' ? (user?.role as any)?.level : undefined;
  const isAdmin = roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'administrator';
  const isSubAdminTier = user?.canHaveChild && !isAdmin; // Agent / Master / Super-Master — not top-level admin

  const handleLogout = async () => {
    clearAuth();
    await logoutAction();
  };

  const NavLink = ({ href, icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <NextLink
        href={href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon icon={icon} size={18} className="shrink-0" />
        {label}
        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
      </NextLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-modal bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-14 z-sticky h-[calc(100vh-3.5rem)] w-60',
          'border-r border-border bg-background-secondary',
          'flex flex-col gap-1 overflow-y-auto py-4 px-3',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:h-auto lg:z-auto'
        )}
      >
        <nav aria-label="Main navigation">
          <Text variant="caption" color="tertiary" className="px-3 mb-2 uppercase tracking-widest font-semibold">
            Menu
          </Text>

          {userNavItems.map((item) => {
            // Hide My Team if the user cannot have children
            if (item.href === ROUTES.user.myTeam && !user?.canHaveChild) {
              return null;
            }

            // Hide Predictions and Leaderboard for Managerial Roles (Admin, Master, Agent)
            if (
              user?.canHaveChild &&
              (item.href === ROUTES.user.predictions || item.href === ROUTES.user.leaderboard)
            ) {
              return null;
            }

            return (
              <NavLink key={item.href} {...item} />
            );
          })}

          {/* Sub-admin tier: Transactions view (Agent / Master / Super-Master) */}
          {isSubAdminTier && (
            <>
              <Text variant="caption" color="tertiary" className="px-3 mt-4 mb-2 uppercase tracking-widest font-semibold">
                My Team
              </Text>
              {subAdminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}

          {isAdmin && (
            <>
              <Text variant="caption" color="tertiary" className="px-3 mt-4 mb-2 uppercase tracking-widest font-semibold">
                Admin
              </Text>
              {adminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
              {/* Root-Admin-only: Roles, Treasury, Audit Logs */}
              {(roleLevel === 0 || roleLevel === undefined) && rootAdminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}

          <div className="mt-8 px-1">
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'text-error hover:bg-error/10'
              )}
            >
              <Icon icon={LogOut} size={18} className="shrink-0" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
