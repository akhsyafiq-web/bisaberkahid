"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import { getMonthSummary } from "@/lib/supabase/queries/reports";
import { getTransactionFeed } from "@/lib/supabase/queries/transactions";
import { getTotalBalance } from "@/lib/supabase/queries/wallets";
import { toISODate, getStartOfMonth } from "@/lib/utils";

export function useMonthSummary() {
  const userId = useUserId();
  const month = toISODate(getStartOfMonth());
  return useQuery({
    queryKey: qk.monthSummary(userId, month),
    enabled: !!userId,
    queryFn: () => getMonthSummary(createClient(), userId!),
  });
}

export function useTotalBalance() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["total-balance", userId],
    enabled: !!userId,
    queryFn: () => getTotalBalance(createClient(), userId!),
  });
}

export function useRecentTransactions(limit = 5) {
  const userId = useUserId();
  return useQuery({
    queryKey: qk.transactionFeed(userId, limit),
    enabled: !!userId,
    queryFn: () => getTransactionFeed(createClient(), userId!, { limit }),
  });
}
