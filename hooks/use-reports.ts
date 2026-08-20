"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import {
  getCategoryBreakdown,
  getMonthlyTrend,
} from "@/lib/supabase/queries/reports";
import type { Period } from "@/lib/utils";

export function useReports(period: Period, from: Date, to: Date) {
  const userId = useUserId();
  const key = [userId, period, from.toISOString(), to.toISOString()];

  const expense = useQuery({
    queryKey: ["report-expense", ...key],
    enabled: !!userId,
    queryFn: () => getCategoryBreakdown(createClient(), userId!, "expense", from, to),
  });

  const income = useQuery({
    queryKey: ["report-income", ...key],
    enabled: !!userId,
    queryFn: () => getCategoryBreakdown(createClient(), userId!, "income", from, to),
  });

  const trend = useQuery({
    queryKey: ["report-trend", userId, period],
    enabled: !!userId && period === "year",
    queryFn: () => getMonthlyTrend(createClient(), userId!, 12),
  });

  return { expense, income, trend };
}
