'use server';

import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';

// ─── Admin Server Actions ─────────────────────────────────────────────────────

export async function syncMatchesAction(): Promise<{ error?: string }> {
  try {
    await api.post(ENDPOINTS.matches.sync());
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Sync failed' };
  }
}

export async function settleMatchAction(matchId: string): Promise<{ error?: string }> {
  try {
    await api.post(ENDPOINTS.admin.settle(matchId));
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Settlement failed' };
  }
}

export async function cancelSettlementAction(matchId: string): Promise<{ error?: string }> {
  try {
    await api.post(ENDPOINTS.admin.settleCancellation(matchId));
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Cancellation failed' };
  }
}
