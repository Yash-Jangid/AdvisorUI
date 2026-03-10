'use client';

import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((s) => s.theme);

  // Sync theme to DOM on mount and on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
