import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonFormProps {
  fields?: number;
}

export function SkeletonForm({ fields = 3 }: SkeletonFormProps) {
  return (
    <div className="space-y-5 w-full" aria-hidden="true">
      {/* Form title */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Form fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-24" />       {/* Label */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>
      ))}

      {/* Submit button */}
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}
