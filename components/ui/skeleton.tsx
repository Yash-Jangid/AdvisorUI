import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  width,
  height,
  style,
}: SkeletonProps) {
  const variantClass = {
    default: 'rounded',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
  }[variant];

  const animationClass = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  }[animation];

  return (
    <div
      aria-hidden="true"
      className={cn('bg-muted', variantClass, animationClass, className)}
      style={{ width, height, ...style }}
    />
  );
}
