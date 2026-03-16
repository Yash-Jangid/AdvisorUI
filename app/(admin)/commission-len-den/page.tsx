'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Users, RotateCcw, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatPoints } from '@/lib/utils/formatters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

// Types matches backend DTO
type CommissionSummaryValues = {
  mComm: number;
  sComm: number;
  cComm: number;
  total: number;
};

type CommissionLenDenSummary = {
  milaHai: CommissionSummaryValues;
  denaHai: CommissionSummaryValues;
};

function CommBox({ title, data, type }: { title: string, data: CommissionSummaryValues, type: 'mila' | 'dena' }) {
    const isMila = type === 'mila';
    return (
        <div className={cn(
            "glass-card rounded-2xl p-6 shadow-sm border-t-4",
            isMila ? "border-t-emerald-500/80" : "border-t-red-500/80"
        )}>
            <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
                {isMila ? <ArrowDownLeft className="text-emerald-400" size={20} /> : <ArrowUpRight className="text-red-400" size={20} />}
                <Text variant="h3" weight="bold" className={isMila ? "text-emerald-400" : "text-red-400"}>{title}</Text>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                    <Text color="secondary" weight="semibold">M Comm (Match)</Text>
                    <Text className="font-mono" weight="bold">{formatPoints(data.mComm)}</Text>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                    <Text color="secondary" weight="semibold">S Comm (Session)</Text>
                    <Text className="font-mono" weight="bold">{formatPoints(data.sComm)}</Text>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                    <Text color="secondary" weight="semibold">C Comm (Casino)</Text>
                    <Text className="font-mono" weight="bold">{formatPoints(data.cComm)}</Text>
                </div>
                <div className="flex justify-between items-center pt-2 bg-background-tertiary/20 p-3 rounded-lg mt-2">
                    <Text weight="bold" className="uppercase text-xs tracking-wider">Total</Text>
                    <Text variant="h4" className="font-mono font-bold">{formatPoints(data.total)}</Text>
                </div>
            </div>
        </div>
    );
}

