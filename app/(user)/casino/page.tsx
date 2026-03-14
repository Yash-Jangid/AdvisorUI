'use client';

import React from 'react';
import NextLink from 'next/link';
import { Layers, Dices, PlayCircle } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useCasinoTables } from '@/lib/api/hooks/useCasino';
import { ROUTES } from '@/lib/constants/routes';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import Image from 'next/image';

export default function CasinoLobbyPage() {
  const { data: tables, isLoading, isError } = useCasinoTables();

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary">
            <Icon icon={Dices} size={28} />
            <Text variant="h3" className="font-bold tracking-tight text-text-primary">
              Live Casino
            </Text>
          </div>
          <Text variant="body" color="secondary">
            Experience real-time live dealer games.
          </Text>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-background-tertiary" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <Icon icon={Layers} size={48} className="mb-4 text-destructive/50" />
            <Text variant="h4" className="font-semibold text-destructive">
              Failed to load Casino tables
            </Text>
            <Text variant="small" color="secondary" className="mt-2 max-w-md">
              The live casino data feed is currently unavailable. Please try again later.
            </Text>
          </div>
        ) : tables && tables.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tables.map((table: any, index: number) => (
              <CasinoGameCard
                key={`${table.type}-${table.name}-${index}`}
                type={table.type}
                name={table.name}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-background-secondary p-6 text-center">
            <Icon icon={Dices} size={48} className="mb-4 text-text-tertiary" />
            <Text variant="h4" className="font-medium">
              No games available
            </Text>
            <Text variant="small" color="secondary" className="mt-1">
              Check back later for live casino action.
            </Text>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}

function CasinoGameCard({ type, name }: { type: number; name: string }) {
  return (
    <NextLink
      href={ROUTES.user.casinoTable(type)}
      className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-xl border border-border bg-background-secondary transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background-secondary to-background-tertiary" style={{ backgroundImage: `url('https://sitethemedata.com/casino_icons/bc/roulette/400040324.jpg')` }} >
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply transition-opacity group-hover:opacity-20" />
        <div className="flex h-full w-full items-center justify-center opacity-30">
          <Icon icon={Dices} size={120} className="text-primary/20 transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex w-full flex-col gap-2 bg-gradient-to-t from-black via-black/80 to-transparent p-5 pt-12">
        <div className="flex items-center justify-between">
          <Text variant="h4" className="font-bold text-white shadow-black drop-shadow-md">
            {name}
          </Text>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-400">Live Deals</span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 group-hover:scale-110">
            <PlayCircle size={24} className="ml-0.5" />
          </div>
        </div>
      </div>
    </NextLink>
  );
}
