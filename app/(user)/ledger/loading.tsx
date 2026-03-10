import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { SkeletonList } from '@/components/skeletons/SkeletonList';

export default function LedgerLoading() {
  return (
    <div className="space-y-6">
      {/* Balance banner skeleton */}
      <SkeletonCard lines={2} />
      {/* Transaction list skeleton */}
      <SkeletonList />
    </div>
  );
}
