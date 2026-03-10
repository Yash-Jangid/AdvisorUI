'use client';

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  disabled = false,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Icon
        icon={Search}
        size={16}
        className="absolute left-3 text-text-tertiary pointer-events-none"
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-9 pr-9 py-2 rounded-lg border border-border bg-background-secondary',
          'text-sm text-text-primary placeholder:text-text-tertiary',
          'transition-colors duration-fast',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Icon icon={X} size={14} />
        </button>
      )}
    </div>
  );
}
