'use client';

import React, { useTransition } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { Link } from '@/components/atoms/Link';
import { recaptchaService } from '@/lib/security/recaptcha';
import { loginSchema, registerSchema, type LoginSchema, type RegisterSchema } from '@/lib/utils/validators';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import type { User } from '@/lib/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (data: LoginSchema | RegisterSchema) => Promise<{ error?: string; success?: boolean; user?: User }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = mode === 'login' ? loginSchema : registerSchema;

  const methods = useForm<LoginSchema | RegisterSchema>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const handleSubmit = methods.handleSubmit((data) => {
    setServerError(null);

    startTransition(async () => {
      // Get reCAPTCHA token (no-op if disabled)
      const recaptchaToken = await recaptchaService.getToken(
        mode === 'login' ? 'auth/login' : 'auth/register'
      );

      const result = await onSubmit({ ...data, recaptchaToken });

      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success && result.user) {
        // Hydrate client-side state
        const { setUser } = useAuthStore.getState();
        setUser(result.user);
        
        // Force a router refresh to pick up HTTPOnly cookies in middleware
        router.refresh();
        router.push(ROUTES.user.dashboard);
      } else {
        setServerError('An unknown error occurred');
      }
    });
  });

  const isLogin = mode === 'login';

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Server error */}
        {serverError && (
          <div role="alert" className="rounded-lg bg-error/10 border border-error/30 px-4 py-3">
            <Text variant="small" color="error">{serverError}</Text>
          </div>
        )}

        {/* Name field (register only) */}
        {!isLogin && (
          <FormField
            name="name"
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Yash Jangid"
            required
          />
        )}

        {/* Email / Username */}
        <FormField
          name={isLogin ? 'identifier' : 'email'}
          label={isLogin ? 'Username or Email' : 'Email Address'}
          type={isLogin ? 'text' : 'email'}
          autoComplete={isLogin ? 'username' : 'email'}
          placeholder={isLogin ? 'john_doe or you@example.com' : 'you@example.com'}
          required
        />

        {/* Password */}
        <div className="relative">
          <FormField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder={isLogin ? '••••••••' : 'Min 8 chars, 1 uppercase, 1 number'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-primary transition-colors"
          >
            <Icon icon={showPassword ? EyeOff : Eye} size={16} />
          </button>
        </div>

        {/* Confirm password (register only) */}
        {!isLogin && (
          <FormField
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-2.5 rounded-lg font-medium text-sm',
            'bg-primary text-primary-foreground',
            'hover:opacity-90 active:scale-[0.99] transition-all',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
        >
          <Icon icon={isLogin ? LogIn : UserPlus} size={16} />
          {isPending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
        </button>

        {/* Footer link */}
        <Text variant="small" color="secondary" align="center">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isLogin ? ROUTES.auth.register : ROUTES.auth.login} variant="underline">
            {isLogin ? 'Register' : 'Sign in'}
          </Link>
        </Text>
      </form>
    </FormProvider>
  );
}
