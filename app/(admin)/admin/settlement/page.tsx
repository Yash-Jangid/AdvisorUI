'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Market, BetTicket } from '@/lib/api/types';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { Search, AlertCircle, CheckCircle2, ChevronDown, TrendingUp } from 'lucide-react';

export default function SettlementConsolePage() {
  const queryClient = useQueryClient();
  const [matchIdInput, setMatchIdInput] = useState('');
  const [activeMatchId, setActiveMatchId] = useState('');
  const [predictionId, setPredictionId] = useState('');
  const [settlementKey, setSettlementKey] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'market' | 'prediction'>('market');

  // Settle Market State
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedOutcomeKey, setSelectedOutcomeKey] = useState('');

  // Settle Prediction State
  const [selectedPredictionOutcome, setSelectedPredictionOutcome] = useState<'WIN' | 'LOSE' | 'VOID' | ''>('');

  // Fetch Markets for Match
  const { data: markets, isLoading: isMarketsLoading } = useQuery<Market[]>({
    queryKey: ['admin-match-markets', activeMatchId],
    queryFn: async () => {
      if (!activeMatchId) return [];
      const res = await api.get<Market[]>(`/markets/match/${activeMatchId}`);
      // The client might return the data directly or wrapped in ApiResponse
      return (res as any).data ?? res;
    },
    enabled: !!activeMatchId,
  });

  const selectedMarket = markets?.find((m) => (m._id || m.id) === selectedMarketId);

  // Fetch Prediction Details
  const { data: predictionInfo, isLoading: isPredictionLoading, refetch: fetchPrediction } = useQuery<BetTicket | null>({
    queryKey: ['admin-prediction', predictionId],
    queryFn: async () => {
      if (!predictionId) return null;
      const res = await api.get<BetTicket>(`/predictions/${predictionId}`);
      return (res as any).data ?? res;
    },
    enabled: false,
    retry: false,
  });

  // Mutations
  const settleMarketMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/admin/settle-market-v1/${activeMatchId}`, {
        marketId: selectedMarketId,
        winningOutcomeKey: selectedOutcomeKey,
        settlementKey,
      });
    },
    onSuccess: () => {
      toast.success('Market settlement job enqueued successfully');
      setSettlementKey('');
      setSelectedOutcomeKey('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to settle market');
    },
  });

  const settlePredictionMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/admin/predictions/settle`, {
        predictionId,
        outcome: selectedPredictionOutcome,
        settlementKey,
      });
    },
    onSuccess: () => {
      toast.success('Prediction manually settled successfully');
      setSettlementKey('');
      setSelectedPredictionOutcome('');
      void queryClient.invalidateQueries({ queryKey: ['admin-prediction', predictionId] });
      void fetchPrediction();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to settle prediction');
    },
  });

  const handleFetchMarkets = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchIdInput.trim()) {
      setActiveMatchId(matchIdInput.trim());
      setSelectedMarketId('');
      setSelectedOutcomeKey('');
    }
  };

  const handleFetchPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictionId.trim()) {
      void fetchPrediction();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
      <header>
        <Text variant="h2" weight="bold">Advanced Settlement Console</Text>
        <Text variant="body" color="secondary" className="mt-2">
          Force manual settlement for entire markets or individual predictions. All actions require the master settlement key and are audited.
        </Text>
      </header>

      <div className="space-y-6">
        {/* Tab Controls */}
        <div className="flex p-1 gap-1 bg-background-secondary rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              activeTab === 'market'
                ? 'bg-background-tertiary text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary/50'
            )}
          >
            Settle Entire Market
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
              activeTab === 'prediction'
                ? 'bg-background-tertiary text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary/50'
            )}
          >
            Settle Single Prediction
          </button>
        </div>

        {/* ======================= MARKET SETTLEMENT TAB ======================= */}
        {activeTab === 'market' && (
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6 border-border/50">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Icon icon={TrendingUp} size={20} className="text-primary" />
              <div>
                <Text weight="semibold">Dynamic Market Settlement</Text>
                <Text variant="caption" color="secondary">Enter a Match ID to load its markets and dynamic outcomes.</Text>
              </div>
            </div>

            <form onSubmit={handleFetchMarkets} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Match ID</label>
                <input
                  placeholder="e.g. 64b9..."
                  value={matchIdInput}
                  onChange={(e) => setMatchIdInput(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isMarketsLoading}
                className="h-11 w-full sm:w-auto px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isMarketsLoading ? 'Loading...' : 'Load Markets'}
              </button>
            </form>

            {markets && markets.length > 0 && (
              <div className="space-y-6 pt-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Target Market</label>
                  <div className="relative group">
                    <select
                      value={selectedMarketId}
                      onChange={(e) => {
                        setSelectedMarketId(e.target.value);
                        setSelectedOutcomeKey('');
                      }}
                      className="w-full h-11 pl-4 pr-10 appearance-none rounded-xl bg-background-secondary border border-border group-hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    >
                      <option value="">Select a market to settle...</option>
                      {markets.map((m) => (
                        <option key={m._id || m.id} value={m._id || m.id}>
                          {m.marketType} — {m.displayName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-text-tertiary pointer-events-none group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {selectedMarket && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Winning Outcome</label>
                    <div className="relative group">
                      <select
                        value={selectedOutcomeKey}
                        onChange={(e) => setSelectedOutcomeKey(e.target.value)}
                        className="w-full h-11 pl-4 pr-10 appearance-none rounded-xl bg-background-secondary border-success/30 group-hover:border-success/50 focus:border-success focus:ring-2 focus:ring-success/20 transition-all text-sm font-semibold text-success"
                      >
                        <option value="">Select the exact winning outcome...</option>
                        {selectedMarket.outcomes?.map((o) => (
                          <option key={o.outcomeKey} value={o.outcomeKey}>
                            {o.label} (Key: {o.outcomeKey})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-success/50 pointer-events-none group-hover:text-success transition-colors" />
                    </div>
                  </div>
                )}

                {selectedMarket && selectedOutcomeKey && (
                  <div className="space-y-6 pt-6 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-error ml-1 uppercase tracking-wider">Master Settlement Key</label>
                      <input
                        type="password"
                        placeholder="Enter authorization key..."
                        value={settlementKey}
                        onChange={(e) => setSettlementKey(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-background-secondary border-error/30 focus:border-error focus:ring-2 focus:ring-error/20 transition-all text-sm"
                      />
                    </div>

                    <button
                      onClick={() => settleMarketMutation.mutate()}
                      disabled={!settlementKey || settleMarketMutation.isPending}
                      className="w-full h-12 rounded-xl bg-error text-white font-bold text-sm tracking-wide shadow-lg shadow-error/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {settleMarketMutation.isPending ? 'ENQUEUING...' : 'FORCE SETTLE MARKET'}
                    </button>
                    <Text variant="caption" color="secondary" align="center" className="block italic">
                      This will settle ALL pending predictions for this market immediately.
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================= PREDICTION SETTLEMENT TAB ======================= */}
        {activeTab === 'prediction' && (
          <div className="glass-card rounded-2xl p-6 shadow-xl space-y-6 border-border/50">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Icon icon={CheckCircle2} size={20} className="text-secondary" />
              <div>
                <Text weight="semibold">Single Prediction Settlement</Text>
                <Text variant="caption" color="secondary">Force-settle a specific user&apos;s prediction to WIN, LOSE, or VOID (Refund).</Text>
              </div>
            </div>

            <form onSubmit={handleFetchPrediction} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Prediction ID</label>
                <input
                  placeholder="e.g. 64b9..."
                  value={predictionId}
                  onChange={(e) => setPredictionId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-background-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isPredictionLoading}
                className="h-11 w-full sm:w-auto px-8 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Icon icon={Search} size={16} />
                Find
              </button>
            </form>

            {predictionInfo && (
              <div className="space-y-8 pt-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-background-tertiary/50 p-6 rounded-2xl border border-border/50">
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">User ID</Text>
                    <Text variant="small" weight="medium" className="font-mono truncate block">{predictionInfo.userId}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">Choice</Text>
                    <Text variant="small" weight="bold" className="text-primary truncate block">
                      {predictionInfo.selection?.label || 'Unknown Outcome'}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">Status</Text>
                    <Text variant="small" weight="bold" className={cn(
                      predictionInfo.status === 'PENDING' ? 'text-warning' : 'text-info'
                    )}>
                      {predictionInfo.status}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">Stake</Text>
                    <Text variant="small" weight="bold">{predictionInfo.stake} pts</Text>
                  </div>
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">To Payout</Text>
                    <Text variant="small" weight="bold" className="text-success">{predictionInfo.potentialPayout} pts</Text>
                  </div>
                  <div className="space-y-1">
                    <Text variant="caption" color="tertiary" className="uppercase tracking-wider">Market</Text>
                    <Text variant="small" weight="medium" className="truncate block">
                      {predictionInfo.market?.displayName || predictionInfo.market?.marketType || 'Unknown Market'}
                    </Text>
                  </div>
                </div>

                {predictionInfo.status === 'PENDING' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary ml-1 uppercase tracking-wider">Force Settlement Outcome</label>
                      <div className="relative group">
                        <select
                          value={selectedPredictionOutcome}
                          onChange={(e) => setSelectedPredictionOutcome(e.target.value as any)}
                          className="w-full h-11 pl-4 pr-10 appearance-none rounded-xl bg-background-secondary border border-border group-hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                        >
                          <option value="">Select forced outcome...</option>
                          <option value="WIN" className="font-bold text-success">WIN (Credit full potential payout)</option>
                          <option value="LOSE" className="font-bold text-error">LOSE (Stake remains debited)</option>
                          <option value="VOID" className="font-bold text-warning">VOID (Refund stake to user)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-text-tertiary pointer-events-none group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {selectedPredictionOutcome && (
                      <div className="space-y-6 pt-6 border-t border-border/50">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-error ml-1 uppercase tracking-wider">Master Settlement Key</label>
                          <input
                            type="password"
                            placeholder="Enter authorization key..."
                            value={settlementKey}
                            onChange={(e) => setSettlementKey(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-background-secondary border-error/30 focus:border-error focus:ring-2 focus:ring-error/20 transition-all text-sm"
                          />
                        </div>

                        <button
                          onClick={() => settlePredictionMutation.mutate()}
                          disabled={!settlementKey || settlePredictionMutation.isPending}
                          className="w-full h-12 rounded-xl bg-error text-white font-bold text-sm tracking-wide shadow-lg shadow-error/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          {settlePredictionMutation.isPending ? 'PROCESSING...' : `CONFIRM FORCED ${selectedPredictionOutcome}`}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
                    <Icon icon={CheckCircle2} size={20} className="text-success shrink-0" />
                    <div>
                      <Text weight="bold" color="success">Already Settled</Text>
                      <Text variant="small" color="secondary" className="mt-0.5">
                        This prediction was settled at {new Date(predictionInfo.settledAt || '').toLocaleString()}. No further action can be taken.
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
