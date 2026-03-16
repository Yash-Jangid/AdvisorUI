'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ROUTES } from '@/lib/constants/routes';
import type { LoginResponse, LoginDto, RegisterDto, User } from '@/lib/api/types';

// ─── Cookie config ────────────────────────────────────────────────────────────

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days


async function isSecureRequest(): Promise<boolean> {
  try {
    const headersList = await headers();
    const proto = headersList.get('x-forwarded-proto');
    if (proto) return proto === 'https';
  } catch {
    // headers() unavailable outside request context — fall back to NODE_ENV
  }
  return process.env.NODE_ENV === 'production';
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function loginAction(dto: LoginDto): Promise<{ error?: string }> {
  let redirectPath: string | undefined;

  try {
    const { tokens, user } = await api.post<LoginResponse>(ENDPOINTS.auth.login(), dto);
    const secure = await isSecureRequest();

    const cookieOptions = {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_MAX_AGE,
    };

    const jar = await cookies();
    jar.set('access_token', tokens.accessToken, cookieOptions);
    jar.set('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days for refresh
    });
    // Non-httpOnly so the Edge middleware can read it for role-based guards
    jar.set('user_role', user.role.name.toUpperCase(), {
      ...cookieOptions,
      httpOnly: false,
    });

    redirectPath = ROUTES.user.dashboard;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    console.error('[LoginAction Error]:', message, err);
    return { error: message };
  }

  // Redirect OUTSIDE the try/catch — Next.js redirect() throws internally
  // which would be swallowed if called inside the catch block.
  redirect(redirectPath);
}

export async function registerAction(dto: RegisterDto): Promise<{ error?: string; success?: boolean; user?: User }> {
  try {
    const { tokens, user } = await api.post<LoginResponse>(ENDPOINTS.auth.register(), dto);

    const jar = await cookies();
    jar.set('access_token', tokens.accessToken, cookieOptions);
    jar.set('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    jar.set('user_role', user.role.name.toUpperCase(), {
      ...cookieOptions,
      httpOnly: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    console.error('[RegisterAction Error]:', message, err);
    return { error: message };
  }

  redirect(ROUTES.user.dashboard);
}

export async function logoutAction(): Promise<void> {
  try {
    await api.post(ENDPOINTS.auth.logout());
  } catch {
    // Proceed even if backend logout fails
  }

  const jar = await cookies();
  jar.delete('access_token');
  jar.delete('refresh_token');
  jar.delete('user_role');

  redirect(ROUTES.auth.login);
}
