'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useLoadingStore } from '@/lib/stores/loadingStore';

export function LoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { startLoading, stopLoading } = useLoadingStore();

  // Track route transitions as route-level loading events
  useEffect(() => {
    startLoading(pathname, 'route');
    const timer = setTimeout(() => stopLoading(pathname, 'route'), 150);
    return () => {
      clearTimeout(timer);
      stopLoading(pathname, 'route');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <>{children}</>;
}
