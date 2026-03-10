import { SkeletonCard } from '@/components/skeletons/SkeletonCard';

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SkeletonCard lines={2} />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard lines={1} />
        <SkeletonCard lines={1} />
      </div>
      <SkeletonCard lines={4} />
    </div>
  );
}
