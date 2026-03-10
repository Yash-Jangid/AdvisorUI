import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// ─── Variants ─────────────────────────────────────────────────────────────────

const textVariants = cva('', {
  variants: {
    variant: {
      h1:      'text-4xl font-bold leading-tight',
      h2:      'text-3xl font-semibold leading-tight',
      h3:      'text-2xl font-semibold leading-snug',
      h4:      'text-xl font-semibold',
      body:    'text-base leading-relaxed',
      small:   'text-sm leading-relaxed',
      caption: 'text-xs leading-normal',
      mono:    'text-sm font-mono',
    },
    // Renamed from 'color' to 'textColor' to avoid conflict with HTMLAttributes<HTMLElement>.color
    textColor: {
      primary:   'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary:  'text-text-tertiary',
      success:   'text-success',
      warning:   'text-warning',
      error:     'text-error',
      info:      'text-info',
      muted:     'text-muted-foreground',
      inherit:   'text-inherit',
    },
    align: {
      left:   'text-left',
      center: 'text-center',
      right:  'text-right',
    },
    weight: {
      normal:   'font-normal',
      medium:   'font-medium',
      semibold: 'font-semibold',
      bold:     'font-bold',
    },
    truncate: {
      true:  'truncate',
      false: '',
    },
  },
  defaultVariants: {
    variant:   'body',
    textColor: 'primary',
    align:     'left',
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div';

// Pick only what we need from VariantProps, avoiding name conflicts
type TextVariantProps = VariantProps<typeof textVariants>;

// Manually alias 'textColor' back to 'color' in the public API for ergonomics
interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: TextElement;
  variant?: TextVariantProps['variant'];
  color?: TextVariantProps['textColor'];
  align?: TextVariantProps['align'];
  weight?: TextVariantProps['weight'];
  truncate?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Text({
  as: Component = 'p',
  variant,
  color,
  align,
  weight,
  truncate,
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        textVariants({ variant, textColor: color, align, weight, truncate }), 
        className
      )}
      {...props}
    />
  );
}
