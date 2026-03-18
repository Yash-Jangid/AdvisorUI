/**
 * ─── Frontend Payout Calculator ───────────────────────────────────────────────
 *
 * Mirror of: advisor/src/common/utils/payout-calculator.ts
 * Keep both files in sync — they MUST use identical formulas.
 *
 * ── Formulas by market type ────────────────────────────────────────────────
 *
 * MATCH_ODDS / BOOKMAKER (Back):
 *   profit  = stake × (odds − 1)      e.g. 100 @ 1.85 → profit=85, payout=185
 *
 * MATCH_ODDS / BOOKMAKER (Lay):
 *   potentialPayout = stake            (you receive backer's stake on win)
 *   maxLiability    = stake × (odds − 1)
 *
 * FANCY / ODDEVEN / METER (YES or NO):
 *   profit  = stake × rate / 100       e.g. 100 @ 105 → profit=105, payout=205
 */

export type MarketGtype =
  | 'match_odds'
  | 'bookmaker'
  | 'fancy'
  | 'fancy1'
  | 'oddeven'
  | 'meter'
  | string;

export type BetType = 'back' | 'lay' | 'yes' | 'no';

export interface PayoutResult {
  potentialPayout: number;
  potentialProfit: number;
  maxLiability: number;
}

const FANCY_GTYPES = new Set(['fancy', 'fancy1', 'oddeven', 'meter']);

export function calculatePayout(
  stake: number,
  oddsOrRate: number,
  gtype: MarketGtype,
  betType: BetType,
): PayoutResult {
  const isFancy = FANCY_GTYPES.has(gtype?.toLowerCase?.() ?? '');

  if (isFancy) {
    const profit = Math.round((stake * oddsOrRate) / 100 * 100) / 100;
    return { potentialPayout: stake + profit, potentialProfit: profit, maxLiability: 0 };
  }

  if (betType === 'lay') {
    const liability = Math.round(stake * (oddsOrRate - 1) * 100) / 100;
    return { potentialPayout: stake, potentialProfit: stake, maxLiability: liability };
  }

  // Back bet (Match Odds / Bookmaker)
  const profit = Math.round(stake * (oddsOrRate - 1) * 100) / 100;
  return { potentialPayout: stake + profit, potentialProfit: profit, maxLiability: 0 };
}

/** Human-readable label for odds/rate depending on market type */
export function getOddsLabel(gtype: MarketGtype): string {
  return FANCY_GTYPES.has(gtype?.toLowerCase?.() ?? '') ? 'Rate' : 'Odds';
}

/** Is this market type a fancy/session (rate-based) bet? */
export function isFancyMarket(gtype: MarketGtype): boolean {
  return FANCY_GTYPES.has(gtype?.toLowerCase?.() ?? '');
}
