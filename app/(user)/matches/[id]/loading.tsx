import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';

export default function MatchDetailLoading() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
        <SkeletonCard lines={8} hasFooter />
      </div>
    </DashboardLayout>
  );
}
