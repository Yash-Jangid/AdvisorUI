'use client';

import React, { useTransition } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Moon, Sun, Menu, X, Download } from 'lucide-react';
import { useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { UserAvatar } from '@/components/molecules/UserAvatar';
import { useAuthStore } from '@/lib/stores/authStore';
import { useThemeStore } from '@/lib/stores/themeStore';
import { usePWA } from '@/lib/hooks/usePWA';
import { CONFIG } from '@/lib/constants/config';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

// ─── Component ────────────────────────────────────────────────────────────────

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({ onMobileMenuToggle, isMobileMenuOpen }: NavbarProps) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { theme, toggleTheme } = useThemeStore();
  const { canInstall, isInstalled, install } = usePWA();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import('@/lib/actions/auth.actions');
      await logoutAction();
      clearAuth();
      router.replace(ROUTES.auth.login);
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) toast.success('App installed! 🎉');
  };

  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-background-secondary/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
        >
          <Icon icon={isMobileMenuOpen ? X : Menu} size={22} />
        </button>

        {/* Brand */}
        <NextLink
          href={ROUTES.user.dashboard}
          className="flex items-center gap-2 font-bold text-text-primary"
        >
          <span className="text-primary text-lg">⚡</span>
          <span className="hidden sm:block">{CONFIG.appName}</span>
        </NextLink>

        {/* Spacer */}
        <div className="flex-1" />

        {/* PWA install button — only when installable and not yet installed */}
        {canInstall && !isInstalled && (
          <button
            type="button"
            onClick={handleInstall}
            aria-label="Install app"
            title="Install app"
            className="rounded-lg p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors animate-pulse"
          >
            <Icon icon={Download} size={18} />
          </button>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="rounded-lg p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors"
        >
          <Icon icon={theme === 'dark' ? Sun : Moon} size={18} />
        </button>

        {/* User menu */}
        {user && (
          <div className="flex items-center gap-2">
            <UserAvatar name={user.name || 'User'} size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="rounded-lg p-2 text-text-secondary hover:text-error hover:bg-error/10 transition-colors"
            >
              <Icon icon={LogOut} size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
