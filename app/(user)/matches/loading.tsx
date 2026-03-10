import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function MatchesLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-64 ml-auto" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} hasFooter />)}
        </div>
      </div>
    </DashboardLayout>
  );
}
