// ─── App-Wide Route Constants ────────────────────────────────────────────────
// Single source of truth for all route strings.
// Import these wherever navigation is needed; never use raw string paths.

export const ROUTES = {
  // Public
  home: '/',

  // Auth group
  auth: {
    login: '/login',
    register: '/register',
  },

  // User group
  user: {
    dashboard: '/dashboard',
    matches: '/matches',
    matchDetail: (id: string) => `/matches/${id}`,
    predictions: '/predictions',
    leaderboard: '/leaderboard',
    ledger: '/ledger',
    transactions: '/transactions',
    cashTransaction: '/cash-transaction',
    commissionLenDen: '/commission-len-den',
    reports: '/reports',
    profile: '/profile',
    myTeam: '/my-team',
    casino: '/casino',
    casinoTable: (type: string | number) => `/casino/${type}`,
  },

  // Admin group
  admin: {
    root: '/admin',
    matches: '/admin/matches',
    users: '/admin/users',
    roles: '/admin/roles',
    auditLogs: '/admin/audit-logs',
    treasury: '/admin/treasury',
    marketConfigs: '/admin/market-configs',
    systemConfig: '/admin/system-config',
    settlement: '/admin/settlement',
  },
} as const;

// ─── Route Groups (for middleware / guards) ───────────────────────────────────
export const PROTECTED_ROUTES = [
  ROUTES.user.dashboard,
  ROUTES.user.matches,
  ROUTES.user.predictions,
  ROUTES.user.leaderboard,
  ROUTES.user.ledger,
  ROUTES.user.transactions,
  ROUTES.user.cashTransaction,
  ROUTES.user.commissionLenDen,
  ROUTES.user.reports,
  ROUTES.user.profile,
  ROUTES.user.myTeam,
  ROUTES.user.casino,
  ROUTES.admin.matches,
  ROUTES.admin.users,
  ROUTES.admin.auditLogs,
  ROUTES.admin.treasury,
  ROUTES.admin.marketConfigs,
  ROUTES.admin.systemConfig,
  ROUTES.admin.settlement,
] as const;

export const ADMIN_ROUTES = [
  ROUTES.admin.root,
  ROUTES.admin.matches,
  ROUTES.admin.users,
  ROUTES.admin.roles,
  ROUTES.admin.auditLogs,
  ROUTES.admin.treasury,
  ROUTES.admin.marketConfigs,
  ROUTES.admin.systemConfig,
  ROUTES.admin.settlement,
] as const;
