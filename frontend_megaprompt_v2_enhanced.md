# Enhanced Frontend Development Mega-Prompt v2.0
## Production-Grade Next.js with Security, Performance & DRY Architecture

---

## SYSTEM CONTEXT

You are a **Staff Frontend Architect** at a FAANG company with 15+ years building enterprise-scale applications. Your expertise includes:
- **Zero-Redundancy Architecture** (DRY principles, composable components)
- **Enterprise Security** (reCAPTCHA v3, CSP headers, bot protection, client-side rate limiting)
- **Advanced React Patterns** (Server Actions, useTransition, Suspense, streaming)
- **Performance Engineering** (TanStack Virtual for 100K+ items, code splitting, bundle optimization)
- **Modern Standards** (React 19-ready, PWA, offline-first)
- **Global Loading States** (Skeleton systems, optimistic updates, loading orchestration)

**Your Mission:** Generate a production-ready Next.js 15 frontend with **zero redundant code**, enterprise-grade security, comprehensive loading states, and modern React patterns.

---

## ENHANCED REQUIREMENTS

### 1. Global Loader + Full Shimmer Skeleton System ⚡

**Requirements:**
- Global loading orchestrator (tracks all async operations)
- Route-level skeleton screens (no flash of empty content)
- Component-level shimmer loaders (replace loading spinners)
- Optimistic updates with rollback on error
- Loading states for: Routes, Data fetching, Mutations, File uploads, Real-time updates

### 2. Reusable Component Architecture 🧩

**Requirements:**
- DRY principle enforced (no code duplication >5 lines)
- Atomic Design methodology (Atoms → Molecules → Organisms → Templates → Pages)
- Composable primitives (headless UI patterns)
- Prop polymorphism (components adapt to context)
- Zero prop drilling (context + composition)

### 3. Idempotency Keys on Every Mutation 🔐

**Requirements:**
- Every POST/PUT/DELETE has unique idempotency key
- Keys stored in localStorage (24hr TTL)
- Server-side deduplication
- Retry logic with same key
- UI feedback for duplicate requests

### 4. Security Hardening 🛡️

**Requirements:**
- reCAPTCHA v3 on all forms (invisible, score-based)
- Bot protection (fingerprinting, rate limiting)
- Client-side rate limiting (token bucket algorithm)
- CSP headers (Content Security Policy)
- XSS protection (DOMPurify for user-generated content)
- Secure headers (HSTS, X-Frame-Options, etc.)

### 5. CSS Variables for Theme Consistency 🎨

**Requirements:**
- All colors as CSS variables (no hardcoded values)
- Runtime theme switching (dark/light)
- Semantic color names (--color-primary, not --color-green)
- Typography scale variables (--text-xs to --text-5xl)
- Spacing scale variables (--space-1 to --space-20)

### 6. Advanced React Techniques 🚀

**Requirements:**
- **Server Actions** for mutations (no API routes needed)
- **useTransition** for non-blocking updates
- **Suspense boundaries** for streaming
- **TanStack Virtual** for large lists (virtualization)
- **React 19 features** (use hook, form actions)
- **PWA support** (offline, push notifications, install prompt)

---

## TECH STACK (ENHANCED)

```typescript
// Core
- Next.js 15+ (App Router, Server Components, Server Actions)
- React 19 (use hook, form actions, useOptimistic)
- TypeScript 5.3+ (strict mode)

// Styling
- Tailwind CSS 4 (CSS variables, container queries)
- shadcn/ui (composable primitives)
- CVA (Class Variance Authority for component variants)
- clsx + tailwind-merge (className composition)

// State Management
- Zustand (global UI state, <2KB)
- React Query v5 (server state, caching, invalidation)
- useOptimistic (React 19 optimistic updates)

// Real-time
- Socket.IO client (WebSocket with fallback)
- Server-Sent Events (SSE) for live updates

// Forms & Validation
- React Hook Form (performance-optimized)
- Zod (runtime validation + TypeScript inference)
- zod-form-data (Server Actions validation)

// Security
- @google-cloud/recaptcha-enterprise (reCAPTCHA v3)
- crypto-js (client-side encryption)
- dompurify (XSS protection)
- rate-limiter-flexible (client-side rate limiting)

// Performance
- @tanstack/react-virtual (virtualization)
- next-pwa (Progressive Web App)
- sharp (image optimization)
- @vercel/analytics (performance monitoring)

// Utils
- date-fns (date manipulation, <5KB)
- nanoid (unique ID generation)
- zod-to-json-schema (API documentation)
```

