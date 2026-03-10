import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/lib/api/types';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) =>
          set({ user, isAuthenticated: true, isLoading: false }, false, 'auth/setUser'),

        clearAuth: () =>
          set({ user: null, isAuthenticated: false, isLoading: false }, false, 'auth/clearAuth'),

        setLoading: (isLoading) => set({ isLoading }, false, 'auth/setLoading'),
      }),
      {
        name: 'advisor-auth',
        // Only persist user identity (not sensitive tokens — those are httpOnly cookies)
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'AuthStore' }
  )
);
