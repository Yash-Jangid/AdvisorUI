import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonListProps {
  rows?: number;
  hasAvatar?: boolean;
  hasBadge?: boolean;
}

export function SkeletonList({ rows = 5, hasAvatar = false, hasBadge = false }: SkeletonListProps) {
  return (
    <div className="space-y-3 w-full" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          {hasAvatar && <Skeleton variant="circle" className="h-10 w-10 shrink-0" />}

          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {hasBadge && <Skeleton className="h-6 w-16 rounded-full shrink-0" />}
        </div>
      ))}
    </div>
  );
}