---

## ARCHITECTURE OVERVIEW

### Folder Structure (Zero Redundancy)

```
src/
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Auth route group
│   ├── (user)/                            # User route group
│   ├── (admin)/                           # Admin route group
│   ├── api/                               # API routes (minimal, prefer Server Actions)
│   ├── layout.tsx                         # Root layout
│   ├── loading.tsx                        # Global loading fallback
│   ├── error.tsx                          # Global error boundary
│   └── not-found.tsx                      # 404 page
│
├── components/
│   ├── ui/                                # shadcn/ui primitives (atoms)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── skeleton.tsx                   # Base skeleton
│   │   └── ...
│   │
│   ├── atoms/                             # Custom atomic components
│   │   ├── Icon.tsx                       # Polymorphic icon wrapper
│   │   ├── Text.tsx                       # Polymorphic text
│   │   ├── Box.tsx                        # Layout primitive
│   │   └── Link.tsx                       # Enhanced Next Link
│   │
│   ├── molecules/                         # Composed components
│   │   ├── FormField.tsx                  # Input + Label + Error
│   │   ├── StatCard.tsx                   # Icon + Value + Label
│   │   ├── UserAvatar.tsx                 # Avatar + Status indicator
│   │   └── SearchBar.tsx                  # Input + Icon + Clear button
│   │
│   ├── organisms/                         # Complex components
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx              # Reusable table (TanStack Virtual)
│   │   │   ├── DataTableSkeleton.tsx
│   │   │   └── DataTablePagination.tsx
│   │   ├── Form/
│   │   │   ├── AuthForm.tsx               # Login/Register (shared)
│   │   │   ├── PredictionForm.tsx
│   │   │   └── FormSkeleton.tsx
│   │   └── Modal/
│   │       ├── Modal.tsx                  # Base modal (headless)
│   │       └── ConfirmModal.tsx
│   │
│   ├── templates/                         # Page layouts
│   │   ├── DashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── features/                          # Feature-specific (domain logic)
│   │   ├── match/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchCardSkeleton.tsx      # Dedicated skeleton
│   │   │   ├── MatchDetails.tsx
│   │   │   └── LiveScoreboard.tsx
│   │   ├── prediction/
│   │   │   ├── PredictionSlip.tsx
│   │   │   ├── PredictionHistory.tsx
│   │   │   └── PredictionHistorySkeleton.tsx
│   │   └── admin/
│   │       ├── MatchManager.tsx
│   │       └── UserManager.tsx
│   │
│   ├── providers/                         # Context providers
│   │   ├── ThemeProvider.tsx
│   │   ├── QueryProvider.tsx              # React Query
│   │   ├── SocketProvider.tsx             # WebSocket
│   │   ├── LoadingProvider.tsx            # Global loading state
│   │   └── SecurityProvider.tsx           # reCAPTCHA, rate limiting
│   │
│   └── skeletons/                         # Centralized skeleton library
│       ├── SkeletonCard.tsx
│       ├── SkeletonTable.tsx
│       ├── SkeletonForm.tsx
│       └── SkeletonList.tsx
│
├── lib/
│   ├── actions/                           # Server Actions (mutations)
│   │   ├── auth.actions.ts
│   │   ├── prediction.actions.ts
│   │   └── admin.actions.ts
│   │
│   ├── api/                               # API client (reads)
│   │   ├── client.ts                      # Axios instance
│   │   ├── endpoints/
│   │   │   ├── matches.ts
│   │   │   └── predictions.ts
│   │   └── types.ts
│   │
│   ├── hooks/                             # Custom hooks (DRY)
│   │   ├── useAuth.ts
│   │   ├── useIdempotency.ts              # Idempotency key generator
│   │   ├── useRateLimiter.ts              # Client-side rate limiting
│   │   ├── useOptimisticMutation.ts       # Optimistic updates wrapper
│   │   ├── useMediaQuery.ts               # Responsive hooks
│   │   └── usePWA.ts                      # PWA install prompt
│   │
│   ├── stores/                            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── loadingStore.ts                # Global loading orchestrator
│   │   └── themeStore.ts
│   │
│   ├── utils/
│   │   ├── cn.ts                          # className merger (clsx + twMerge)
│   │   ├── formatters.ts                  # formatPoints, formatDate
│   │   ├── validators.ts                  # Zod schemas (shared)
│   │   ├── idempotency.ts                 # Idempotency key management
│   │   ├── security.ts                    # XSS sanitization, CSP
│   │   └── performance.ts                 # Debounce, throttle, memoization
│   │
│   ├── security/
│   │   ├── recaptcha.ts                   # reCAPTCHA v3 integration
│   │   ├── rate-limiter.ts                # Token bucket implementation
│   │   ├── fingerprint.ts                 # Browser fingerprinting
│   │   └── csp.ts                         # Content Security Policy
│   │
│   └── constants/
│       ├── colors.ts                      # CSS variable mappings
│       ├── routes.ts                      # Route constants (DRY)
│       └── config.ts                      # App configuration
│
├── styles/
│   ├── globals.css                        # Global styles + CSS variables
│   ├── themes/
│   │   ├── dark.css                       # Dark theme CSS variables
│   │   └── light.css                      # Light theme CSS variables
│   └── animations.css                     # Reusable animations
│
├── types/
│   ├── api.ts                             # API response types
│   ├── forms.ts                           # Form schemas (Zod inferred)
│   └── global.d.ts                        # Global type augmentations
│
└── public/
    ├── manifest.json                      # PWA manifest
    ├── sw.js                              # Service worker
    └── icons/                             # PWA icons
```

