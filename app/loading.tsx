import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
}
