import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

interface SkeletonCardProps {
  hasImage?: boolean;
  hasFooter?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  hasImage = false,
  hasFooter = false,
  lines = 3,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 space-y-3',
        className
      )}
      aria-hidden="true"
    >
      {hasImage && <Skeleton className="w-full h-48 rounded-md" />}

      {/* Title */}
      <Skeleton className="h-5 w-3/4" />

      {/* Body lines — each slightly narrower */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width: `${100 - i * 8}%` }} />
        ))}
      </div>

      {hasFooter && (
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      )}
    </div>
  );
}
