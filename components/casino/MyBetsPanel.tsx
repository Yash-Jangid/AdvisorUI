import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { api } from '@/lib/api/client';
import { BetTicket } from '@/lib/api/hooks/useBettingEngine';
import { useCasinoActiveMarket } from '@/lib/api/hooks/useCasino';
import { AlertTriangle } from 'lucide-react';

interface MyBetsPanelProps {
  cid: number;
}

export function MyBetsPanel({ cid }: MyBetsPanelProps) {
  const { data: activeMarket } = useCasinoActiveMarket(cid);
  const marketId = activeMarket?.marketId;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['bet-tickets', 'my', marketId],
    enabled: !!marketId,
    queryFn: async () => {
      if (!marketId) return [] as BetTicket[];
      return await api.get<BetTicket[]>(ENDPOINTS.betting.myTicketsForMarket(marketId));
    },
    refetchInterval: 5000,
  });

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-background-secondary p-5 shadow-sm">
      <Text variant="h4" className="mb-3 font-bold">
        My Bets
      </Text>

      {!marketId && (
        <Text variant="small" color="tertiary">
          No active market yet. Bets will appear here once a round starts.
        </Text>
      )}

      {marketId && isLoading && (
        <Text variant="small" color="tertiary">
          Loading your bets...
        </Text>
      )}

      {marketId && isError && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
          <Icon icon={AlertTriangle} size={16} />
          <Text variant="small">Unable to load your tickets for this round.</Text>
        </div>
      )}

      {marketId && data && data.length === 0 && !isLoading && !isError && (
        <Text variant="small" color="tertiary">
          You have no bets for this round yet.
        </Text>
      )}

      {marketId && data && data.length > 0 && (
        <div className="mt-2 flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
          {data.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background-tertiary px-3 py-2 text-xs"
            >
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-text-tertiary">
                  #{ticket.id.slice(0, 6)}...
                </span>
                <span className="mt-1 font-semibold">
                  Stake: {ticket.stake}{' '}
                  <span className="font-normal text-text-tertiary">
                    @ {Number(ticket.oddsAtPlacement).toFixed(2)}x
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] uppercase tracking-widest text-text-tertiary">
                  {ticket.status}
                </span>
                <span className="mt-1 font-mono text-[11px] text-emerald-500">
                  Max {ticket.potentialPayout}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

