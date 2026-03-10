import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { SkeletonList } from '@/components/skeletons/SkeletonList';

export default function LeaderboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="h-9 w-40 bg-muted rounded animate-shimmer" />
        <SkeletonList rows={10} hasAvatar hasBadge />
      </div>
    </DashboardLayout>
  );
}
