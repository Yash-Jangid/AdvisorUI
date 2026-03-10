'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ROUTES } from '@/lib/constants/routes';
import type { LoginResponse, LoginDto, RegisterDto, User } from '@/lib/api/types';

// ─── Cookie config ────────────────────────────────────────────────────────────

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function loginAction(dto: LoginDto): Promise<{ error?: string; success?: boolean; user?: User }> {
  try {
    const { tokens, user } = await api.post<LoginResponse>(ENDPOINTS.auth.login(), dto);

    const jar = await cookies();
    jar.set('access_token', tokens.accessToken, cookieOptions);
    jar.set('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days for refresh
    });
    // Non-httpOnly so middleware (Edge runtime) can read it for role-based guards
    jar.set('user_role', user.role.name.toUpperCase(), {
      ...cookieOptions,
      httpOnly: false,
    });
    return { success: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    console.error('[LoginAction Error]:', message, err);
    return { error: message };
  }
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
