import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { ENDPOINTS } from '../endpoints';
import { ApiError } from '../types';
import { casinoKeys } from './useCasino';

export interface PlaceBetTicketDto {
  marketId: string;
  selectionId: string;
  stake: number;
}

export interface BetTicket {
  id: string;
  marketId: string;
  selectionId: string;
  oddsAtPlacement: string;
  stake: number;
  potentialPayout: number;
  status: string;
  createdAt: string;
}

export function usePlaceBetTicket(cid?: number) {
  const queryClient = useQueryClient();

  return useMutation<BetTicket, ApiError, PlaceBetTicketDto>({
    mutationFn: async (payload: PlaceBetTicketDto) => {
      return await api.post<BetTicket>(ENDPOINTS.betting.placeTicket(), payload);
    },
    onSuccess: () => {
      if (typeof cid === 'number') {
        void queryClient.invalidateQueries({ queryKey: casinoKeys.activeMarket(cid) });
      }
    },
  });
}