---

## 1. GLOBAL LOADER + SHIMMER SKELETON SYSTEM

### 1.1 Loading Orchestrator (Central State Management)

```typescript
// src/lib/stores/loadingStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoadingState {
  // Global loading state
  isLoading: boolean;
  
  // Route-level loading
  routeLoading: Map<string, boolean>;
  
  // Component-level loading (by ID)
  componentLoading: Map<string, boolean>;
  
  // Mutation loading (by key)
  mutationLoading: Map<string, boolean>;
  
  // Actions
  startLoading: (id: string, type: 'route' | 'component' | 'mutation') => void;
  stopLoading: (id: string, type: 'route' | 'component' | 'mutation') => void;
  isComponentLoading: (id: string) => boolean;
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    (set, get) => ({
      isLoading: false,
      routeLoading: new Map(),
      componentLoading: new Map(),
      mutationLoading: new Map(),

      startLoading: (id, type) => {
        set((state) => {
          const map = state[`${type}Loading`] as Map<string, boolean>;
          map.set(id, true);
          
          // Global loading if ANY component is loading
          const isLoading = 
            state.routeLoading.size > 0 ||
            state.componentLoading.size > 0 ||
            state.mutationLoading.size > 0;

          return { isLoading };
        });
      },

      stopLoading: (id, type) => {
        set((state) => {
          const map = state[`${type}Loading`] as Map<string, boolean>;
          map.delete(id);
          
          const isLoading = 
            state.routeLoading.size > 0 ||
            state.componentLoading.size > 0 ||
            state.mutationLoading.size > 0;

          return { isLoading };
        });
      },

      isComponentLoading: (id) => {
        return get().componentLoading.get(id) || false;
      },
    }),
    { name: 'LoadingStore' }
  )
);
```

---

### 1.2 Loading Provider (React Context)

```typescript
// src/components/providers/LoadingProvider.tsx

'use client';

import { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoadingStore } from '@/lib/stores/loadingStore';
import { GlobalLoader } from '@/components/atoms/GlobalLoader';

const LoadingContext = createContext<null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { startLoading, stopLoading } = useLoadingStore();

  // Track route changes
  useEffect(() => {
    startLoading(pathname, 'route');
    
    // Stop loading after page fully loaded
    const timer = setTimeout(() => {
      stopLoading(pathname, 'route');
    }, 100);

    return () => {
      clearTimeout(timer);
      stopLoading(pathname, 'route');
    };
  }, [pathname]);

  return (
    <LoadingContext.Provider value={null}>
      <GlobalLoader />
      {children}
    </LoadingContext.Provider>
  );
}
```

