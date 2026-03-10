import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { AuditLog } from '../types';

export interface AuditLogFilters {
  actorId?: string;
  actorEmail?: string;
  actorUsername?: string;
  actorRole?: string;
  resource?: string;
  action?: string;
  severity?: string;
  tags?: string;
  statusCode?: number | string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      // Clean undefined/empty values before sending
      const cleanFilters: Record<string, string | number> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanFilters[key] = value as string | number;
        }
      });
      
      const response = await api.get<AuditLog[]>(ENDPOINTS.admin.auditLogs(cleanFilters));
      return response; // Backend returns the array directly
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
