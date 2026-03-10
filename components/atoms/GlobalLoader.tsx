'use client';

import { useEffect, useState } from 'react';
import { useLoadingStore } from '@/lib/stores/loadingStore';

export function GlobalLoader() {
  const isLoading = useLoadingStore((s) => s.isLoading);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 12;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Complete and fade out
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed left-0 top-0 right-0 z-loader h-[2px] overflow-hidden"
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 8px hsl(var(--color-primary) / 0.6)',
        }}
      />
    </div>
  );
}
