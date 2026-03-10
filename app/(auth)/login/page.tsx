import { AuthLayout } from '@/components/templates/AuthLayout';
import { AuthForm } from '@/components/organisms/Form/AuthForm';
import { loginAction } from '@/lib/actions/auth.actions';
import type { LoginSchema } from '@/lib/utils/validators';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to your account to continue.</p>
      </div>
      <AuthForm
        mode="login"
        onSubmit={async (data) => {
          'use server';
          return loginAction(data as LoginSchema);
        }}
      />
    </AuthLayout>
  );
}
