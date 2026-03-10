export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginDto {
  identifier: string;
  password: string;
  recaptchaToken?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
  recaptchaToken?: string;
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: Role;
  canHaveChild?: boolean;
  isActive: boolean;
  isBettingDisabled?: boolean;
  isUserCreationDisabled?: boolean;
  balance: number;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  canHaveChild: boolean;
  defaultCommissionPct: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Match ─────────────────────────────────────────────────────────────────────

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Odds {
  teamAWin: number;
  teamBWin: number;
  draw: number;
  calculatedAt: string;
}

export interface Match {
  id: string;
  externalId: string;
  title: string;
  teamA: string;
  teamB: string;
  status: MatchStatus;
  startTime: string;
  category?: string;
  odds: Odds;
  streamingUrl?: string;
  streamingProvider?: string;
  predictionsLocked: boolean;
  predictionCount: number;
  totalPool: number;
  createdAt: string;
  updatedAt: string;
}

// ── Market ────────────────────────────────────────────────────────────────────

export interface MarketOutcome {
  outcomeKey: string;
  label: string;
  decimalOdds: number;
  impliedProbability: number;
}

export type MarketStatus = 'OPEN' | 'LOCKED' | 'SUSPENDED' | 'SETTLED' | 'VOID';
export type MarketSettlementTrigger =
  | 'on_toss'
  | 'on_ball'
  | 'on_over_end'
  | 'on_innings_end'
  | 'on_match_end';

export const MARKET_TIER_LABELS: Record<MarketSettlementTrigger, string> = {
  on_toss: 'Toss',
  on_ball: 'Ball',
  on_over_end: 'Over',
  on_innings_end: 'Innings',
  on_match_end: 'Match',
};

export interface Market {
  id: string;
  matchId: string;
  marketType: string;
  displayName: string;
  status: MarketStatus;
  settlementTrigger: MarketSettlementTrigger;
  overNumber?: number | null;
  ballNumber?: number | null;
  line?: number | null;
  playerName?: string | null;
  outcomes: MarketOutcome[];
  winningOutcomeKey?: string | null;
  totalBetsCount: number;
  totalStakedPoints: number;
  lockedAt?: string | null;
  settledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveMatchScore {
  matchId: string;
  teamAScore?: string;
  teamBScore?: string;
  currentInnings?: number;
  overs?: string;
  status: MatchStatus;
  updatedAt: string;
}

// ── Prediction ────────────────────────────────────────────────────────────────

export type PredictionSide = 'BACK' | 'LAY';
export type PredictionTeam = 'A' | 'B' | 'DRAW';
export type PredictionStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED' | 'CANCELLED';
export type PredictionOutcome = 'TEAM_A_WIN' | 'TEAM_B_WIN' | 'DRAW';

export interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  amount: number;
  side: PredictionSide;
  outcome: PredictionOutcome;
  status: PredictionStatus;
  oddsAtPlacement: Odds;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  match?: Pick<Match, 'id' | 'title' | 'teamA' | 'teamB'>;
}

export interface PlacePredictionDto {
  matchId: string;
  amount: number;
  side: PredictionSide;
  outcome: PredictionOutcome;
  idempotencyKey: string;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  userId: string;
  name: string;
  username: string;
  totalPoints: number;
  rank: number;
}

export interface MyRankResponse {
  userId: string;
  rank: number | null;
  totalPoints: number;
}

// ── Ledger ────────────────────────────────────────────────────────────────────

export type LedgerEntryType = 'CREDIT' | 'DEBIT' | 'COMMISSION' | 'REFUND' | 'BONUS';

export interface LedgerEntry {
  id: string;
  userId: string;
  amount: number;
  type: LedgerEntryType;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface BalanceResponse {
  userId: string;
  balance: number;
  currency: 'POINTS';
}

/** Extended balance response including aggregate totals */
export interface LedgerBalance {
  userId: string;
  balance: number;
  totalCredits: number;
  totalDebits: number;
  currency: 'POINTS';
}

// ── Audit Logs ─────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'AUTH'
  | 'ADMIN_ACTION'
  | 'SYSTEM';

export type AuditSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface AuditRequestMeta {
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  httpMethod: string;
  statusCode: number;
  responseTimeMs: number;
}

export interface AuditLog {
  _id: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  actorId: string;
  actorRole: string;
  requestMeta: AuditRequestMeta;
  diff?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    amount?: number;
  };
  tags: string[];
  severity: AuditSeverity;
  createdAt: string;
  updatedAt: string;
}

// ── Casino ────────────────────────────────────────────────────────────────────

export interface CasinoTableId {
  type: number;
  name: string;
}

export interface CasinoLiveData {
  type: number;
  name?: string;
  mid?: number;
  round_id?: string;
  status?: string;
  cards?: Record<string, string[]>;
  result?: string | null;
}

export interface CasinoRoundResult {
  type: number;
  mid?: number;
  winner?: string;
  settled_at?: string;
}

export interface CasinoDetailResult extends CasinoRoundResult {
  round_id?: string;
  cards?: Record<string, string[]>;
}
