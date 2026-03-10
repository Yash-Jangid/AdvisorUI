'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { SkeletonCard } from '@/components/skeletons/SkeletonCard';
import { cn } from '@/lib/utils/cn';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Unique key matching a field on T, or a custom id */
  key: string;
  /** Column header label */
  header: string;
  /** Optional custom renderer — receives the row and returns ReactNode */
  render?: (row: T) => React.ReactNode;
  /** Optional CSS class for the <td> */
  className?: string;
  /** Align header + cell text */
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends { id: string }> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row data */
  data: T[];
  /** Show shimmer skeletons while loading */
  isLoading?: boolean;
  /** Total rows across all pages (for pagination label) */
  totalCount?: number;
  /** Current 1-based page number */
  page?: number;
  /** Rows per page */
  pageSize?: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional row click handler */
  onRowClick?: (row: T) => void;
}

// ─── DataTable ───────────────────────────────────────────────────────────────

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  totalCount,
  page = 1,
  pageSize = 20,
  onPageChange,
  emptyMessage = 'No data found.',
  onRowClick,
}: DataTableProps<T>) {
  const totalPages = totalCount != null ? Math.ceil(totalCount / pageSize) : undefined;
  const hasPrev = page > 1;
  const hasNext = totalPages != null ? page < totalPages : false;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getCellValue = (row: T, col: ColumnDef<T>): React.ReactNode => {
    if (col.render) return col.render(row);
    const value = (row as Record<string, unknown>)[col.key];
    if (value == null) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-border bg-background-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-semibold text-text-tertiary uppercase tracking-wide text-xs',
                    alignClass(col.align),
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <SkeletonCard lines={1} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Text variant="small" color="secondary">{emptyMessage}</Text>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    onRowClick
                      ? 'cursor-pointer hover:bg-background-secondary/60'
                      : 'hover:bg-background-secondary/30'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-text-primary',
                        alignClass(col.align),
                        col.className
                      )}
                    >
                      {getCellValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border bg-background-secondary/50 flex-wrap">
          <Text variant="caption" color="tertiary">
            {totalCount != null
              ? `${Math.min((page - 1) * pageSize + 1, totalCount)}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`
              : `Page ${page}`}
          </Text>

          <div className="flex items-center gap-1">
            {/* First */}
            <PaginationBtn
              icon={ChevronsLeft}
              label="First page"
              disabled={!hasPrev}
              onClick={() => onPageChange(1)}
            />
            {/* Prev */}
            <PaginationBtn
              icon={ChevronLeft}
              label="Previous page"
              disabled={!hasPrev}
              onClick={() => onPageChange(page - 1)}
            />
            {/* Page indicator */}
            <span className="px-3 py-1 text-xs font-medium text-text-secondary">
              {page}{totalPages != null ? ` / ${totalPages}` : ''}
            </span>
            {/* Next */}
            <PaginationBtn
              icon={ChevronRight}
              label="Next page"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
            />
            {/* Last */}
            {totalPages != null && (
              <PaginationBtn
                icon={ChevronsRight}
                label="Last page"
                disabled={!hasNext}
                onClick={() => onPageChange(totalPages)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagination button ─────────────────────────────────────────────────────────

function PaginationBtn({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Icon icon={icon} size={15} />
    </button>
  );
}
