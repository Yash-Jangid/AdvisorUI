'use client';

import React from 'react';
import { Settings, ShieldAlert, Loader2 } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useSystemConfig, useUpdateSystemConfig } from '@/lib/api/hooks/useSystemConfig';
import { toast } from 'sonner';

export default function SystemConfigPage() {
  const { data: config, isLoading, isError } = useSystemConfig();
  const { mutate: updateConfig, isPending } = useUpdateSystemConfig();

  const handleToggle = () => {
    if (!config) return;
    const newValue = !config.preMarketOddsEnabled;
    updateConfig(
      { preMarketOddsEnabled: newValue },
      {
        onSuccess: () => {
          toast.success(`Pre-Market Odds ${newValue ? 'Enabled' : 'Disabled'}`);
        },
        onError: (err) => {
          toast.error('Failed to update config', { description: err.message });
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon icon={Settings} size={20} />
        </div>
        <div>
          <Text variant="h3" weight="bold">System Configuration</Text>
          <Text variant="small" color="secondary">Manage global platform behaviors and feature flags.</Text>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Pre-Market Odds Card */}
        <div className="rounded-xl border border-border bg-background-secondary p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Text variant="body" weight="semibold">Allow Pre-Market Odds</Text>
                {!isLoading && config && !config.preMarketOddsEnabled && (
                  <span className="flex items-center gap-1 rounded bg-error/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-error">
                    <Icon icon={ShieldAlert} size={10} /> Disabled
                  </span>
                )}
              </div>
              <Text variant="small" color="secondary" className="max-w-xl block">
                When enabled, the platform will show markets and accept bets on matches that are in the <strong>UPCOMING</strong> state. 
                When disabled, upcoming matches will hide all market odds until the match transitions to LIVE.
              </Text>
            </div>

            <div className="flex shadow-sm rounded-md ml-4 shrink-0">
              {isLoading ? (
                <div className="h-9 w-24 bg-background-tertiary animate-pulse rounded-md" />
              ) : isError ? (
                <Text variant="small" color="error">Failed to load</Text>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleToggle}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                    config!.preMarketOddsEnabled ? 'bg-primary' : 'bg-background-tertiary'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      config!.preMarketOddsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  {isPending && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
