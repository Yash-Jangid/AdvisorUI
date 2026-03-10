import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { SkeletonList } from '@/components/skeletons/SkeletonList';

export default function PredictionsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="h-9 w-48 bg-muted rounded animate-shimmer" />
        <SkeletonList rows={5} hasBadge />
      </div>
    </DashboardLayout>
  );
}
