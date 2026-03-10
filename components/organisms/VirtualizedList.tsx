'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VirtualizedListProps<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Generic virtualized list — renders only visible rows for large datasets.
// Uses @tanstack/react-virtual for O(1) rendering regardless of list size.

export function VirtualizedList<T>({
  items,
  estimateSize = 80,
  overscan = 5,
  renderItem,
  renderEmpty,
  className,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center p-8', className)}>
        {renderEmpty?.() ?? (
          <p className="text-text-secondary text-sm">No items to display.</p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto scrollbar-thin', className)}
      style={{ contain: 'strict' }}
    >
      {/* Total height spacer — keeps scroll proportional */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
          >
            {renderItem(items[virtualRow.index] as T, virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