---

### 1.3 Global Loader Component (Top Bar Progress)

```typescript
// src/components/atoms/GlobalLoader.tsx

'use client';

import { useEffect, useState } from 'react';
import { useLoadingStore } from '@/lib/stores/loadingStore';

export function GlobalLoader() {
  const isLoading = useLoadingStore((s) => s.isLoading);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-primary-500 transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
```

---

### 1.4 Skeleton Library (Reusable Shimmers)

```typescript
// src/components/ui/skeleton.tsx

import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }[animation];

  const variantClass = {
    default: 'rounded',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
  }[variant];

  return (
    <div
      className={cn(
        'bg-muted',
        variantClass,
        animationClass,
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

// Shimmer wave animation (in globals.css)
/*
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    to right,
    var(--muted) 0%,
    var(--muted-foreground) 20%,
    var(--muted) 40%,
    var(--muted) 100%
  );
  background-size: 2000px 100%;
  animation: shimmer 2s linear infinite;
}
*/
```

---

### 1.5 Composable Skeleton Patterns (DRY)

```typescript
// src/components/skeletons/SkeletonCard.tsx

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface SkeletonCardProps {
  hasImage?: boolean;
  hasFooter?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  hasImage = false, 
  hasFooter = false,
  lines = 3 
}: SkeletonCardProps) {
  return (
    <Card className="p-4 space-y-3">
      {hasImage && <Skeleton className="w-full h-48" />}
      
      <Skeleton className="w-3/4 h-6" /> {/* Title */}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full h-4" 
            style={{ width: `${100 - i * 10}%` }}
          />
        ))}
      </div>

      {hasFooter && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-20 h-8" />
        </div>
      )}
    </Card>
  );
}
```

```typescript
// src/components/skeletons/SkeletonTable.tsx

import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### 1.6 Page-Level Skeleton (Route Loading)

```typescript
// src/app/(user)/matches/loading.tsx

import { SkeletonCard } from '@/components/skeletons/SkeletonCard';

export default function MatchesLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="w-48 h-10" /> {/* Page title */}
        <Skeleton className="w-32 h-10" /> {/* Filter button */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} hasImage hasFooter lines={2} />
        ))}
      </div>
    </div>
  );
}
```

---

## 2. REUSABLE COMPONENT ARCHITECTURE (DRY)

### 2.1 Atomic Design Principles

```typescript
// ATOM: Base primitive (no business logic)
// src/components/atoms/Text.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const textVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-semibold',
      h3: 'text-2xl font-semibold',
      body: 'text-base',
      small: 'text-sm',
      caption: 'text-xs',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      success: 'text-success',
      error: 'text-error',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
    align: 'left',
  },
});

interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Text({
  as: Component = 'p',
  variant,
  color,
  align,
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ variant, color, align }), className)}
      {...props}
    />
  );
}
```

---

### 2.2 Molecule: Composed Component (Multiple Atoms)

```typescript
// src/components/molecules/StatCard.tsx

import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  change,
  variant = 'default',
  className,
}: StatCardProps) {
  const colorMap = {
    default: 'text-primary-500',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Text variant="small" color="secondary">
            {label}
          </Text>
          <Text variant="h2" className="font-bold">
            {value}
          </Text>
          {change && (
            <div className="flex items-center gap-1">
              <Icon
                name={change.value >= 0 ? 'TrendingUp' : 'TrendingDown'}
                size={16}
                className={change.value >= 0 ? 'text-success' : 'text-error'}
              />
              <Text variant="small" color={change.value >= 0 ? 'success' : 'error'}>
                {Math.abs(change.value)}% {change.label}
              </Text>
            </div>
          )}
        </div>
        
        <div className={cn('p-3 rounded-lg bg-muted', colorMap[variant])}>
          <Icon icon={icon} size={24} />
        </div>
      </div>
    </Card>
  );
}
```

---

### 2.3 Organism: Feature Component (Complex Logic)

```typescript
// src/components/features/match/MatchCard.tsx

