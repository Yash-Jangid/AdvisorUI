'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { MatchCard, MatchCardSkeleton } from '@/components/features/match/MatchCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Text } from '@/components/atoms/Text';
import { useUpcomingMatches, useLiveMatches } from '@/lib/api/hooks/useMatches';

function LivePulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 mx-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
    </span>
  );
}

export default function MatchesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: live = [], isLoading: liveLoading } = useLiveMatches();
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingMatches();

  const isLoading = liveLoading || upcomingLoading;

  const allCategories = useMemo(() => {
    const cats = new Set([...live, ...upcoming].map(m => m.category || 'Others'));
    return Array.from(cats).sort();
  }, [live, upcoming]);

  const filtered = (arr: typeof live) =>
    arr.filter(
      (m) => {
        const matchesSearch = !search ||
          m.teamA.toLowerCase().includes(search.toLowerCase()) ||
          m.teamB.toLowerCase().includes(search.toLowerCase()) ||
          m.title.toLowerCase().includes(search.toLowerCase());

        const matchCat = m.category || 'Others';
        const matchesCategory = categoryFilter === 'all' || matchCat === categoryFilter;

        return matchesSearch && matchesCategory;
      }
    );

  const showLive = filter !== 'upcoming';
  const showUpcoming = filter !== 'live';

  const filteredLive = showLive ? filtered(live) : [];
  const filteredUpcoming = showUpcoming ? filtered(upcoming) : [];
  const noResults = filteredLive.length === 0 && filteredUpcoming.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Text variant="h2" weight="bold">Matches</Text>
              {live.length > 0 && !liveLoading && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                  <LivePulseDot />
                  {live.length} LIVE
                </span>
              )}
            </div>
            <Text variant="small" color="secondary" className="mt-1">
              {upcoming.length} upcoming · {live.length} in progress
            </Text>
          </div>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search teams or match…"
            className="sm:w-64"
          />
        </div>

        {/* Filters Container */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex gap-2" role="tablist" aria-label="Match timeline filter">
            {(['all', 'live', 'upcoming'] as const).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  }`}
              >
                {f === 'live' && <LivePulseDot />}
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Category filter */}
          {allCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide" role="tablist" aria-label="Category filter">
              <button
                role="tab"
                aria-selected={categoryFilter === 'all'}
                onClick={() => setCategoryFilter('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${categoryFilter === 'all'
                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                    : 'bg-transparent border-border/60 text-text-secondary hover:border-primary/50'
                  }`}
              >
                All Categories
              </button>
              {allCategories.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={categoryFilter === c}
                  onClick={() => setCategoryFilter(c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${categoryFilter === c
                      ? 'bg-primary border-primary text-primary-foreground shadow-md'
                      : 'bg-transparent border-border/60 text-text-secondary hover:border-primary/50'
                    }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
          </div>
        ) : noResults ? (
          <div className="py-24 flex flex-col items-center justify-center text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
            <div className="text-4xl mb-3">🏏</div>
            <Text variant="body" weight="medium">No matches found</Text>
            <Text variant="small" color="secondary" className="mt-1">
              {search ? `No matches for "${search}"` : 'Check back soon for upcoming fixtures.'}
            </Text>
          </div>
        ) : (
          <div className="space-y-8">
            {/* LIVE NOW section */}
            {filteredLive.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <LivePulseDot />
                  <Text variant="caption" weight="semibold" className="text-green-400 uppercase tracking-wider">
                    Live Now
                  </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredLive.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming section */}
            {filteredUpcoming.length > 0 && (
              <section>
                <Text variant="caption" weight="semibold" className="text-text-secondary uppercase tracking-wider mb-4 block">
                  Upcoming
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredUpcoming.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
