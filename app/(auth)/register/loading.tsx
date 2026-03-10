import { AuthLayout } from '@/components/templates/AuthLayout';
import { SkeletonForm } from '@/components/skeletons/SkeletonForm';

export default function RegisterLoading() {
  return (
    <AuthLayout>
      <SkeletonForm fields={4} />
    </AuthLayout>
  );
}
