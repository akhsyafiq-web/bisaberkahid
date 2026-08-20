"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import {
  getDebts,
  getDebtById,
  createDebt,
  deleteDebt,
} from "@/lib/supabase/queries/debts";
import { createExpense } from "@/lib/supabase/queries/transactions";
import { getCategories } from "@/lib/supabase/queries/categories";
import { DEBT_CATEGORY_NAME } from "@/lib/constants";
import { toISODate } from "@/lib/utils";
import type { CreateDebtInput, DebtStatus, WalletSourceInput } from "@/types";

export function useDebts(status?: DebtStatus) {
  const userId = useUserId();
  return useQuery({
    queryKey: qk.debts(userId, status ?? "all"),
    enabled: !!userId,
    queryFn: () => getDebts(createClient(), userId!, status),
  });
}

export function useDebt(id: string) {
  return useQuery({
    queryKey: ["debt", id],
    enabled: !!id,
    queryFn: () => getDebtById(createClient(), id),
  });
}

function useInvalidateDebts() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["debts"] });
    queryClient.invalidateQueries({ queryKey: ["debt"] });
    queryClient.invalidateQueries({ queryKey: ["wallets"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-feed"] });
    queryClient.invalidateQueries({ queryKey: ["month-summary"] });
    queryClient.invalidateQueries({ queryKey: ["total-balance", userId] });
  };
}

export function useCreateDebt() {
  const userId = useUserId();
  const invalidate = useInvalidateDebts();
  return useMutation({
    mutationFn: (input: CreateDebtInput) => createDebt(createClient(), userId!, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDebt() {
  const invalidate = useInvalidateDebts();
  return useMutation({
    mutationFn: (debtId: string) => deleteDebt(createClient(), debtId),
    onSuccess: invalidate,
  });
}

/**
 * Pay a debt = record an expense in the "Cicilan & Hutang" category with the
 * debt_id set. The DB trigger updates paid_amount/status automatically.
 */
export function usePayDebt() {
  const userId = useUserId();
  const invalidate = useInvalidateDebts();
  return useMutation({
    mutationFn: async (input: {
      debtId: string;
      amount: number;
      sources: WalletSourceInput[];
      notes?: string | null;
    }) => {
      const supabase = createClient();
      const cats = await getCategories(supabase, userId!, "expense");
      const debtCat = cats.find((c) => c.name === DEBT_CATEGORY_NAME) ?? cats[0];
      return createExpense(supabase, {
        category_id: debtCat.id,
        amount: input.amount,
        date: toISODate(new Date()),
        notes: input.notes ?? null,
        debt_id: input.debtId,
        sources: input.sources,
      });
    },
    onSuccess: invalidate,
  });
}
