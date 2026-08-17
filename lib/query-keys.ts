/** Central TanStack Query key factory so invalidation stays consistent. */
export const qk = {
  wallets: (userId?: string) => ["wallets", userId] as const,
  wallet: (id: string) => ["wallet", id] as const,
  walletTransactions: (id: string) => ["wallet-transactions", id] as const,
  monthSummary: (userId?: string, month?: string) =>
    ["month-summary", userId, month] as const,
  transactionFeed: (userId?: string, limit?: number) =>
    ["transaction-feed", userId, limit] as const,
  categories: (userId?: string, kind?: string) =>
    ["categories", userId, kind] as const,
  debts: (userId?: string, status?: string) => ["debts", userId, status] as const,
  profile: (userId?: string) => ["profile", userId] as const,
};
