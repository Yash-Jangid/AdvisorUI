import React from 'react';
import { CONFIG } from '@/lib/constants/config';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent-blue/10" />

        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 -right-20 h-80 w-80 rounded-full bg-accent-blue/5 blur-3xl" />

        <div className="relative z-10 text-center space-y-4 px-12">
          <div className="text-7xl">⚡</div>
          <h1 className="text-4xl font-black text-text-primary">
            {CONFIG.appName}
          </h1>
          <p className="text-text-secondary text-lg max-w-xs mx-auto">
            Virtual fantasy cricket prediction. Play with points, not money.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['Live SSE Scores', 'Real-time Leaderboard', 'Back & Lay'].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand */}
          <div className="text-center lg:hidden">
            <span className="text-4xl">⚡</span>
            <p className="text-lg font-bold text-text-primary mt-1">{CONFIG.appName}</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
