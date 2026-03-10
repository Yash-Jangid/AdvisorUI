import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Change {
  value: number;
  label: string;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: Change;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  onClick?: () => void;
}

// ─── Variant Maps ─────────────────────────────────────────────────────────────

const iconBg: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error:   'bg-error/10 text-error',
  info:    'bg-info/10 text-info',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCard({
  icon,
  label,
  value,
  change,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  const isPositive = (change?.value ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card rounded-xl p-5 flex items-start justify-between gap-4 transition-shadow hover:shadow-lg',
        onClick && 'cursor-pointer hover:ring-2 hover:ring-primary/50',
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <Text variant="caption" color="secondary" className="uppercase tracking-wide font-medium">
          {label}
        </Text>

        <Text variant="h3" weight="bold" className="text-2xl tabular-nums">
          {value}
        </Text>

        {change && (
          <div className="flex items-center gap-1">
            <Icon
              icon={isPositive ? TrendingUp : TrendingDown}
              size={14}
              className={isPositive ? 'text-success' : 'text-error'}
            />
            <Text
              variant="caption"
              color={isPositive ? 'success' : 'error'}
              weight="medium"
            >
              {Math.abs(change.value)}% {change.label}
            </Text>
          </div>
        )}
      </div>

      <div className={cn('rounded-lg p-2.5 shrink-0', iconBg[variant])}>
        <Icon icon={icon} size={22} />
      </div>
    </div>
  );
}
