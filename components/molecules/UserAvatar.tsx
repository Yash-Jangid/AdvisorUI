import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Text } from '@/components/atoms/Text';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusIndicator = 'online' | 'away' | 'offline' | 'none';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: StatusIndicator;
  showName?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
};

const sizeMap = {
  sm: { container: 'h-7 w-7', text: 'text-xs', dot: 'h-2 w-2' },
  md: { container: 'h-9 w-9', text: 'text-sm', dot: 'h-2.5 w-2.5' },
  lg: { container: 'h-12 w-12', text: 'text-base', dot: 'h-3 w-3' },
  xl: { container: 'h-16 w-16', text: 'text-lg', dot: 'h-3.5 w-3.5' },
};

const statusColor: Record<StatusIndicator, string> = {
  online:  'bg-success',
  away:    'bg-warning',
  offline: 'bg-muted',
  none:    'hidden',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function UserAvatar({
  name,
  imageUrl,
  size = 'md',
  status = 'none',
  showName = false,
  className,
}: UserAvatarProps) {
  const { container, text, dot } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Avatar circle */}
      <div className="relative shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className={cn(container, 'rounded-full object-cover border border-border')}
          />
        ) : (
          <div
            className={cn(
              container,
              'rounded-full bg-primary/20 border border-primary/30',
              'flex items-center justify-center'
            )}
            aria-label={name}
          >
            <span className={cn(text, 'font-semibold text-primary leading-none')}>
              {getInitials(name)}
            </span>
          </div>
        )}

        {/* Status indicator dot */}
        {status !== 'none' && (
          <span
            className={cn(
              dot,
              'absolute bottom-0 right-0 rounded-full ring-2 ring-background',
              statusColor[status]
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>

      {showName && (
        <Text variant="small" weight="medium" truncate>
          {name}
        </Text>
      )}
    </div>
  );
}
