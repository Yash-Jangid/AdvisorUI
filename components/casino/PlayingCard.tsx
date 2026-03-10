import React from 'react';
import { cn } from '@/lib/utils/cn';

interface PlayingCardProps {
  cardStr: string; // e.g., "K♠", "7♥", "10♦", "A♣"
  className?: string;
}

/**
 * Parses a string like "K♠" into rank "K" and suit "♠"
 */
function parseCard(cardStr: string) {
  if (!cardStr || cardStr.length < 2) return { rank: '', suit: '' };

  // Common card representations have the suit as the last character
  const suit = cardStr.slice(-1);
  const rank = cardStr.slice(0, -1);
  
  return { rank, suit };
}

/**
 * Returns true if the suit is Hearts (♥) or Diamonds (♦), which should be colored red.
 */
function isRedSuit(suit: string) {
  return suit === '♥' || suit === '♦' || suit === 'H' || suit === 'D';
}

/**
 * Renders a visually beautiful, realistic playing card.
 */
export function PlayingCard({ cardStr, className }: PlayingCardProps) {
  const { rank, suit } = parseCard(cardStr);
  const isRed = isRedSuit(suit);

  return (
    <div
      className={cn(
        'relative flex h-20 w-14 sm:h-24 sm:w-16 flex-col justify-between rounded-md bg-white p-1.5 shadow-md shadow-black/20 ring-1 ring-black/5',
        className
      )}
    >
      {/* Top Left */}
      <div className={cn('flex flex-col items-center leading-none', isRed ? 'text-red-500' : 'text-slate-900')}>
        <span className="text-sm font-bold sm:text-base">{rank}</span>
        <span className="text-xs sm:text-sm">{suit}</span>
      </div>

      {/* Center Large Suit (Optional, for visual flair) */}
      <div className={cn('absolute inset-0 flex items-center justify-center opacity-10', isRed ? 'text-red-500' : 'text-slate-900')}>
        <span className="text-4xl">{suit}</span>
      </div>

      {/* Bottom Right (Upside Down) */}
      <div
        className={cn(
          'flex flex-col items-center rotate-180 leading-none',
          isRed ? 'text-red-500' : 'text-slate-900'
        )}
      >
        <span className="text-sm font-bold sm:text-base">{rank}</span>
        <span className="text-xs sm:text-sm">{suit}</span>
      </div>
    </div>
  );
}
