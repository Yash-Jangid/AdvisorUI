import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/authStore';
import { useEffect } from 'react';
import type { User } from '@/lib/api/types';

/**
 * Custom hook to fetch the current user's profile and synchronize it with the Zustand store.
 * - This resolves the hydration issue where Zustand thinks the user is authenticated 
 *   but the user object is empty or missing details (like balance).
 * - Fires once on mount if authenticated, and keeps the user profile fresh.
 */
export const useAuth = () => {
  const { isAuthenticated, setUser, clearAuth } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // api.get unwraps the generic AxiosResponse data automatically in this codebase.
      // E.g. T = User
      const data = await api.get<User>(ENDPOINTS.auth.me());
      
      // Re-map to match Zustand's User shape, providing fallback for legacy "name"
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name ?? data.username, // Fallback if backend doesn't send name
        role: data.role,
        canHaveChild: data.canHaveChild ?? false,
        balance: data.balance ?? 0,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
    },
    // Only attempt fetch if the client thinks they're authenticated
    // Note: Next.js Middleware already blocks protected routes if the access_token is missing.
    enabled: isAuthenticated, 
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    retry: 1, // Only retry once as an immediate 401 should trigger logout
  });

  // Sync the fetched data with our Zustand store to hydrate the UI
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  // If the /me endpoint strictly 401s, we should clear the broken client state
  useEffect(() => {
    if (query.isError && (query.error as any)?.response?.status === 401) {
      clearAuth();
    }
  }, [query.isError, query.error, clearAuth]);

  return query;
};
