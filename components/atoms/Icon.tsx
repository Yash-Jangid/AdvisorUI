import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pass the Lucide icon component directly: icon={Trophy} */
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  'aria-label'?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Thin wrapper that ensures consistent sizing, stroke width, and aria labeling.

export function Icon({
  icon: LucideComponent,
  size = 20,
  strokeWidth = 1.75,
  className,
  'aria-label': ariaLabel,
  ...props
}: IconProps) {
  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      {...props}
    >
      <LucideComponent
        size={size}
        strokeWidth={strokeWidth}
        aria-hidden="true"
      />
    </span>
  );
}
