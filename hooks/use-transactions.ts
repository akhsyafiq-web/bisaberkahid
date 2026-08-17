"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import {
  getTransactionFeed,
  getTransaction,
  createIncome,
  updateIncome,
  deleteIncome,
  createExpense,
  updateExpense,
  deleteExpense,
  type TransactionFilters,
} from "@/lib/supabase/queries/transactions";
import type { CreateIncomeInput, CreateExpenseInput } from "@/types";

/** Invalidate everything money-related after a mutation. */
function useInvalidateMoney() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["transaction-feed"] });
    queryClient.invalidateQueries({ queryKey: ["wallets"] });
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["month-summary"] });
    queryClient.invalidateQueries({ queryKey: ["total-balance", userId] });
  };
}

export function useTransactionFeed(filters: TransactionFilters = {}) {
  const userId = useUserId();
  return useQuery({
    queryKey: [...qk.transactionFeed(userId), filters],
    enabled: !!userId,
    queryFn: () => getTransactionFeed(createClient(), userId!, filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    enabled: !!id,
    queryFn: () => getTransaction(createClient(), id),
  });
}

export function useCreateIncome() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateIncomeInput) => createIncome(createClient(), input),
    onSuccess: invalidate,
  });
}

export function useUpdateIncome(id: string) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateIncomeInput) => updateIncome(createClient(), id, input),
    onSuccess: invalidate,
  });
}

export function useCreateExpense() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(createClient(), input),
    onSuccess: invalidate,
  });
}

export function useUpdateExpense(id: string) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => updateExpense(createClient(), id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: "income" | "expense" }) =>
      type === "income"
        ? deleteIncome(createClient(), id)
        : deleteExpense(createClient(), id),
    onSuccess: invalidate,
  });
}
