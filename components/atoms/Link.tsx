import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────
// We omit 'href' from AnchorHTMLAttributes to avoid the dual-extension conflict
// with NextLinkProps which has its own typed 'href'.

type LinkProps = NextLinkProps & {
  variant?: 'default' | 'underline' | 'muted' | 'none';
  external?: boolean;
  className?: string;
  children?: React.ReactNode;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Link({
  variant = 'default',
  external = false,
  className,
  children,
  ...props
}: LinkProps) {
  const variantClass = {
    default:   'text-primary hover:text-primary/80 transition-colors',
    underline: 'text-primary underline underline-offset-2 hover:no-underline transition-colors',
    muted:     'text-text-secondary hover:text-text-primary transition-colors',
    none:      '',
  }[variant];

  return (
    <NextLink
      className={cn(
        variantClass,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm',
        className
      )}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </NextLink>
  );
}
