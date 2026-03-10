'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-background text-text-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚡</div>
          <h1 className="text-2xl font-bold text-text-primary">Something went wrong</h1>
          <p className="text-text-secondary text-sm">
            {error.message ?? 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-xs text-text-tertiary font-mono">Error ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
