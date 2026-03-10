'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Trophy, AlertTriangle } from 'lucide-react';
import NextLink from 'next/link';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { PlayingCard } from '@/components/casino/PlayingCard';
import { useCasinoLiveData, useCasinoLastResult } from '@/lib/api/hooks/useCasino';
import { ROUTES } from '@/lib/constants/routes';

export default function CasinoTableDetail() {
  const params = useParams();
  const typeId = Number(params.type);

  // Fetch live cards & status (polls every 3s)
  const { data: liveData, isLoading: isLoadingLive } = useCasinoLiveData(typeId);
  // Fetch last completed round winner (polls every 5s)
  const { data: lastResult } = useCasinoLastResult(typeId);

  const gameName = liveData?.name || `Live Table ${typeId}`;
  const status = liveData?.status || 'Waiting...';
  const isSuspended = status.toLowerCase() === 'suspended';
  
  // Extract card arrays (assuming keys like 'andar' and 'bahar' for Andar Bahar)
  const cardSides = Object.keys(liveData?.cards || {});

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* ── Left Column: Live TV Video IFrame ── */}
      <div className="flex w-full flex-col gap-4 lg:w-2/3">
        <div className="flex items-center gap-4">
          <NextLink
            href={ROUTES.user.casino}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background-tertiary transition-colors hover:bg-background-tertiary/80 hover:text-primary"
          >
            <Icon icon={ArrowLeft} size={20} />
          </NextLink>
          <div>
            <Text variant="h3" className="font-bold tracking-tight">
              {gameName}
            </Text>
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <Text variant="small" className="font-medium text-emerald-500">Live Video Feed</Text>
            </div>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-lg">
          {/* We embed the TV/Video using an iframe. 
              Usually, Casino APIs provide a specific URL format. 
              Using Diamond's typical Video URL format. */}
          <iframe
            src={`http://130.250.191.174:3009/tv?table=${typeId}`}
            className="h-full w-full border-0"
            allowFullScreen
            title={`Live Casino Video Stream - Table ${typeId}`}
            // Handle if the Diamond API doesn't serve the iframe from this path by showing a fallback or letting it 404 cleanly in the frame
          ></iframe>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl border border-border bg-background-secondary p-4 text-center">
          <Text variant="body" color="secondary">
            Note: Place your bets via your external Diamond account. This interface is for viewing live data only.
          </Text>
        </div>
      </div>

      {/* ── Right Column: Live Data & Game State ── */}
      <div className="flex w-full flex-col gap-4 lg:w-1/3">
        
        {/* Status Panel */}
        <div className="rounded-xl border border-border bg-background-secondary p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Text variant="h4" className="font-bold">Round Status</Text>
            <div className={`rounded-xl px-3 py-1 text-sm font-semibold uppercase tracking-wider ${
              isSuspended ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
            }`}>
              {status}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <Text variant="small" color="secondary">Round ID</Text>
            <Text variant="small" className="font-mono">{liveData?.round_id || liveData?.mid || 'Waiting...'}</Text>
          </div>
        </div>

        {/* Live Cards Table */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-background-secondary p-5 shadow-sm">
          <Text variant="h4" className="mb-6 font-bold flex items-center gap-2">
             Table State
             {isLoadingLive && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </Text>

          {cardSides.length > 0 ? (
            <div className="flex flex-col gap-6">
              {cardSides.map((sideName) => {
                const isWinner = liveData?.result?.toLowerCase() === sideName.toLowerCase();
                // Ensure cards array type safety
                const sideCards = (liveData!.cards![sideName] as unknown as string[]) || []; 
                
                return (
                  <div key={sideName} className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background-tertiary p-4">
                    <div className="flex items-center justify-between">
                      <Text variant="body" className="font-semibold capitalize tracking-widest text-text-secondary">
                        {sideName}
                      </Text>
                      {isWinner && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Icon icon={Trophy} size={16} />
                          <span className="text-xs font-bold uppercase">Winner</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {sideCards.length > 0 ? (
                        sideCards.map((c, i) => (
                          <PlayingCard key={i} cardStr={c} className={isWinner ? 'ring-2 ring-yellow-500 shadow-yellow-500/20' : ''} />
                        ))
                      ) : (
                        <Text variant="small" color="tertiary" className="italic">Waiting for cards...</Text>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Icon icon={AlertTriangle} size={32} className="text-text-tertiary" />
              <Text variant="small" color="secondary" className="text-center">
                Waiting for the next round to begin...
              </Text>
            </div>
          )}
        </div>

        {/* Last Winner Panel */}
        <div className="rounded-xl border border-border bg-background-secondary p-5 shadow-sm">
          <Text variant="small" color="secondary" className="mb-2 font-medium uppercase tracking-widest">
            Previous Round Winner
          </Text>
          {lastResult?.winner ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
                <Icon icon={Trophy} size={20} />
              </div>
              <div>
                <Text variant="h4" className="font-bold capitalize text-yellow-500">
                  {lastResult.winner}
                </Text>
                <Text variant="caption" color="tertiary" className="font-mono">
                  Round: {lastResult.mid}
                </Text>
              </div>
            </div>
          ) : (
            <Text variant="body" className="italic text-text-tertiary">
              N/A
            </Text>
          )}
        </div>

      </div>
    </div>
  );
}
