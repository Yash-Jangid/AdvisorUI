'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/organisms/Modal/Modal';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
}

const variantMap = {
  danger:  'bg-error/10 text-error ring-1 ring-error/30',
  warning: 'bg-warning/10 text-warning ring-1 ring-warning/30',
  default: 'bg-primary/10 text-primary ring-1 ring-primary/30',
};

const confirmBtnMap = {
  danger:  'bg-error hover:bg-error/90 text-white',
  warning: 'bg-warning hover:bg-warning/90 text-background',
  default: 'bg-primary hover:bg-primary/90 text-primary-foreground',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closeOnBackdrop={!isLoading}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-lg p-2 shrink-0', variantMap[variant])}>
            <Icon icon={AlertTriangle} size={20} />
          </div>
          <div className="space-y-1 pt-0.5">
            <Text variant="h4" weight="semibold">{title}</Text>
            <Text variant="small" color="secondary">{message}</Text>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-border bg-background-secondary text-sm font-medium text-text-primary hover:bg-background-tertiary transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
              confirmBtnMap[variant]
            )}
          >
            {isLoading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
