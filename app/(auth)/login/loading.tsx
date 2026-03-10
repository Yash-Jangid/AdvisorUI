import { AuthLayout } from '@/components/templates/AuthLayout';
import { SkeletonForm } from '@/components/skeletons/SkeletonForm';

export default function LoginLoading() {
  return (
    <AuthLayout>
      <SkeletonForm fields={2} />
    </AuthLayout>
  );
}
