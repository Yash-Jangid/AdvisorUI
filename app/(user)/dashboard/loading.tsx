import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} hasFooter />)}
        </div>
      </div>
    </DashboardLayout>
  );
}
