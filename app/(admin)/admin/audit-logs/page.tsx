'use client';

import React, { useState, useCallback } from 'react';
import {
  RefreshCw, Filter, Search, ShieldAlert, BadgeInfo, ShieldX, Clock,
  ArrowUpDown, Coins, TrendingUp, UserCheck, Settings,
} from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useAuditLogs, type AuditLogFilters } from '@/lib/api/hooks/useAuditLogs';
import { type AuditAction, type AuditSeverity } from '@/lib/api/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { ROUTES } from '@/lib/constants/routes';

// ── Constants ─────────────────────────────────────────────────────────────────

const BUSINESS_TAGS = [
  { label: 'All Activities', value: '' },
  { label: 'Top-ups', value: 'topup' },
  { label: 'Transfers', value: 'transfer' },
  { label: 'Bets Placed', value: 'bet' },
  { label: 'Settlements', value: 'settlement' },
  { label: 'Admin Actions', value: 'admin_action' },
];

const SEVERITIES: AuditSeverity[] = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
const AUDIT_ACTIONS: AuditAction[] = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'AUTH', 'ADMIN_ACTION', 'SYSTEM'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  
  // Internal guard for High Admin only
  const role = user?.role;
  const level = typeof role === 'object' ? (role as any).level : 999;
  
  if (level > 1) {
    router.replace(ROUTES.user.dashboard);
    return null;
  }

  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<'email' | 'username' | 'id'>('email');
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 50 });
  const [activeTag, setActiveTag] = useState('');

  // Merge search into appropriate filter field on query submit
  const applySearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      actorEmail: searchField === 'email' ? search || undefined : undefined,
      actorUsername: searchField === 'username' ? search || undefined : undefined,
      actorId: searchField === 'id' ? search || undefined : undefined,
    }));
  }, [search, searchField]);

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag);
    setFilters(prev => ({ ...prev, page: 1, tags: tag || undefined }));
  };

  const clearAll = () => {
    setSearch('');
    setActiveTag('');
    setFilters({ page: 1, limit: 50 });
  };

  const { data: logs, isLoading, error, refetch } = useAuditLogs(filters);

  // ── Badge Helpers ────────────────────────────────────────────────────────────

  const getSeverityStyles = (sev: AuditSeverity) => {
    const map: Record<AuditSeverity, string> = {
      CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
      ERROR: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      WARN: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      INFO: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return map[sev] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getSeverityIcon = (sev: AuditSeverity) => {
    if (sev === 'CRITICAL' || sev === 'ERROR') return <Icon icon={ShieldX} size={13} />;
    if (sev === 'WARN') return <Icon icon={ShieldAlert} size={13} />;
    return <Icon icon={BadgeInfo} size={13} />;
  };

  const getActionBadge = (action: AuditAction, tags?: string[]) => {
    // Surface a human-readable business label using tags when possible
    const tag = tags?.[0];
    if (tag === 'topup') return { label: 'TOP-UP', cls: 'text-emerald-400 bg-emerald-400/10' };
    if (tag === 'transfer') return { label: 'TRANSFER', cls: 'text-cyan-400 bg-cyan-400/10' };
    if (tag === 'bet') return { label: 'BET', cls: 'text-violet-400 bg-violet-400/10' };
    if (tag === 'settlement') return { label: 'SETTLED', cls: 'text-amber-400 bg-amber-400/10' };
    return { label: action, cls: 'text-text-secondary bg-background' };
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:flex-row gap-6">

      {/* ── Left Sidebar Filters ─────────────────────────────────────────────── */}
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="flex flex-col gap-4 bg-background-secondary border border-border rounded-xl p-4">
          <div>
            <Text variant="h3" className="font-semibold text-text-primary flex items-center gap-2">
              <Filter size={20} className="text-primary" />
              Filters
            </Text>
            <Text variant="caption" color="secondary" className="mt-1">Search & refine logs</Text>
          </div>

          {/* ── Smart Search (email / username / id) ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Search Actor</label>
            <div className="flex gap-1.5">
              <select
                className="shrink-0 bg-background border border-border rounded-lg px-2 py-2 text-xs text-text-secondary focus:border-primary outline-none transition-all"
                value={searchField}
                onChange={e => setSearchField(e.target.value as typeof searchField)}
              >
                <option value="email">Email</option>
                <option value="username">Username</option>
                <option value="id">UUID</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={searchField === 'email' ? 'user@example.com' : searchField === 'username' ? 'jondoe' : 'UUID...'}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-2 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-tertiary"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applySearch()}
                />
                <Search className="absolute left-2 top-2.5 text-text-tertiary" size={14} />
              </div>
            </div>
            <button
              onClick={applySearch}
              className="w-full py-1.5 text-xs font-medium text-text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-colors"
            >
              Apply Search
            </button>
          </div>

          {/* ── Business Activity Quick Filter ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Activity Type</label>
            <div className="flex flex-col gap-1">
              {BUSINESS_TAGS.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => handleTagFilter(bt.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                    activeTag === bt.value
                      ? "bg-primary/15 text-primary font-medium border border-primary/30"
                      : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary border border-transparent"
                  )}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Severity ── */}
          {/* <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Severity</label>
            <select
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
              onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value as AuditSeverity || undefined, page: 1 }))}
              value={filters.severity || ''}
            >
              <option value="">All Severities</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div> */}

          {/* ── Date Range ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">Date Range</label>
            <input
              type="date"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
              onChange={e => setFilters(prev => ({ ...prev, from: e.target.value || undefined, page: 1 }))}
            />
            <input
              type="date"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-primary outline-none"
              onChange={e => setFilters(prev => ({ ...prev, to: e.target.value || undefined, page: 1 }))}
            />
          </div>

          <button
            onClick={clearAll}
            className="mt-1 w-full py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors border border-transparent hover:border-border"
          >
            Clear All
          </button>
        </div>
      </aside>

      {/* ── Main Data Table ───────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-secondary border border-border rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-tertiary/50">
          <div>
            <Text variant="body" className="font-semibold text-text-primary">Business Activity Logs</Text>
            <Text variant="caption" color="secondary">Admin-level audit trail</Text>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary bg-background border border-border rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={cn(isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-background-tertiary/80 backdrop-blur-sm text-xs uppercase text-text-secondary border-b border-border">
              <tr>
                <th className="px-5 py-4 font-semibold tracking-wider">Timestamp</th>
                {/* <th className="px-5 py-4 font-semibold tracking-wider">Severity</th> */}
                <th className="px-5 py-4 font-semibold tracking-wider">Action</th>
                <th className="px-5 py-4 font-semibold tracking-wider">Resource</th>
                <th className="px-5 py-4 font-semibold tracking-wider text-right">Amount</th>
                <th className="px-5 py-4 font-semibold tracking-wider">Actor</th>
                {/* <th className="px-5 py-4 font-semibold tracking-wider text-right">Status</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading && (
                <tr><td colSpan={6} className="p-8 text-center text-text-secondary">Loading logs…</td></tr>
              )}
              {error && !isLoading && (
                <tr><td colSpan={6} className="p-8 text-center text-error">Failed to fetch logs.</td></tr>
              )}
              {!isLoading && !error && (!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon={Clock} size={32} className="text-text-tertiary" />
                      <Text color="secondary">No logs match your filters.</Text>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && logs?.map((log) => {
                const { label: actionLabel, cls: actionCls } = getActionBadge(log.action, log.tags);
                return (
                  <tr key={log._id} className="hover:bg-background-tertiary/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-text-secondary">
                      {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                    </td>
                    {/* <td className="px-5 py-4">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold tracking-widest',
                        getSeverityStyles(log.severity)
                      )}>
                        {getSeverityIcon(log.severity)}
                        {log.severity}
                      </div>
                    </td> */}
                    <td className="px-5 py-4">
                      <span className={cn('font-mono text-xs font-semibold px-2.5 py-1 rounded-md border border-border', actionCls)}>
                        {actionLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-text-primary text-sm">{log.resource}</span>
                        {log.resourceId && (
                          <span className="font-mono text-[11px] text-text-tertiary">{log.resourceId.slice(0, 15)}…</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {log.diff?.amount !== undefined ? (
                        <span className="font-mono text-xs font-medium text-text-primary">
                          {log.diff.amount.toLocaleString()} pts
                        </span>
                      ) : (
                        <span className="text-text-tertiary text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-text-primary text-sm">
                          {(log as any).actorUsername || (log as any).actorEmail || log.actorRole}
                        </span>
                        <span className="font-mono text-[11px] text-text-tertiary" title={log.actorId}>
                          {(log as any).actorEmail && !(log as any).actorUsername
                            ? (log as any).actorEmail
                            : log.actorId.slice(0, 8) + '…'}
                        </span>
                      </div>
                    </td>
                    {/* <td className="px-5 py-4 text-right">
                      <span className={cn(
                        'font-mono text-xs font-semibold px-2.5 py-1 rounded-md',
                        (log.requestMeta?.statusCode ?? 200) >= 400
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-emerald-400 bg-emerald-400/10'
                      )}>
                        {log.requestMeta?.statusCode || '200'}
                      </span>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-border bg-background-tertiary flex items-center justify-between text-sm text-text-secondary">
          <span>Showing {logs?.length || 0} results</span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-background hover:bg-background-tertiary border border-border rounded disabled:opacity-50 transition-colors"
              disabled={filters.page === 1}
              onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))}
            >Prev</button>
            <span className="font-mono">{filters.page}</span>
            <button
              className="px-3 py-1 bg-background hover:bg-background-tertiary border border-border rounded disabled:opacity-50 transition-colors"
              disabled={!logs || logs.length < (filters.limit || 50)}
              onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))}
            >Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}
