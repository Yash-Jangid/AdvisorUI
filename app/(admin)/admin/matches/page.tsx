'use client';

import React, { useState } from 'react';
import {
  useAdminAllMatches,
  useAdminBetCounts,
  useAdminMatchBook,
  useSyncMatches,
  useSettleMatch,
} from '@/lib/api/hooks/useAdminMatches';
import { useMatchDiamondMarkets } from '@/lib/api/hooks/useMatches';
import type { Match } from '@/lib/api/types';

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; className: string } | undefined> = {
  LIVE: { label: 'LIVE', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  UPCOMING: { label: 'UPCOMING', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  COMPLETED: { label: 'COMPLETED', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  CANCELLED: { label: 'CANCELLED', className: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30' },
};

// ── Inline BetCounts panel ────────────────────────────────────────────────────
function BetCountsPanel({ matchId }: { matchId: string }) {
  const { data, isLoading } = useAdminBetCounts(matchId);

  if (isLoading) return <p className="text-xs text-zinc-500 mt-2">Loading counts…</p>;
  // Backend returns { matchId, totals: {OUTCOME: count}, grandTotal }
  if (!data?.totals) return <p className="text-xs text-zinc-500 mt-2">No bets placed yet.</p>;

  return (
    <div className="flex gap-3 mt-2 flex-wrap">
      {Object.entries(data.totals).map(([key, count], ki) => (
        <span key={key || `bet-count-${ki}`} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
          <span className="text-zinc-400">{key}: </span>
          <span className="text-white font-semibold">{count}</span>
        </span>
      ))}
      <span className="text-xs bg-zinc-700 border border-zinc-600 px-2 py-0.5 rounded-full">
        <span className="text-zinc-400">Total: </span>
        <span className="text-white font-semibold">{data.grandTotal}</span>
      </span>
    </div>
  );
}

// ── Match Book Drawer ─────────────────────────────────────────────────────────
function MatchBookDrawer({ matchId, matchTitle, onClose }: {
  matchId: string;
  matchTitle: string;
  onClose: () => void;
}) {
  const { data: entries = [], isLoading } = useAdminMatchBook(matchId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <div>
            <p className="text-sm font-semibold text-white">Match Book</p>
            <p className="text-xs text-zinc-400 truncate max-w-64">{matchTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-zinc-500 py-8 text-sm">No predictions found for this match.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Outcome</th>
                  <th className="text-right py-2 font-medium">Stake</th>
                  <th className="text-right py-2 font-medium">Payout</th>
                  <th className="text-center py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e._id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40">
                    <td className="py-2 text-zinc-300 font-mono">{e.userId?.slice(0, 8)}…</td>
                    <td className="py-2 text-white">
                      <span>{e.outcomeKey}</span>
                      {e.outcomeLabel && <span className="text-zinc-400 text-[10px] ml-1">({e.outcomeLabel})</span>}
                    </td>
                    <td className="py-2 text-right text-amber-400 font-medium">{(e.amount ?? 0).toLocaleString()}</td>
                    <td className="py-2 text-right text-green-400 font-medium">{(e.potentialPayout ?? 0).toLocaleString()}</td>
                    <td className="py-2 text-center">
                      <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manage Markets Drawer ─────────────────────────────────────────────────────
function ManageMarketsDrawer({ matchId, matchTitle, onClose }: {
  matchId: string;
  matchTitle: string;
  onClose: () => void;
}) {
  const { data: markets = [], isLoading } = useMatchDiamondMarkets(matchId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700 bg-zinc-800">
          <div>
            <p className="text-sm font-semibold text-white">Manage Markets</p>
            <p className="text-xs text-zinc-400 truncate max-w-64">{matchTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 bg-zinc-950">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : !markets || markets.length === 0 ? (
            <p className="text-center text-zinc-500 py-8 text-sm">No live markets found for this match.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {markets.map((market: any, index: number) => (
                <div key={`${market.mid ?? market.mname ?? index}-${index}`} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white uppercase text-sm">{market.mname}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">ID: {market.mid}</span>
                      {market.status === 'OPEN' || market.status === 'ACTIVE' ? (
                         <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">OPEN</span>
                      ) : (
                         <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{market.status}</span>
                      )}
                    </div>
                  </div>
                  {/* render runners/options depending on type */}
                  {(market.mname === 'MATCH_ODDS' || market.mname.toLowerCase().includes('bookmaker')) && market.section ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-zinc-500 text-left border-b border-zinc-800/50">
                          <th className="py-2 font-medium">Runner</th>
                          <th className="py-2 text-right">Back</th>
                          <th className="py-2 text-right">Lay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {market.section.map((runner: any, ri: number) => {
                          const backOdds = runner.odds?.filter((o: any) => o.otype === 'back').sort((a:any, b:any) => b.odds - a.odds)[0];
                          const layOdds = runner.odds?.filter((o: any) => o.otype === 'lay').sort((a:any, b:any) => a.odds - b.odds)[0];
                          return (
                            <tr key={`runner-${runner.sid ?? ri}-${ri}`} className="border-b border-zinc-800/30 last:border-0">
                              <td className="py-2 text-zinc-300 font-medium">{runner.nat}</td>
                              <td className="py-2 text-right">
                                {backOdds ? <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-mono">{backOdds.odds}</span> : '-'}
                              </td>
                              <td className="py-2 text-right">
                                {layOdds ? <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded font-mono">{layOdds.odds}</span> : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : market.mname === 'Fancy' ? (
                     <div className="flex gap-4 overflow-x-auto pb-2">
                       {market.section?.map((runner: any, ri: number) => {
                         const yesOdds = runner.odds?.find((o:any) => o.otype === 'yes');
                         const noOdds = runner.odds?.find((o:any) => o.otype === 'no');
                         return (
                           <div key={`fancy-${runner.sid ?? ri}-${ri}`} className="min-w-[120px] border border-zinc-800 rounded bg-zinc-950 p-2">
                             <p className="text-xs text-zinc-300 mb-2 truncate" title={runner.nat}>{runner.nat}</p>
                             <div className="flex justify-between items-center text-[10px]">
                               <div className="text-center">
                                 <p className="text-pink-400 font-bold bg-pink-500/10 px-2 py-1 rounded">{noOdds ? noOdds.odds : '-'}</p>
                                 <p className="text-zinc-500 mt-1">NO / {noOdds ? noOdds.size : '-'}</p>
                               </div>
                               <div className="text-center">
                                 <p className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">{yesOdds ? yesOdds.odds : '-'}</p>
                                 <p className="text-zinc-500 mt-1">YES / {yesOdds ? yesOdds.size : '-'}</p>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                  ) : (
                    <p className="text-xs text-zinc-500">Preview not available for this market type.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Settle Dialog ─────────────────────────────────────────────────────────────
const WINNER_OPTIONS = [
  { value: 'TEAM_A_WIN', label: 'Team A Wins' },
  { value: 'TEAM_B_WIN', label: 'Team B Wins' },
  { value: 'DRAW', label: 'Draw / No Result' },
];

function SettleDialog({ match, onClose }: { match: Match; onClose: () => void }) {
  const { mutate: settle, isPending } = useSettleMatch();
  const [winner, setWinner] = useState('TEAM_A_WIN');
  const [settled, setSettled] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleSettle = () => {
    settle(
      { matchId: match.id, manualWinner: winner },
      {
        onSuccess: (res) => {
          setJobId(res.jobId);
          setSettled(true);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6">
        {settled ? (
          <div className="text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-white">Settlement Job Enqueued</p>
            <p className="text-xs text-zinc-400 mt-1 font-mono">Job ID: {jobId}</p>
            <p className="text-xs text-zinc-500 mt-2">BullMQ is processing payouts in the background.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="font-semibold text-white mb-1">Settle Match</p>
            <p className="text-xs text-zinc-400 mb-4 truncate">{match.title}</p>
            <label className="block text-xs text-zinc-400 mb-1">Select Winner</label>
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 mb-4 outline-none focus:border-green-500"
            >
              {WINNER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSettle}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
              >
                {isPending ? '⏳ Settling…' : '⚡ Confirm Settle'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Match Row ─────────────────────────────────────────────────────────────────
function MatchRow({ match, onViewBook, onManageMarkets, onSettle }: {
  match: Match;
  onViewBook: () => void;
  onManageMarkets: () => void;
  onSettle: () => void;
}) {
  const [showCounts, setShowCounts] = useState(false);
  const statusKey = match.status ?? 'UPCOMING';
  const status = STATUS_MAP[statusKey] ?? STATUS_MAP['UPCOMING'];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Match info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${status!.className}`}>
              {status!.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-white truncate">{match.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {match.startTime ? new Date(match.startTime).toLocaleString() : 'TBD'}
          </p>
          {/* Bet counts toggle */}
          <button
            onClick={() => setShowCounts((p) => !p)}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
          >
            {showCounts ? 'Hide Bet Counts ▲' : 'Show Bet Counts ▼'}
          </button>
          {showCounts && <BetCountsPanel matchId={match.id} />}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={onManageMarkets}
            className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-semibold"
          >
            📊 Manage Markets
          </button>
          <button
            onClick={onViewBook}
            className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            📋 Match Book
          </button>
          {match.status !== 'COMPLETED' && match.status !== 'CANCELLED' && (
            <button
              onClick={onSettle}
              className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
            >
              ⚡ Settle Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminMatchesPage() {
  const { data: matches, isLoading, isError, refetch } = useAdminAllMatches();
  const { mutate: sync, isPending: syncing } = useSyncMatches();
  const [bookMatch, setBookMatch] = useState<Match | null>(null);
  const [manageMatch, setManageMatch] = useState<Match | null>(null);
  const [settleMatch, setSettleMatch] = useState<Match | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const filtered = (matches ?? []).filter(
    (m) => filter === 'ALL' || m.status === filter,
  );

  const handleSync = () => sync(undefined, { onSuccess: () => refetch() });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Match Control Centre</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Sync fixtures · View match books · Settle matches
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {syncing ? <><span className="animate-spin">⟳</span> Syncing…</> : <>🔄 Sync Fixtures</>}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${filter === tab ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Match List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-red-400 text-sm">
          Failed to load matches. Check backend connection.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center border border-dashed border-zinc-700 rounded-xl p-12">
          <p className="text-zinc-500 text-sm">
            {filter === 'ALL' ? 'No matches found. Try syncing fixtures.' : `No ${filter.toLowerCase()} matches.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              onViewBook={() => setBookMatch(match)}
              onManageMarkets={() => setManageMatch(match)}
              onSettle={() => setSettleMatch(match)}
            />
          ))}
        </div>
      )}

      {/* Match Book Drawer */}
      {bookMatch && (
        <MatchBookDrawer
          matchId={bookMatch.id}
          matchTitle={bookMatch.title}
          onClose={() => setBookMatch(null)}
        />
      )}

      {/* Manage Markets Drawer */}
      {manageMatch && (
        <ManageMarketsDrawer
          matchId={manageMatch.id}
          matchTitle={manageMatch.title}
          onClose={() => setManageMatch(null)}
        />
      )}

      {/* Settle Dialog */}
      {settleMatch && (
        <SettleDialog
          match={settleMatch}
          onClose={() => setSettleMatch(null)}
        />
      )}
    </div>
  );
}
