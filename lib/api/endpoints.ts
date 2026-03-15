// ─── Centralized API Endpoint Registry ──────────────────────────────────────
// Single source of truth for ALL backend paths.
// No URL string should ever appear raw inside a component, hook, or Server Action.
// Usage: api.get(ENDPOINTS.matches.upcoming())

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: () => '/auth/login',
    register: () => '/auth/register',
    refresh: () => '/auth/refresh',
    logout: () => '/auth/logout',
    me: () => '/auth/me',
  },

  // ── Matches ───────────────────────────────────────────────────────────────
  matches: {
    list: (limit = 20) => `/matches?limit=${limit}`,
    upcoming: (limit = 20) => `/matches/upcoming?limit=${limit}`,
    live: () => '/matches/live',
    byId: (id: string) => `/matches/${id}`,
    odds: (id: string) => `/matches/${id}/odds`,
    sync: () => '/matches/sync',
    /** SSE endpoint — use api.sse(), not api.get(). Pass the match ID. */
    sse: (id: string) => `/matches/${id}/stream`,
    /** Diamond full markets data */
    diamondMarkets: (id: string) => `/matches/${id}/diamond/markets`,
  },

  // ── Markets ───────────────────────────────────────────────────────────────
  markets: {
    byMatch: (matchId: string) => `/matches/${matchId}/markets`,
    byId: (matchId: string, marketId: string) => `/matches/${matchId}/markets/${marketId}`,
  },

  // ── Betting Engine (V2) ───────────────────────────────────────────────────
  betting: {
    placeTicket: () => '/bet-tickets',
    myTickets: (page = 1, limit = 20, gameType?: string) => {
      let url = `/bet-tickets/my?page=${page}&limit=${limit}`;
      if (gameType) url += `&gameType=${gameType}`;
      return url;
    },
    myTicketsForMarket: (marketId: string) => `/bet-tickets/my?marketId=${marketId}`,
  },

  // ── Predictions ───────────────────────────────────────────────────────────
  predictions: {
    place: () => '/predictions',
    my: (page = 1, limit = 20) => `/predictions/my?page=${page}&limit=${limit}`,
    byMatch: (matchId: string) => `/predictions/match/${matchId}`,
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────
  leaderboard: {
    top: (limit = 50) => `/leaderboard?limit=${limit}`,
    myRank: () => '/leaderboard/my-rank',
  },

  // ── Ledger ────────────────────────────────────────────────────────────────
  ledger: {
    myBalance: () => '/ledger/balance',
    myHistory: (page = 1, limit = 20) => `/ledger/history?page=${page}&limit=${limit}`,
    downlineHistory: (page = 1, limit = 50) =>
      `/ledger/downline-history?page=${page}&limit=${limit}`,
    adminTopUp: () => '/ledger/admin/top-up',
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    auditLogs: (params?: Record<string, string | number | undefined>) => {
      if (!params) return '/admin/audit-logs';
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') query.append(key, String(value));
      });
      const qs = query.toString();
      return qs ? `/admin/audit-logs?${qs}` : '/admin/audit-logs';
    },
    users: () => '/admin/users',
    userById: (userId: string) => `/admin/users/${userId}`,
    settle: (matchId: string) => `/admin/settle/${matchId}`,
    settleCancellation: (matchId: string) => `/admin/matches/${matchId}/cancel`,
    settleMarket: (matchId: string, marketId: string) =>
      `/matches/${matchId}/markets/${marketId}/settle`,
    matchBook: (matchId: string, page = 1, limit = 50) =>
      `/admin/match-book?matchId=${matchId}&page=${page}&limit=${limit}`,
    betCounts: (matchId: string) => `/admin/bet-counts?matchId=${matchId}`,
    commissionOverride: (userId: string) => `/admin/users/${userId}/commission`,
    roles: () => `/admin/roles`,
    roleById: (roleId: string) => `/admin/roles/${roleId}`,
    rolesActive: () => `/admin/roles/active`,
  },

  // ── Hierarchy ─────────────────────────────────────────────────────────────
  hierarchy: {
    promote: (userId: string) => `/hierarchy/${userId}/promote`,
    demote: (userId: string) => `/hierarchy/${userId}/demote`,
    tree: () => `/hierarchy/tree`,
  },

  // ── Casino ────────────────────────────────────────────────────────────────
  casino: {
    tables: () => '/casino/tables',
    data: (type: number) => `/casino/data/${type}`,
    result: (type: number) => `/casino/result/${type}`,
    detailResult: (type: number, mid: number) => `/casino/result/${type}/${mid}`,
    activeMarket: (cid: number) => `/casino/active-market/${cid}`,
  },
} as const;
