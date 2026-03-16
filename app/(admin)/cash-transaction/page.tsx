'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { Coins, Trash2, Save, Users, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { formatPoints } from '@/lib/utils/formatters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

type CashTransaction = {
  id: string;
  userId: string;
  collectionType: string;
  amount: number;
  paymentType: string;
  remark?: string;
  date: string;
  createdAt: string;
};

type Summary = {
  dena: number;
  lena: number;
  balance: number;
  balanceLabel: string;
};

export default function CashTransactionPage() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // in a real app, this would be a searchable dropdown
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(50);

  // Form State
  const [formData, setFormData] = useState({
    collectionType: 'Lena',
    amount: '',
    paymentType: '',
    remark: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Derived query key
  const queryKey = ['cash-transactions', selectedUserId, page, limit];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<{ data: CashTransaction[], meta: any, summary: Summary }>(
      `/cash-transaction/history/${selectedUserId}?page=${page}&limit=${limit}`
    ),
    enabled: !!selectedUserId
  });

  // Fetch all downline users for selection
    const { data: usersData, isLoading: isUsersLoading } = useQuery<any>({
        queryKey: ['downline-users'],
        queryFn: () => api.get('/users/downline'),
    });
    const users = Array.isArray(usersData) ? usersData : (usersData?.data || []);

  const createMutation = useMutation({
    mutationFn: (newTx: any) => api.post('/cash-transaction', newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setFormData(prev => ({ ...prev, amount: '', remark: '' }));
      alert("Cash entry submitted successfully!");
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to submit entry');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cash-transaction/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !formData.amount || !formData.paymentType || !formData.date) return;

    createMutation.mutate({
      userId: selectedUserId,
      collectionType: formData.collectionType,
      amount: Number(formData.amount),
      paymentType: formData.paymentType,
      remark: formData.remark,
      date: new Date(formData.date).toISOString()
    });
  };

  const summary = data?.summary;
  const entries = data?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
        <Text variant="h2" weight="bold">Cash Transaction</Text>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Form Region (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                <Icon icon={Coins} className="text-primary" />
                <Text variant="h4" weight="semibold">New Entry</Text>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                    <Users size={14} /> Client Name
                  </label>
                  <select
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a user...</option>
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                    {users.length === 0 && (
                      // Fallback for manual user ID entry if needed for testing
                      <option value={selectedUserId || 'fallback-id'}>Manual ID: {selectedUserId}</option>
                    )}
                  </select>
                  {/* Fallback input for manual entry below if the list isn't loading */}
                  <input
                    type="text"
                    placeholder="Or enter User ID manually"
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2 text-xs mt-2"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary">Collection Type</label>
                  <select
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm font-semibold"
                    value={formData.collectionType}
                    onChange={e => setFormData({ ...formData, collectionType: e.target.value })}
                  >
                    <option value="Lena" className="text-emerald-400">Lena</option>
                    <option value="Dena" className="text-red-400">Dena</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                    <Coins size={14} /> Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-lg font-mono font-bold"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                    <Save size={14} /> Payment Type
                  </label>
                  <select
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm"
                    value={formData.paymentType}
                    onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Type...</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Settlement">Settlement</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                    <Calendar size={14} /> Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                    <FileText size={14} /> Remark
                  </label>
                  <textarea
                    className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2.5 text-sm resize-none"
                    rows={3}
                    placeholder="Add an optional remark..."
                    value={formData.remark}
                    onChange={e => setFormData({ ...formData, remark: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending || !selectedUserId}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
                >
                  {createMutation.isPending ? 'Submitting...' : <><CheckCircle2 size={18} /> Submit Entry</>}
                </button>
              </form>
            </div>
          </div>

          {/* History & Summary (Right) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Vanky12 Summary Boxes */}
            {selectedUserId && summary ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-5 border-t-2 border-emerald-500/50 shadow-sm">
                  <Text variant="small" className="uppercase tracking-wider text-emerald-400 font-bold mb-2">Total Lena</Text>
                  <Text variant="h2" className="font-mono text-emerald-400 font-bold">{formatPoints(summary.lena)}</Text>
                </div>
                <div className="glass-card rounded-xl p-5 border-t-2 border-red-500/50 shadow-sm">
                  <Text variant="small" className="uppercase tracking-wider text-red-400 font-bold mb-2">Total Dena</Text>
                  <Text variant="h2" className="font-mono text-red-400 font-bold">{formatPoints(summary.dena)}</Text>
                </div>
                <div className={cn("glass-card rounded-xl p-5 border-t-2 shadow-sm", summary.balance >= 0 ? "border-emerald-500/50" : "border-red-500/50")}>
                  <Text variant="small" className="uppercase tracking-wider text-text-secondary font-bold mb-2">Balance</Text>
                  <Text variant="h2" className={cn("font-mono font-bold", summary.balance >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {summary.balanceLabel}
                  </Text>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-xl flex items-center justify-center border border-dashed border-border text-text-secondary">
                Select a client to view their transaction summary.
              </div>
            )}

            {/* History Table */}
            <div className="glass-card rounded-xl overflow-hidden shadow-sm border border-border/50 flex flex-col flex-1">
              <div className="px-5 py-4 border-b border-border bg-background-tertiary/30">
                <Text variant="body" weight="bold">Recent Transactions</Text>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-background-tertiary/90 text-xs uppercase text-text-secondary border-b border-border">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Date</th>
                      <th className="px-5 py-3.5 font-bold">Type</th>
                      <th className="px-5 py-3.5 font-bold">Amount</th>
                      <th className="px-5 py-3.5 font-bold">Payment Type</th>
                      <th className="px-5 py-3.5 font-bold">Remark</th>
                      <th className="px-5 py-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {!selectedUserId && (
                      <tr><td colSpan={6} className="py-16 text-center text-text-secondary">Please select a user first.</td></tr>
                    )}
                    {isLoading && selectedUserId && (
                      <tr><td colSpan={6} className="py-16 text-center text-text-secondary">Loading history...</td></tr>
                    )}
                    {!isLoading && entries.length === 0 && selectedUserId && (
                      <tr><td colSpan={6} className="py-16 text-center text-text-tertiary">No cash transactions found.</td></tr>
                    )}
                    {!isLoading && entries.map(entry => (
                      <tr key={entry.id} className="hover:bg-background-tertiary/50 transition-colors">
                        <td className="px-5 py-3 text-xs text-text-secondary">{format(new Date(entry.date), 'dd-MM-yyyy')}</td>
                        <td className="px-5 py-3 font-semibold">
                          <span className={cn("px-2 py-0.5 rounded", entry.collectionType?.toLowerCase() === 'lena' ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
                            {entry.collectionType}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono font-bold text-text-primary">{formatPoints(entry.amount)}</td>
                        <td className="px-5 py-3 text-xs">{entry.paymentType}</td>
                        <td className="px-5 py-3 text-xs max-w-[200px] truncate">{entry.remark || '—'}</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this entry?')) {
                                deleteMutation.mutate(entry.id);
                              }
                            }}
                            className="text-text-tertiary hover:text-red-400 transition-colors p-1 rounded"
                            title="Delete Entry"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}