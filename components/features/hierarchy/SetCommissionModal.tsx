'use client';

import React, { useState } from 'react';
import { Settings, Percent, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { useSetCommissionRate } from '@/lib/api/hooks/useHierarchy';
import { cn } from '@/lib/utils/cn';

interface SetCommissionModalProps {
    open: boolean;
    onClose: () => void;
    targetUser: { id: string; username: string; role: any } | null;
}

export function SetCommissionModal({ open, onClose, targetUser }: SetCommissionModalProps) {
    const [rate, setRate] = useState<string>('');
    const { mutateAsync: setCommission, isPending, error, reset } = useSetCommissionRate();

    // Reset state when modal opens
    React.useEffect(() => {
        if (open) {
            setRate('');
            reset();
        }
    }, [open, reset]);

    if (!open || !targetUser) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const rateValue = parseFloat(rate) / 100; // Convert 5% to 0.05
        if (isNaN(rateValue) || rateValue < 0 || rateValue > 1) return;

        try {
            await setCommission({ userId: targetUser.id, rate: rateValue });
            onClose();
        } catch (err) {
            // Error is handled by react-query and rendered below
        }
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isPending ? undefined : onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm rounded-2xl glass-card border border-border overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-border bg-background-tertiary/30">
                    <Text variant="h4" weight="semibold">Set Commission Rate</Text>
                    <button
                        onClick={isPending ? undefined : onClose}
                        className="rounded-lg p-2 text-text-tertiary hover:text-text-primary hover:bg-background-tertiary transition-colors"
                    >
                        <Icon icon={X} size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <Text variant="small" color="secondary">
                        Configure a custom commission rate for <strong className="text-text-primary">{targetUser.username}</strong>.
                        This will override their role's default commission rate.
                    </Text>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-text-secondary">Commission Percentage (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    required
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    autoFocus
                                    disabled={isPending}
                                    placeholder="e.g. 5.5"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary disabled:opacity-50"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">%</span>
                            </div>
                            <Text variant="caption" color="tertiary" className="block mt-1 pl-1">
                                Enter a value between 0 and 100. Decimal values are allowed.
                            </Text>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-error">
                                <Icon icon={AlertCircle} size={16} className="mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-semibold block">Update Failed</span>
                                    {(error as any)?.response?.data?.message || error.message}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || !rate}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all',
                                    'hover:opacity-90 active:scale-95 disabled:opacity-50',
                                )}
                            >
                                {isPending ? (
                                    <>
                                        <Icon icon={RefreshCw} size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Save Rate'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
