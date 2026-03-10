import { NextRequest, NextResponse } from 'next/server';
import { ROUTES, PROTECTED_ROUTES, ADMIN_ROUTES } from '@/lib/constants/routes';

// Role values persisted in the `user_role` cookie by the BFF auth action.
// Must match the string labels used in the backend's role-level system.
const ADMIN_ROLE_VALUES = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR'] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // ── Protect authenticated routes ─────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.auth.login, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Protect admin routes (role-level check) ───────────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute && isAuthenticated) {
    const userRole = request.cookies.get('user_role')?.value ?? '';
    const hasAdminAccess = ADMIN_ROLE_VALUES.some((r) => r === userRole.toUpperCase());
    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL(ROUTES.user.dashboard, request.url));
    }
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.user.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
};
