import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ─── Points / Numbers ─────────────────────────────────────────────────────────

/**
 * Formats a points balance: 1234567 → "1,234,567 pts"
 */
export const formatPoints = (value: number): string =>
  `${new Intl.NumberFormat('en-IN').format(value)}`;

/**
 * Formats a compact number: 1234567 → "1.2M"
 */
export const formatCompact = (value: number): string =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

/**
 * Formats a percentage change with sign: 5.3 → "+5.3%", -2.1 → "-2.1%"
 */
export const formatPercentage = (value: number, decimals = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;

// ─── Odds ─────────────────────────────────────────────────────────────────────

/**
 * Formats cricket odds: 1.85 → "1.85x"
 */
export const formatOdds = (value: number | undefined | null): string => {
  if (!value || value <= 0) return '—';
  return `${value.toFixed(2)}x`;
};

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Formats ISO string to localized date: "2026-02-22T10:00:00Z" → "22 Feb 2026"
 */
export const formatDate = (iso: string): string => {
  const date = parseISO(iso);
  return isValid(date) ? format(date, 'd MMM yyyy') : '—';
};

/**
 * Formats ISO string to localized datetime: "2026-02-22T10:00:00Z" → "22 Feb 2026, 10:00 AM"
 */
export const formatDateTime = (iso: string): string => {
  const date = parseISO(iso);
  return isValid(date) ? format(date, 'd MMM yyyy, h:mm a') : '—';
};

/**
 * Relative time: "2026-02-22T10:00:00Z" → "5 minutes ago" / "in 3 hours"
 */
export const formatRelative = (iso: string): string => {
  const date = parseISO(iso);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—';
};

/**
 * Formats match start time: if today shows time only, otherwise show date
 */
export const formatMatchTime = (iso: string): string => {
  const date = parseISO(iso);
  if (!isValid(date)) return '—';
  const now = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  return isToday ? format(date, 'h:mm a') : format(date, 'd MMM, h:mm a');
};

// ─── Strings ──────────────────────────────────────────────────────────────────

/**
 * Truncates a string to maxLength with ellipsis
 */
export const truncate = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : `${str.slice(0, maxLength - 3)}...`;

/**
 * Converts "TEAM_A_WIN" → "Team A Win"
 */
export const formatEnumLabel = (value: string): string =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