export default function CommissionLenDenPage() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const summaryQueryKey = ['commission-len-den-summary', selectedUserId];
  const historyQueryKey = ['commission-len-den-history', selectedUserId];

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: summaryQueryKey,
    queryFn: () => api.get<CommissionLenDenSummary>(`/commission-len-den/summary${selectedUserId ? `/${selectedUserId}` : ''}`),
    enabled: true
  });

  const { data: historyRes, isLoading: loadingHistory } = useQuery({
    queryKey: historyQueryKey,
    queryFn: () => api.get<any>(`/commission-len-den/history${selectedUserId ? `/${selectedUserId}` : ''}?page=1&limit=20`),
    enabled: true
  });

    // Fetch all downline users for selection
    const { data: usersData, isLoading: isUsersLoading } = useQuery<any>({
        queryKey: ['downline-users'],
        queryFn: () => api.get('/users/downline'),
    });
    const users = Array.isArray(usersData) ? usersData : (usersData?.data || []);

  const resetMutation = useMutation({
    mutationFn: () => api.post(`/commission-len-den/reset/${selectedUserId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: summaryQueryKey });
      queryClient.invalidateQueries({ queryKey: historyQueryKey });
      alert("Commission successfully reset/settled!");
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to reset commission');
    }
  });

  const handleReset = () => {
      if(!selectedUserId) return;
      if(confirm('Are you sure you want to RESET the commission for this user? This will mark all outstanding M/S/C splits as settled.')) {
          resetMutation.mutate();
      }
  };

  const history = historyRes?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Text variant="h2" weight="bold">Commission Len Den</Text>
            
            {/* User Selector */}
            <div className="flex items-center gap-3 bg-background-tertiary/50 p-2 border border-border/50 rounded-xl w-full sm:w-auto min-w-[300px]">
                <Users size={18} className="text-text-secondary ml-2" />
                <select 
                    className="w-full bg-transparent border-none text-sm font-semibold focus:outline-none focus:ring-0"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                >
                    <option value="" disabled>Select a downline agent...</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                    {users.length === 0 && (
                       // Fallback for manual user ID entry if needed for testing
                       <option value={selectedUserId || 'fallback-id'}>Manual ID: {selectedUserId}</option>
                    )}
                </select>
                <input
                    type="text"
                    placeholder="User ID (Manual)"
                    className="w-[100px] bg-background border border-border rounded px-2 py-1 text-xs"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                />
            </div>
        </div>

        {loadingSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-pulse bg-background-tertiary h-[250px] rounded-2xl" />
                <div className="animate-pulse bg-background-tertiary h-[250px] rounded-2xl" />
            </div>
        ) : summary ? (
            <div className="space-y-8">
                
                {/* Summary View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CommBox title="Mila Hai" data={summary.milaHai} type="mila" />
                    <CommBox title="Dena Hai" data={summary.denaHai} type="dena" />
                </div>

                {/* Reset Action */}
                <div className="glass-card rounded-xl p-5 border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-background-tertiary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <Text variant="body" weight="bold">Settlement Reset</Text>
                            <Text variant="caption" color="secondary">Marks all currently un-settled commissions as "Settled".</Text>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        disabled={resetMutation.isPending || (summary.milaHai.total === 0 && summary.denaHai.total === 0)}
                        className="bg-red-500 text-white hover:bg-red-600 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-red-500/20 disabled:opacity-50 min-w-[200px] justify-center"
                    >
                        <RotateCcw size={16} className={resetMutation.isPending ? "animate-spin" : ""} />
                        {resetMutation.isPending ? 'Resetting...' : 'Reset Commission'}
                    </button>
                </div>

                {/* History Block */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col shadow-sm border border-border/50">
                    <div className="px-5 py-4 border-b border-border bg-background-tertiary/30">
                        <Text variant="body" weight="bold">Recent Commission Log</Text>
                    </div>

                    <div className="overflow-x-auto min-h-[200px] max-h-[400px] scrollbar-thin">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="sticky top-0 bg-background-tertiary/95 backdrop-blur-sm text-xs uppercase text-text-secondary border-b border-border shadow-sm">
                                <tr>
                                    <th className="px-5 py-3.5 font-bold">Date</th>
                                    <th className="px-5 py-3.5 font-bold">Type</th>
                                    <th className="px-5 py-3.5 font-bold text-center">M Comm</th>
                                    <th className="px-5 py-3.5 font-bold text-center">S Comm</th>
                                    <th className="px-5 py-3.5 font-bold text-center">C Comm</th>
                                    <th className="px-5 py-3.5 font-bold text-center">Total</th>
                                    <th className="px-5 py-3.5 font-bold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {loadingHistory && <tr><td colSpan={7} className="text-center py-10 opacity-50">Loading history...</td></tr>}
                                {!loadingHistory && history.length === 0 && <tr><td colSpan={7} className="text-center py-10 opacity-50">No commission history.</td></tr>}
                                {!loadingHistory && history.map((row: any) => (
                                    <tr key={row.id} className="hover:bg-background-tertiary/50 transition-colors">
                                        <td className="px-5 py-3 text-xs font-mono">{format(new Date(row.createdAt), 'dd-MM-yy HH:mm')}</td>
                                        <td className="px-5 py-3 font-semibold">
                                            <span className={cn("px-2 py-0.5 rounded text-xs", row.type === 'MilaHai' ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400")}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-center text-text-secondary">{formatPoints(row.mComm)}</td>
                                        <td className="px-5 py-3 font-mono text-center text-text-secondary">{formatPoints(row.sComm)}</td>
                                        <td className="px-5 py-3 font-mono text-center text-text-secondary">{formatPoints(row.cComm)}</td>
                                        <td className="px-5 py-3 font-mono font-bold text-center">{formatPoints(row.totalComm)}</td>
                                        <td className="px-5 py-3 text-right">
                                            {row.resettledAt ? (
                                                <span className="text-xs text-text-tertiary italic">Settled</span>
                                            ) : (
                                                <span className="text-xs text-primary font-semibold flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        ) : null}

      </div>
    </DashboardLayout>
  );
}
