'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { FileText, Users, TrendingUp, Calendar, CreditCard, ChevronRight, Activity } from 'lucide-react';
import { formatPoints } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

function ReportTab({
    title, icon: IconCmp, active, onClick, description
}: {
    title: string; icon: any; active: boolean; onClick: () => void; description: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-start p-5 rounded-xl border transition-all text-left group w-full",
                active 
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                    : "bg-background-tertiary/50 border-border/50 hover:bg-background-tertiary hover:border-border"
            )}
        >
            <div className="flex items-center gap-3 w-full mb-3">
                <div className={cn("p-2.5 rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-background-tertiary text-text-secondary group-hover:text-text-primary")}>
                    <IconCmp size={20} />
                </div>
                <Text variant="body" weight="bold" className={active ? "text-primary dark:text-primary" : "text-text-primary"}>{title}</Text>
            </div>
            <Text variant="caption" color="secondary" className="line-clamp-2">{description}</Text>
        </button>
    );
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'account' | 'pnl' | 'pdc' | 'statement'>('account');
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    // Fetch all downline users
    const { data: usersData, isLoading: isUsersLoading } = useQuery<any>({
        queryKey: ['downline-users'],
        queryFn: () => api.get('/users/downline'),
    });
    const users = Array.isArray(usersData) ? usersData : (usersData?.data || []);

    const { data: reportData, isLoading } = useQuery<any>({
        queryKey: ['report', activeTab, selectedUserId],
        queryFn: () => {
            if (activeTab === 'account') return api.get(`/reports/account?agentId=${selectedUserId}`);
            if (activeTab === 'pnl') return api.get(`/reports/pnl?agentId=${selectedUserId}`);
            if (activeTab === 'pdc') return api.get(`/reports/pdc${selectedUserId ? `/${selectedUserId}` : ''}`);
            if (activeTab === 'statement') return api.get(`/reports/statement${selectedUserId ? `/${selectedUserId}` : ''}`);
            return Promise.resolve(null);
        },
        enabled: true
    });

    const renderAccountReport = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-background-tertiary/30 p-4 rounded-xl border border-border/50">
                <Text variant="body" weight="bold">Account Balances & Limits</Text>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-xs uppercase text-text-secondary border-b border-border/50">
                        <tr>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">Role</th>
                            <th className="px-4 py-3 font-semibold text-right">Prev Bal</th>
                            <th className="px-4 py-3 font-semibold text-right">CR</th>
                            <th className="px-4 py-3 font-semibold text-right">DR</th>
                            <th className="px-4 py-3 font-semibold text-right">Comm+</th>
                            <th className="px-4 py-3 font-semibold text-right">Comm-</th>
                            <th className="px-4 py-3 font-semibold text-right">Balance</th>
                            <th className="px-4 py-3 font-semibold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {isLoading && <tr><td colSpan={9} className="py-8 text-center text-text-secondary">Loading accounts...</td></tr>}
                        {!isLoading && (!reportData || (Array.isArray(reportData) && reportData.length === 0)) && (
                            <tr><td colSpan={9} className="py-8 text-center text-text-secondary">No accounts found.</td></tr>
                        )}
                        {!isLoading && Array.isArray(reportData) && reportData.map((u: any) => (
                            <tr key={u.id} className="hover:bg-background-tertiary/30">
                                <td className="px-4 py-3 font-medium">{u.username}</td>
                                <td className="px-4 py-3 text-xs"><span className="bg-primary/20 text-primary px-2 py-0.5 rounded">{u.role}</span></td>
                                <td className="px-4 py-3 text-right font-mono text-text-tertiary">0.00</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-400">0.00</td>
                                <td className="px-4 py-3 text-right font-mono text-red-400">0.00</td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-500/80">0.00</td>
                                <td className="px-4 py-3 text-right font-mono text-red-500/80">0.00</td>
                                <td className="px-4 py-3 font-mono font-bold text-right">
                                    <span className={u.balance >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {formatPoints(u.balance || 0)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <ChevronRight size={16} className="text-text-tertiary ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPnlReport = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-background-tertiary/30 p-4 rounded-xl border border-border/50">
                <Text variant="body" weight="bold">Profit & Loss Summary</Text>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-xs uppercase text-text-secondary border-b border-border/50">
                        <tr>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">Role</th>
                            <th className="px-4 py-3 font-semibold text-right">Total Profit</th>
                            <th className="px-4 py-3 font-semibold text-right">Total Loss</th>
                            <th className="px-4 py-3 font-semibold text-right">Net (Agent Perspective)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {isLoading && <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading P&L...</td></tr>}
                        {!isLoading && (!reportData || (Array.isArray(reportData) && reportData.length === 0)) && (
                            <tr><td colSpan={5} className="py-8 text-center text-text-secondary">No P&L data found.</td></tr>
                        )}
                        {!isLoading && Array.isArray(reportData) && reportData.map((u: any) => (
                            <tr key={u.id} className="hover:bg-background-tertiary/30">
                                <td className="px-4 py-3 font-medium">{u.username}</td>
                                <td className="px-4 py-3 text-xs"><span className="bg-primary/20 text-primary px-2 py-0.5 rounded">{u.role}</span></td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatPoints(u.totalProfit || 0)}</td>
                                <td className="px-4 py-3 text-right font-mono text-red-400">{formatPoints(u.totalLoss || 0)}</td>
                                <td className="px-4 py-3 font-mono font-bold text-right">
                                    <span className={u.net >= 0 ? "text-emerald-400" : "text-red-400"}>
                                        {formatPoints(u.net || 0)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStatementReport = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-background-tertiary/30 p-4 rounded-xl border border-border/50">
                <Text variant="body" weight="bold">Account Statement</Text>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-xs uppercase text-text-secondary border-b border-border/50">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Description</th>
                            <th className="px-4 py-3 font-semibold">Type</th>
                            <th className="px-4 py-3 font-semibold text-right">Amount</th>
                            <th className="px-4 py-3 font-semibold text-right">Balance After</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {isLoading && <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading statement...</td></tr>}
                        {!isLoading && (!reportData?.entries || reportData.entries.length === 0) && (
                            <tr><td colSpan={5} className="py-8 text-center text-text-secondary">No statement entries found.</td></tr>
                        )}
                        {!isLoading && reportData?.entries && reportData.entries.map((entry: any) => (
                            <tr key={entry.id} className="hover:bg-background-tertiary/30">
                                <td className="px-4 py-3 text-xs text-text-secondary">{new Date(entry.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-3 font-medium">{entry.description || '-'}</td>
                                <td className="px-4 py-3 text-xs"><span className="bg-primary/10 text-text-secondary px-2 py-0.5 rounded">{entry.type}</span></td>
                                <td className="px-4 py-3 text-right font-mono">
                                    <span className={['CREDIT', 'WIN', 'COMMISSION'].includes(entry.type) ? "text-emerald-400" : "text-red-400"}>
                                        {['CREDIT', 'WIN', 'COMMISSION'].includes(entry.type) ? '+' : '-'}{formatPoints(entry.amount)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold">{formatPoints(entry.balanceAfter)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPdcReport = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-background-tertiary/30 p-4 rounded-xl border border-border/50">
                <Text variant="body" weight="bold">Post Dated Checks (PDC) & Outstanding</Text>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-xs uppercase text-text-secondary border-b border-border/50">
                        <tr>
                            <th className="px-4 py-3 font-semibold">User</th>
                            <th className="px-4 py-3 font-semibold">Type</th>
                            <th className="px-4 py-3 font-semibold">Due Date</th>
                            <th className="px-4 py-3 font-semibold text-right">Amount</th>
                            <th className="px-4 py-3 font-semibold text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {isLoading && <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Loading PDC...</td></tr>}
                        {!isLoading && (!reportData?.items || reportData.items.length === 0) && (
                            <tr><td colSpan={5} className="py-8 text-center text-text-secondary">No PDC or outstanding amounts found.</td></tr>
                        )}
                        {!isLoading && reportData?.items && reportData.items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-background-tertiary/30">
                                <td className="px-4 py-3 font-medium">{item.username}</td>
                                <td className="px-4 py-3 text-xs">{item.type}</td>
                                <td className="px-4 py-3 text-xs text-text-secondary">{item.dueDate}</td>
                                <td className="px-4 py-3 font-mono font-bold text-right">{formatPoints(item.amount)}</td>
                                <td className="px-4 py-3 text-center"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{item.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
         <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
            <Activity className="mb-4" size={48} />
            <Text variant="h4" weight="semibold">{title}</Text>
            <Text variant="body" color="secondary" className="mt-2 max-w-sm">This report module is currently under active development. Data bindings will be connected soon.</Text>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
                
                <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
                    <Text variant="h2" weight="bold">Reports</Text>

                    <div className="flex items-center gap-3 bg-background-tertiary/50 p-2 border border-border/50 rounded-xl w-full sm:w-auto min-w-[300px]">
                        <Users size={18} className="text-text-secondary ml-2" />
                        <select 
                            className="w-full bg-transparent border-none text-sm font-semibold focus:outline-none focus:ring-0"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Global / All Downline</option>
                            {users.map((u: any) => (
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                         <input
                            type="text"
                            placeholder="User ID"
                            className="w-[100px] bg-background border border-border rounded px-2 py-1 text-xs"
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ReportTab 
                        title="Account Report" 
                        icon={Users} 
                        active={activeTab === 'account'} 
                        onClick={() => setActiveTab('account')}
                        description="View hierarchical user balances, exposure, and limits."
                    />
                    <ReportTab 
                        title="P&L Report" 
                        icon={TrendingUp} 
                        active={activeTab === 'pnl'} 
                        onClick={() => setActiveTab('pnl')}
                        description="Profit & Loss summary across sports and casinos."
                    />
                    <ReportTab 
                        title="PDC Report" 
                        icon={CreditCard} 
                        active={activeTab === 'pdc'} 
                        onClick={() => setActiveTab('pdc')}
                        description="Post Dated Checks and outstanding amounts."
                    />
                    <ReportTab 
                        title="Statement" 
                        icon={FileText} 
                        active={activeTab === 'statement'} 
                        onClick={() => setActiveTab('statement')}
                        description="Detailed transaction statements by period."
                    />
                </div>

                <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/50 min-h-[400px]">
                    {activeTab === 'account' && renderAccountReport()}
                    {activeTab === 'pnl' && renderPnlReport()}
                    {activeTab === 'pdc' && renderPdcReport()}
                    {activeTab === 'statement' && renderStatementReport()}
                </div>

            </div>
        </DashboardLayout>
    );
}
