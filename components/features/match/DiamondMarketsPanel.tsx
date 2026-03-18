'use client';

import React, { useState } from 'react';
import { useMatchDiamondMarkets, useLiveDiamondMarkets } from '@/lib/api/hooks/useMatches';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OddsEntry {
  otype: string;
  odds: number;
  size?: number;
}

interface Runner {
  sid: number;
  nat: string;
  gstatus: string;
  odds?: OddsEntry[];
}

interface DiamondMarket {
  mid: number;
  mname: string;
  gtype: string;
  status: string;
  section?: Runner[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchOddsTable({ market, onSelectOutcome }: { market: DiamondMarket, onSelectOutcome?: (marketId: string, o: any, m: any) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 border-b border-zinc-800/50">
            <th className="text-left py-2 font-medium w-1/2">Runner</th>
            <th className="py-2 text-center font-medium">Back</th>
            <th className="py-2 text-center font-medium">Lay</th>
          </tr>
        </thead>
        <tbody>
          {(market.section ?? []).map((runner, ridx) => {
            const backOdds = runner.odds?.filter((o) => o.otype === 'back').sort((a, b) => b.odds - a.odds)[0];
            const layOdds = runner.odds?.filter((o) => o.otype === 'lay').sort((a, b) => a.odds - b.odds)[0];
            const isActive = runner.gstatus !== 'SUSPENDED' && runner.gstatus !== 'CLOSED';

            return (
              <tr key={`runner-${runner.sid ?? ridx}-${ridx}`} className="border-b border-zinc-800/30 last:border-0 group">
                <td className="py-2.5 pr-2">
                  <span className={`text-sm font-medium ${isActive ? 'text-text-primary' : 'text-zinc-500'}`}>
                    {runner.nat}
                  </span>
                  {!isActive && runner.gstatus && <span className="ml-2 text-[10px] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full uppercase">{runner.gstatus}</span>}
                </td>
                <td className="py-2.5 text-center">
                  {backOdds ? (
                    <button 
                      onClick={() => isActive && onSelectOutcome?.(
                        String(market.mid ?? market.mname),
                        { outcomeKey: String(runner.sid), label: runner.nat, decimalOdds: backOdds.odds, betType: 'back', marketGtype: market.gtype ?? 'match_odds', lineValue: runner.nat },
                        market
                      )}
                      disabled={!isActive}
                      className="inline-flex flex-col items-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded font-mono font-bold text-sm transition-all cursor-pointer">
                        {backOdds.odds}
                      </span>
                      {backOdds.size != null && <span className="text-[10px] text-zinc-500 mt-0.5">{backOdds.size}</span>}
                    </button>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="py-2.5 text-center">
                  {layOdds ? (
                    <button 
                      onClick={() => isActive && onSelectOutcome?.(
                        String(market.mid ?? market.mname),
                        { outcomeKey: String(runner.sid), label: runner.nat + ' (Lay)', decimalOdds: layOdds.odds, betType: 'lay', marketGtype: market.gtype ?? 'match_odds', lineValue: runner.nat },
                        market
                      )}
                      disabled={!isActive}
                      className="inline-flex flex-col items-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-3 py-1 rounded font-mono font-bold text-sm transition-all cursor-pointer">
                        {layOdds.odds}
                      </span>
                      {layOdds.size != null && <span className="text-[10px] text-zinc-500 mt-0.5">{layOdds.size}</span>}
                    </button>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FancyGrid({ market, onSelectOutcome }: { market: DiamondMarket, onSelectOutcome?: (marketId: string, o: any, m: any) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(market.section ?? []).map((runner, ridx) => {
        // Fallback: lay is 'NO', back is 'YES'
        const yes = runner.odds?.find((o) => o.otype === 'yes' || o.otype === 'back');
        const no = runner.odds?.find((o) => o.otype === 'no' || o.otype === 'lay');
        const isActive = runner.gstatus !== 'SUSPENDED' && runner.gstatus !== 'CLOSED';

        return (
          <div
            key={`fancy-${runner.sid ?? ridx}-${ridx}`}
            className={`flex-1 min-w-[140px] max-w-[200px] border rounded-lg p-2.5 transition-colors ${
              isActive
                ? 'bg-background-secondary border-border'
                : 'bg-background-tertiary border-border opacity-50'
            }`}
          >
            <p className="text-xs text-text-secondary mb-2 truncate leading-tight" title={runner.nat}>
              {runner.nat}
              {!isActive && runner.gstatus && <span className="ml-1 text-[9px] text-red-500 uppercase">({runner.gstatus})</span>}
            </p>
            <div className="flex gap-1.5">
              <button 
                onClick={() => isActive && no?.odds && onSelectOutcome?.(
                  String(market.mid ?? market.mname),
                  { outcomeKey: String(runner.sid ?? ridx), label: runner.nat + ' (NO)', decimalOdds: no.odds, betType: 'no', marketGtype: market.gtype ?? 'fancy', lineValue: runner.nat },
                  market
                )}
                disabled={!isActive || !no?.odds}
                className="flex-1 text-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="bg-pink-500/20 border border-pink-500/30 rounded py-1 px-1 cursor-pointer">
                  <p className="text-pink-400 font-bold font-mono text-sm">{no?.odds ?? '—'}</p>
                  {no?.size != null && <p className="text-[10px] text-zinc-500">{no.size}</p>}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-medium">NO</p>
              </button>
              <button 
                onClick={() => isActive && yes?.odds && onSelectOutcome?.(
                  String(market.mid ?? market.mname),
                  { outcomeKey: String(runner.sid ?? ridx), label: runner.nat + ' (YES)', decimalOdds: yes.odds, betType: 'yes', marketGtype: market.gtype ?? 'fancy', lineValue: runner.nat },
                  market
                )}
                disabled={!isActive || !yes?.odds}
                className="flex-1 text-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded py-1 px-1 cursor-pointer">
                  <p className="text-blue-400 font-bold font-mono text-sm">{yes?.odds ?? '—'}</p>
                  {yes?.size != null && <p className="text-[10px] text-zinc-500">{yes.size}</p>}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-medium">YES</p>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MarketCard({ market, onSelectOutcome }: { market: DiamondMarket, onSelectOutcome?: (marketId: string, o: any, m: any) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Diamond uses various names/types for markets that behave like fancy grids (yes/no)
  const isFancy = 
    (market.mname ?? '').toLowerCase().includes('fancy') || 
    market.gtype === 'fancy' || 
    market.gtype === 'fancy1' || 
    market.gtype === 'oddeven' || 
    market.gtype === 'meter';

  // Even if a market is OPEN, individual runners might be SUSPENDED. We check overall market first.
  const isOpen_market = market.status === 'OPEN' || market.status === 'ACTIVE';

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-border">
      {/* Market header */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-background-secondary hover:bg-background-tertiary transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary text-sm uppercase tracking-wide">
            {market.mname}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isOpen_market
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-zinc-500/20 text-zinc-400 border border-zinc-600/30'
            }`}
          >
            {market.status}
          </span>
        </div>
        <span className="text-zinc-500 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Market body */}
      {isOpen && (
        <div className="px-4 py-3">
          {isFancy ? (
            <FancyGrid market={market} onSelectOutcome={onSelectOutcome} />
          ) : (
            <MatchOddsTable market={market} onSelectOutcome={onSelectOutcome} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface DiamondMarketsPanelProps {
  matchId: string;
  isLive?: boolean;
  onSelectOutcome?: (marketId: string, o: any, m: any) => void;
}

export function DiamondMarketsPanel({ matchId, isLive = false, onSelectOutcome }: DiamondMarketsPanelProps) {
  // Fetch initial data via REST
  const { data: markets, isLoading } = useMatchDiamondMarkets(matchId);

  // Open SSE connection for live updates (writes back into the same React Query cache key)
  useLiveDiamondMarkets(isLive ? matchId : '');

  // Safeguard: Extract array from envelope if old cached data is still in React Query
  const marketsArray = Array.isArray(markets) ? markets : ((markets as any)?.markets || []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-xl h-24 animate-pulse bg-background-secondary" />
        ))}
      </div>
    );
  }

  if (marketsArray.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-text-secondary text-sm">
          {isLive ? 'Live markets are loading…' : 'No live markets available for this match yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {marketsArray.map((market: DiamondMarket, idx: number) => (
        <MarketCard key={`${market.mid ?? market.mname ?? idx}-${idx}`} market={market} onSelectOutcome={onSelectOutcome} />
      ))}
    </div>
  );
}
