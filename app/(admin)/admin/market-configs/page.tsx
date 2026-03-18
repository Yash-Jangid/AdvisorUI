'use client';

import React, { useState } from 'react';
import { Settings, ShieldAlert, Loader2, Save, ChevronRight, Info } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useMarketConfigs, useUpdateMarketConfig, MarketConfig } from '@/lib/api/hooks/useMarketConfigs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

export default function MarketConfigsPage() {
  const { data: configs, isLoading, isError } = useMarketConfigs();
  const { mutate: updateConfig, isPending } = useUpdateMarketConfig();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<MarketConfig>>({});

  const handleEdit = (index: number, config: MarketConfig) => {
    setEditingIndex(index);
    setFormData(config);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editingIndex === null || !formData.marketType) return;

    updateConfig(
      { marketType: formData.marketType, data: formData },
      {
        onSuccess: () => {
          toast.success(`Config for ${formData.displayName} updated`);
          setEditingIndex(null);
          setFormData({});
        },
        onError: (err) => {
          toast.error('Failed to update config', { description: err.message });
        },
      }
    );
  };

  const handleChange = (field: keyof MarketConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center p-6">
        <div className="h-16 w-16 bg-error/10 text-error rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert size={32} />
        </div>
        <Text variant="h3" color="error">Failed to load configurations</Text>
        <Text variant="body" color="secondary">The server might be down or you lack permissions.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 p-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-secondary via-background-secondary to-primary/5 p-8 border border-border shadow-2xl">
        <div className="absolute top-0 right-0 -u-24 -r-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white transform transition-transform hover:scale-105">
              <Icon icon={Settings} size={32} />
            </div>
            <div>
              <Text variant="h1" className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                Market Configurations
              </Text>
              <Text variant="body" color="secondary" className="mt-1 font-medium">
                Adjust overrounds, stake limits, and settlement triggers per market type.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Config Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configs?.map((config, idx) => {
          const isEditing = editingIndex === idx;

          return (
            <div
              key={config.marketType}
              className={cn(
                "group relative rounded-3xl border transition-all duration-300 overflow-hidden",
                isEditing 
                    ? "border-primary bg-background-secondary shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-20" 
                    : "border-border bg-background-secondary/50 hover:bg-background-secondary hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              {/* Card Header */}
              <div className="p-6 pb-0 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <Text variant="small" className="uppercase tracking-[0.2em] font-black text-primary/70">
                      {config.marketType}
                    </Text>
                  </div>
                  <Text variant="h4" weight="bold" className="text-xl">
                    {config.displayName}
                  </Text>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(idx, config)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-background-tertiary text-text-secondary hover:bg-primary hover:text-white transition-all transform hover:rotate-90"
                  >
                    <Settings size={18} />
                  </button>
                )}
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Overround</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        disabled={!isEditing}
                        value={isEditing ? formData.overround : config.overround}
                        onChange={(e) => handleChange('overround', parseFloat(e.target.value))}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                          isEditing ? "border-primary/50 bg-background-primary" : "border-transparent bg-background-tertiary/20 text-text-secondary"
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Trigger</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? formData.settlementTrigger : config.settlementTrigger}
                      onChange={(e) => handleChange('settlementTrigger', e.target.value)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                        isEditing ? "border-primary/50 bg-background-primary" : "border-transparent bg-background-tertiary/20 text-text-secondary"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-background-tertiary/30 border border-border/50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-tertiary font-bold uppercase tracking-widest">Stake Limits</span>
                    <Icon icon={Info} size={12} className="text-primary/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-tertiary">Minimum</span>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? formData.minStake : config.minStake}
                        onChange={(e) => handleChange('minStake', parseInt(e.target.value))}
                        className={cn(
                          "bg-transparent font-bold text-sm focus:outline-none",
                          isEditing && "text-primary border-b border-primary/30"
                        )}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-tertiary">Maximum</span>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? formData.maxStake : config.maxStake}
                        onChange={(e) => handleChange('maxStake', parseInt(e.target.value))}
                        className={cn(
                          "bg-transparent font-bold text-sm focus:outline-none",
                          isEditing && "text-primary border-b border-primary/30"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary ml-1">Max Payout cap</label>
                  <div className="relative group">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">₹</span>
                     <input
                      type="number"
                      disabled={!isEditing}
                      value={isEditing ? formData.maxPayout : config.maxPayout}
                      onChange={(e) => handleChange('maxPayout', parseInt(e.target.value))}
                      className={cn(
                        "w-full rounded-xl border pl-7 pr-3 py-2 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
                        isEditing ? "border-primary/50 bg-background-primary text-primary" : "border-transparent bg-background-tertiary/20 text-text-secondary"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="p-6 pt-0 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="h-11 px-4 flex items-center justify-center rounded-xl bg-background-tertiary text-text-secondary font-bold text-sm hover:bg-background-quaternary transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {/* Hover Indicator */}
              {!isEditing && (
                 <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