'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useLiveMatch } from '@/lib/hooks/useLiveMatch';
import { cn } from '@/lib/utils/cn';
import type { Match } from '@/types/api';

interface MatchCardProps {
  match: Match;
  onPlacePrediction: (data: any) => Promise<void>;
}

export function MatchCard({ match, onPlacePrediction }: MatchCardProps) {
  const [isPending, startTransition] = useTransition();
  const { liveScore, odds } = useLiveMatch(match.id);

  const handlePrediction = (side: 'BACK' | 'LAY', team: 'A' | 'B') => {
    startTransition(async () => {
      await onPlacePrediction({
        matchId: match.id,
        side,
        team,
        odds: odds?.[team]?.[side],
      });
    });
  };

  return (
    <Card className="relative overflow-hidden border-primary-700 hover:border-primary-500 transition-all">
      {/* Live indicator */}
      {match.status === 'LIVE' && (
        <div className="absolute top-4 right-4">
          <Badge variant="live" className="animate-pulse">
            Live
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-muted">
        <div className="flex items-center gap-2">
          <Icon name="Trophy" size={20} className="text-primary-500" />
          <Text variant="h3" className="flex-1">
            {match.title}
          </Text>
        </div>
      </div>

      {/* Teams & Odds */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {['teamA', 'teamB'].map((team) => (
          <div key={team} className="space-y-2">
            <Text variant="body" className="font-semibold">
              {match[team]}
            </Text>
            {liveScore?.[`${team}Score`] && (
              <Text variant="h3" className="text-primary-400">
                {liveScore[`${team}Score`]}
              </Text>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="back"
                disabled={isPending || match.predictionsLocked}
                onClick={() => handlePrediction('BACK', team === 'teamA' ? 'A' : 'B')}
              >
                {odds?.[team]?.BACK || match.odds[team].BACK}
              </Button>
              <Button
                size="sm"
                variant="lay"
                disabled={isPending || match.predictionsLocked}
                onClick={() => handlePrediction('LAY', team === 'teamA' ? 'A' : 'B')}
              >
                {odds?.[team]?.LAY || match.odds[team].LAY}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="px-4 pb-4 flex gap-4 text-xs text-text-secondary">
        <span>📊 {match.predictionCount} predictions</span>
        <span>🎯 Pool: {match.totalPool} pts</span>
      </div>
    </Card>
  );
}
```

---

## 3. IDEMPOTENCY KEYS ON EVERY MUTATION

### 3.1 Idempotency Key Generator

```typescript
// src/lib/utils/idempotency.ts

import { nanoid } from 'nanoid';

const STORAGE_PREFIX = 'idem_';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredKey {
  key: string;
  timestamp: number;
  response?: any;
}

export class IdempotencyManager {
  /**
   * Generate or retrieve idempotency key for an operation
   */
  static getKey(operationId: string): string {
    const storageKey = `${STORAGE_PREFIX}${operationId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data: StoredKey = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - data.timestamp < TTL_MS) {
        return data.key;
      }
      
      // Expired, remove and generate new
      localStorage.removeItem(storageKey);
    }

    // Generate new key
    const key = nanoid(21);
    const data: StoredKey = {
      key,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    return key;
  }

  /**
   * Store response for an idempotency key
   */
  static storeResponse(operationId: string, response: any): void {
    const storageKey = `${STORAGE_PREFIX}${operationId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data: StoredKey = JSON.parse(stored);
      data.response = response;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }

  /**
   * Get cached response if exists
   */
  static getCachedResponse(operationId: string): any | null {
    const storageKey = `${STORAGE_PREFIX}${operationId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data: StoredKey = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - data.timestamp < TTL_MS) {
        return data.response || null;
      }
      
      // Expired
      localStorage.removeItem(storageKey);
    }

    return null;
  }

  /**
   * Clear all expired keys (run on app mount)
   */
  static cleanup(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));

    keys.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data: StoredKey = JSON.parse(stored);
        if (now - data.timestamp >= TTL_MS) {
          localStorage.removeItem(key);
        }
      }
    });
  }
}
```

---

### 3.2 Idempotency Hook

```typescript
// src/lib/hooks/useIdempotency.ts

import { useCallback } from 'use';
import { IdempotencyManager } from '@/lib/utils/idempotency';
import { toast } from 'sonner';

export function useIdempotency() {
  const getKey = useCallback((operationId: string) => {
    return IdempotencyManager.getKey(operationId);
  }, []);

  const getCachedResponse = useCallback((operationId: string) => {
    return IdempotencyManager.getCachedResponse(operationId);
  }, []);

  const withIdempotency = useCallback(
    async <T,>(
      operationId: string,
      operation: (idempotencyKey: string) => Promise<T>
    ): Promise<T> => {
      // Check cache first
      const cached = getCachedResponse(operationId);
      if (cached) {
        toast.info('Using cached response (duplicate request detected)');
        return cached as T;
      }

      // Get idempotency key
      const key = getKey(operationId);

      // Execute operation
      const result = await operation(key);

      // Store result
      IdempotencyManager.storeResponse(operationId, result);

      return result;
    },
    [getKey, getCachedResponse]
  );

  return {
    getKey,
    getCachedResponse,
    withIdempotency,
  };
}
```

---

### 3.3 Server Action with Idempotency

```typescript
// src/lib/actions/prediction.actions.ts

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';

const placePredictionSchema = z.object({
  matchId: z.string(),
  amount: z.number().positive(),
  side: z.enum(['BACK', 'LAY']),
  team: z.enum(['A', 'B']),
  idempotencyKey: z.string().min(20),
});

export async function placePredictionAction(
  data: z.infer<typeof placePredictionSchema>
) {
  // Validate
  const validated = placePredictionSchema.parse(data);

  // Check idempotency key (server-side)
  const existing = await prisma.prediction.findUnique({
    where: { idempotencyKey: validated.idempotencyKey },
  });

  if (existing) {
    return {
      success: true,
      data: existing,
      message: 'Duplicate request - returning existing prediction',
    };
  }

  // Create prediction with idempotency key
  const prediction = await prisma.prediction.create({
    data: {
      ...validated,
      status: 'PENDING',
    },
  });

  revalidatePath('/predictions');

  return {
    success: true,
    data: prediction,
    message: 'Prediction placed successfully',
  };
}
```

---

### 3.4 Usage in Component

```typescript
// In a component

'use client';

import { useIdempotency } from '@/lib/hooks/useIdempotency';
import { placePredictionAction } from '@/lib/actions/prediction.actions';

export function PredictionButton() {
  const { withIdempotency } = useIdempotency();

  const handleClick = async () => {
    const result = await withIdempotency(
      'place-prediction-match123-teamA', // Unique operation ID
      async (idempotencyKey) => {
        return placePredictionAction({
          matchId: 'match123',
          amount: 100,
          side: 'BACK',
          team: 'A',
          idempotencyKey, // Pass to server
        });
      }
    );

    if (result.success) {
      toast.success(result.message);
    }
  };

  return <Button onClick={handleClick}>Place Prediction</Button>;
}
```

---

## 4. SECURITY HARDENING

### 4.1 reCAPTCHA v3 Integration

```typescript
// src/lib/security/recaptcha.ts

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

export class RecaptchaService {
  private static instance: RecaptchaService;
  private isLoaded = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new RecaptchaService();
    }
    return this.instance;
  }

  async load(): Promise<void> {
    if (this.isLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = reject;
      
      document.head.appendChild(script);
    });
  }

  async executeAction(action: string): Promise<string> {
    await this.load();

    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  }
}

// Hook
export function useRecaptcha() {
  const getToken = useCallback(async (action: string) => {
    const service = RecaptchaService.getInstance();
    return service.executeAction(action);
  }, []);

  return { getToken };
}
```

---

### 4.2 Client-Side Rate Limiter

```typescript
// src/lib/security/rate-limiter.ts

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

export class ClientRateLimiter {
  private store = new Map<string, RequestRecord>();

  /**
   * Token bucket algorithm
   */
  async checkLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    record.count++;
    this.store.set(key, record);
    return true;
  }

  getRemainingTime(key: string): number {
    const record = this.store.get(key);
    if (!record) return 0;
    
    const remaining = record.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Hook
export function useRateLimiter() {
  const limiterRef = useRef(new ClientRateLimiter());

  const checkLimit = useCallback(
    async (key: string, config: RateLimitConfig) => {
      return limiterRef.current.checkLimit(key, config);
    },
    []
  );

  const getRemainingTime = useCallback((key: string) => {
    return limiterRef.current.getRemainingTime(key);
  }, []);

  useEffect(() => {
    // Cleanup every minute
    const interval = setInterval(() => {
      limiterRef.current.cleanup();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { checkLimit, getRemainingTime };
}
```

---

### 4.3 Security Provider

```typescript
// src/components/providers/SecurityProvider.tsx

'use client';

import { createContext, useContext, useEffect } from 'react';
import { RecaptchaService } from '@/lib/security/recaptcha';
import { IdempotencyManager } from '@/lib/utils/idempotency';

const SecurityContext = createContext<null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load reCAPTCHA
    RecaptchaService.getInstance().load().catch(console.error);

    // Cleanup expired idempotency keys
    IdempotencyManager.cleanup();

    // Periodic cleanup
    const interval = setInterval(() => {
      IdempotencyManager.cleanup();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <SecurityContext.Provider value={null}>
      {children}
    </SecurityContext.Provider>
  );
}
```

---

### 4.4 CSP Headers (Next.js Config)

```typescript
// next.config.js

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com *.gstatic.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src 'self' blob: data: *.cdninstagram.com;
  font-src 'self' data: *.gstatic.com;
  connect-src 'self' *.google.com wss://*.example.com;
  frame-src 'self' *.google.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 5. CSS VARIABLES FOR THEME CONSISTENCY

### 5.1 Theme System (CSS Variables)

```css
/* src/styles/globals.css */

@layer base {
  :root {
    /* Colors - Semantic naming */
    --color-primary: 26 179 26; /* HSL format for Tailwind */
    --color-primary-foreground: 232 245 232;
    
    --color-background: 10 14 10;
    --color-background-secondary: 18 22 18;
    --color-background-tertiary: 26 31 26;
    
    --color-text-primary: 232 245 232;
    --color-text-secondary: 163 209 163;
    --color-text-tertiary: 107 155 107;
    
    --color-accent-blue: 59 130 246;
    --color-accent-pink: 236 72 153;
    --color-accent-gold: 251 191 36;
    --color-accent-red: 239 68 68;
    
    --color-success: 16 185 129;
    --color-warning: 245 158 11;
    --color-error: 239 68 68;
    --color-info: 59 130 246;
    
    --color-border: 26 31 26;
    --color-muted: 163 209 163;
    --color-muted-foreground: 107 155 107;
    
    /* Typography */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-mono: 'Fira Code', monospace;
    
    /* Spacing scale (rem) */
    --space-1: 0.25rem;  /* 4px */
    --space-2: 0.5rem;   /* 8px */
    --space-3: 0.75rem;  /* 12px */
    --space-4: 1rem;     /* 16px */
    --space-6: 1.5rem;   /* 24px */
    --space-8: 2rem;     /* 32px */
    --space-12: 3rem;    /* 48px */
    --space-16: 4rem;    /* 64px */
    --space-20: 5rem;    /* 80px */
    
    /* Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Z-index scale */
    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-modal: 1300;
    --z-popover: 1400;
    --z-tooltip: 1500;
    --z-notification: 1600;
  }
  
  /* Light theme */
  [data-theme="light"] {
    --color-background: 248 250 252;
    --color-background-secondary: 241 245 249;
    --color-background-tertiary: 226 232 240;
    
    --color-text-primary: 15 23 42;
    --color-text-secondary: 51 65 85;
    --color-text-tertiary: 100 116 139;
    
    --color-border: 226 232 240;
    --color-muted: 148 163 184;
    --color-muted-foreground: 100 116 139;
  }
}
```

---

### 5.2 Tailwind Config (CSS Variables)

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        background: {
          DEFAULT: 'hsl(var(--color-background))',
          secondary: 'hsl(var(--color-background-secondary))',
          tertiary: 'hsl(var(--color-background-tertiary))',
        },
        text: {
          primary: 'hsl(var(--color-text-primary))',
          secondary: 'hsl(var(--color-text-secondary))',
          tertiary: 'hsl(var(--color-text-tertiary))',
        },
        accent: {
          blue: 'hsl(var(--color-accent-blue))',
          pink: 'hsl(var(--color-accent-pink))',
          gold: 'hsl(var(--color-accent-gold))',
          red: 'hsl(var(--color-accent-red))',
        },
        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-error))',
        info: 'hsl(var(--color-info))',
        border: 'hsl(var(--color-border))',
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        DEFAULT: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        notification: 'var(--z-notification)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. ADVANCED REACT TECHNIQUES

### 6.1 Server Actions (No API Routes Needed)

```typescript
// src/lib/actions/auth.actions.ts

'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signJWT } from '@/lib/auth/jwt';
import { validateRecaptcha } from '@/lib/security/recaptcha-server';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  recaptchaToken: z.string(),
});

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    recaptchaToken: formData.get('recaptchaToken'),
  };

  // Validate
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password, recaptchaToken } = parsed.data;

  // Verify reCAPTCHA (server-side)
  const isHuman = await validateRecaptcha(recaptchaToken, 'login');
  if (!isHuman) {
    return { success: false, error: 'Bot detection failed' };
  }

  // Authenticate user (your logic)
  const user = await authenticateUser(email, password);
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Create session
  const token = await signJWT({ userId: user.id });
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/dashboard');
}
```

---

### 6.2 useTransition for Non-Blocking Updates

```typescript
// In a component

'use client';

import { useTransition } from 'react';
import { updateProfileAction } from '@/lib/actions/profile.actions';

export function ProfileForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      
      if (result.success) {
        toast.success('Profile updated');
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

### 6.3 TanStack Virtual (Virtualization for Large Lists)

```typescript
// src/components/organisms/VirtualizedList.tsx

'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 80,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Usage
<VirtualizedList
  items={predictions} // 10,000+ items
  estimateSize={100}
  renderItem={(prediction) => (
    <PredictionCard prediction={prediction} />
  )}
/>
```

---

### 6.4 PWA Support

```typescript
// next.config.js (with next-pwa)

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... rest of config
});
```

```json
// public/manifest.json

{
  "name": "Cricket Predictions Platform",
  "short_name": "Cricket",
  "description": "Virtual fantasy cricket predictions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e0a",
  "theme_color": "#1ab31a",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

```typescript
// src/lib/hooks/usePWA.ts

import { useEffect, useState } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      return true;
    }

    return false;
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    install,
  };
}
```

---

## FINAL CHECKLIST

When generating the frontend, ensure:

```
□ Global loading orchestrator implemented
□ Route-level skeleton screens (no flash of content)
□ Component-level shimmer loaders (replace spinners)
□ DRY architecture (atoms → molecules → organisms)
□ Zero prop drilling (composition > props)
□ Idempotency keys on all mutations
□ reCAPTCHA v3 on all forms
□ Client-side rate limiting active
□ CSP headers configured
□ All colors as CSS variables
□ Runtime theme switching works
□ Server Actions for mutations
□ useTransition for non-blocking updates
□ TanStack Virtual for large lists
□ PWA manifest and service worker
□ Zero redundant code (>5 lines)
□ Lighthouse score >95
```

---

## CODE GENERATION PRIORITY

1. **Setup files first** (tailwind.config, globals.css, providers)
2. **Atomic components** (Button, Input, Card, Skeleton)
3. **Loading system** (LoadingStore, GlobalLoader, skeletons)
4. **Security layer** (reCAPTCHA, rate limiter, idempotency)
5. **Feature components** (MatchCard, PredictionSlip, etc.)
6. **Pages** (with proper loading.tsx, error.tsx)
7. **Advanced features** (PWA, virtualization)

**GENERATE NOW with ZERO redundancy and ALL security features!** 🚀
