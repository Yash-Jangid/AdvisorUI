import { AuthLayout } from '@/components/templates/AuthLayout';
import { AuthForm } from '@/components/organisms/Form/AuthForm';
import { registerAction } from '@/lib/actions/auth.actions';
import type { RegisterSchema } from '@/lib/utils/validators';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="text-sm text-text-secondary">Join Advisor Cricket and start predicting.</p>
      </div>
      <AuthForm
        mode="register"
        onSubmit={async (data) => {
          'use server';
          return registerAction(data as RegisterSchema);
        }}
      />
    </AuthLayout>
  );
}
