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
import { createExpense, createIncome } from "@/lib/supabase/queries/transactions";
import { getCategories, createCategory } from "@/lib/supabase/queries/categories";
import { DEBT_CATEGORY_NAME, LOAN_INCOME_CATEGORY_NAME } from "@/lib/constants";
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

/**
 * Create a debt. With `recordIncome`, the borrowed money is also recorded as
 * income (category "Pinjaman"): `incomeDistributions` go to the chosen wallets
 * and any remainder lands in Dompet Besar. The debt is saved first; if the
 * income step fails the debt stays and `incomeFailed` is true.
 */
export function useCreateDebt() {
  const userId = useUserId();
  const invalidate = useInvalidateDebts();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: CreateDebtInput & {
        recordIncome?: boolean;
        incomeDistributions?: WalletSourceInput[];
      }
    ) => {
      const supabase = createClient();
      const { recordIncome, incomeDistributions, ...debtInput } = input;
      const debt = await createDebt(supabase, userId!, debtInput);

      let incomeFailed = false;
      if (recordIncome) {
        try {
          const cats = await getCategories(supabase, userId!, "income");
          const cat =
            cats.find((c) => c.name === LOAN_INCOME_CATEGORY_NAME) ??
            (await createCategory(supabase, userId!, "income", {
              name: LOAN_INCOME_CATEGORY_NAME,
              icon: "🤝",
            }));
          await createIncome(supabase, {
            category_id: cat.id,
            amount: debtInput.total_amount,
            date: toISODate(new Date()),
            notes: `Hutang dari ${debtInput.creditor_name}`,
            distributions: (incomeDistributions ?? []).filter((d) => d.amount > 0),
            autoRemainderToDefault: true,
          });
        } catch {
          incomeFailed = true;
        }
      }
      return { debt, incomeRecorded: !!recordIncome && !incomeFailed, incomeFailed };
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
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
