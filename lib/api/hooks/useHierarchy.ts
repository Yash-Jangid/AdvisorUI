/**
 * useHierarchy — hooks for managing a user's downline team.
 * GET /hierarchy/tree        → paginated subtree (scoped to self)
 * POST /hierarchy/downline   → create a new downline user
 * POST /ledger/transfer      → top-up a downline user's points
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/stores/authStore';

// ── Types ──────────────────────────────────────────────────────────

export interface DownlineUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  isBettingDisabled: boolean;
  isUserCreationDisabled: boolean;
  depth: number;
  createdAt: string;
  role: { id: string; name: string; level: number; displayName: string };
}

export interface CreateDownlinePayload {
  username: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateAccessPayload {
  userId: string;
  isActive?: boolean;
  isBettingDisabled?: boolean;
  isUserCreationDisabled?: boolean;
}

export interface TransferPayload {
  toUserId: string;
  amount: number;
  description?: string;
}

export interface TransferResult {
  fromBalance: number;
  toBalance: number;
}

// ── Hooks ──────────────────────────────────────────────────────────

/** Fetch the calling user's direct children (1-level-down) in the hierarchy. */
export function useMyTeam(page = 1, limit = 50, directOnly = true) {
  return useQuery({
    queryKey: ['hierarchy', 'tree', page, limit, directOnly],
    queryFn: () =>
      api.get<{ data: DownlineUser[]; meta: unknown }>(
        `/hierarchy/tree?page=${page}&limit=${limit}&directOnly=${directOnly}`
      ),
    staleTime: 30_000,
  });
}

/** Create a new user directly under the current user. */
export function useCreateDownline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDownlinePayload) => api.post('/hierarchy/downline', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] }),
  });
}

/** Transfer points from the current user to a downline user. */
export function useTransferPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransferPayload) => api.post<TransferResult>('/ledger/transfer', payload),
    onSuccess: (data) => {
      // Instantly update the global auth store for zero-delay UI feedback
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().setUser({ ...user, balance: data.fromBalance });
      }

      qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] });
      qc.invalidateQueries({ queryKey: ['ledger', 'balance'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/** Update access control flags. */
export function useUpdateAccessControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...payload }: UpdateAccessPayload) =>
      api.patch(`/hierarchy/${userId}/access`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] });
    },
  });
}

/** Promote User (Option B: Orphan and Promote) */
export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      api.post(ENDPOINTS.hierarchy.promote(userId), { roleId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] });
      // We also invalidate admin users table to make sure it picks up role shifts
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Demote User (Administrator-only: re-assigns a lower role and reparents under root). */
export function useDemoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      api.post(ENDPOINTS.hierarchy.demote(userId), { roleId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Set or update a downline user's custom commission rate. */
export function useSetCommissionRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rate }: { userId: string; rate: number }) =>
      api.patch<{ message: string; rate: number }>(`/hierarchy/${userId}/commission`, { rate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hierarchy', 'tree'] });
    },
  });
}

/** Generate a unique role-prefixed username. */
export function useGenerateUsername() {
  return useMutation({
    mutationFn: (roleId: string) =>
      api.get<{ username: string }>(`/users/generate-username?roleId=${roleId}`),
  });
}
