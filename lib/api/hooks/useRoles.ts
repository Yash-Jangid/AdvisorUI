/**
 * useRoles — fetches and mutates roles from the dynamic Roles Module.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Role } from '@/lib/api/types';

export interface CreateRoleDto {
  name: string;
  displayName: string;
  level: number;
  canHaveChild?: boolean;
  defaultCommissionPct?: number;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  isActive?: boolean;
}

export function useRoles() {
  const queryClient = useQueryClient();

  // Used for Admin Role CRUD
  // Backend returns Role[] directly (no { data: [...] } wrapper)
  const allRolesQuery = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => api.get<Role[]>(ENDPOINTS.admin.roles()),
  });

  // Used for assigning users (dropdowns)
  const activeRolesQuery = useQuery({
    queryKey: ['roles', 'active'],
    queryFn: () => api.get<Role[]>(ENDPOINTS.admin.rolesActive()),
    staleTime: 5 * 60_000,
  });

  const createRole = useMutation({
    mutationFn: async (dto: CreateRoleDto) =>
      api.post<Role>(ENDPOINTS.admin.roles(), dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      api.patch<Role>(ENDPOINTS.admin.roleById(id), dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  return {
    roles: allRolesQuery.data ?? [],
    isLoadingAll: allRolesQuery.isLoading,
    
    activeRoles: activeRolesQuery.data ?? [],
    isLoadingActive: activeRolesQuery.isLoading,

    createRole,
    updateRole,
  };
}
