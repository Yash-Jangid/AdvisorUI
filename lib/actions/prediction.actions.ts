'use server';

import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Prediction, PlacePredictionDto } from '@/lib/api/types';

// ─── Place prediction (BFF) ───────────────────────────────────────────────────
// Server Action used by non-JS form fallback. Normally, usePlacePrediction
// (React Query mutation) handles this client-side for optimistic updates.

export async function placePredictionAction(
  dto: PlacePredictionDto
): Promise<{ data?: Prediction; error?: string }> {
  try {
    const prediction = await api.post<Prediction>(ENDPOINTS.predictions.place(), dto);
    return { data: prediction };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to place prediction';
    return { error: message };
  }
}
