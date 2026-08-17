import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IncomeWithDistributions,
  ExpenseWithSources,
  TransactionFeedItem,
  CreateIncomeInput,
  CreateExpenseInput,
} from "@/types";

export interface TransactionFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  walletId?: string;
  limit?: number;
}

/* ------------------------------ INCOME ----------------------------------- */

export async function getIncomes(
  supabase: SupabaseClient,
  userId: string,
  filters: TransactionFilters = {}
): Promise<IncomeWithDistributions[]> {
  let query = supabase
    .from("incomes")
    .select(
      "*, category:income_categories(*), distributions:income_distributions(*, wallet:wallets(id,name,type))"
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as IncomeWithDistributions[];
}

export async function getIncomeById(
  supabase: SupabaseClient,
  incomeId: string
): Promise<IncomeWithDistributions | null> {
  const { data, error } = await supabase
    .from("incomes")
    .select(
      "*, category:income_categories(*), distributions:income_distributions(*, wallet:wallets(id,name,type))"
    )
    .eq("id", incomeId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as IncomeWithDistributions) ?? null;
}

export async function createIncome(
  supabase: SupabaseClient,
  input: CreateIncomeInput
): Promise<string> {
  const { data, error } = await supabase.rpc("create_income", {
    p_category_id: input.category_id,
    p_amount: input.amount,
    p_date: input.date,
    p_notes: input.notes ?? null,
    p_distributions: input.distributions ?? [],
    p_auto_remainder: input.autoRemainderToDefault ?? true,
  });
  if (error) throw error;
  return data as string;
}

export async function updateIncome(
  supabase: SupabaseClient,
  incomeId: string,
  input: CreateIncomeInput
): Promise<void> {
  const { error } = await supabase.rpc("update_income", {
    p_income_id: incomeId,
    p_category_id: input.category_id,
    p_amount: input.amount,
    p_date: input.date,
    p_notes: input.notes ?? null,
    p_distributions: input.distributions ?? [],
    p_auto_remainder: input.autoRemainderToDefault ?? true,
  });
  if (error) throw error;
}

export async function deleteIncome(
  supabase: SupabaseClient,
  incomeId: string
): Promise<void> {
  const { error } = await supabase.rpc("delete_income", { p_income_id: incomeId });
  if (error) throw error;
}

/* ------------------------------ EXPENSE ---------------------------------- */

export async function getExpenses(
  supabase: SupabaseClient,
  userId: string,
  filters: TransactionFilters = {}
): Promise<ExpenseWithSources[]> {
  let query = supabase
    .from("expenses")
    .select(
      "*, category:expense_categories(*), sources:expense_wallet_sources(*, wallet:wallets(id,name,type))"
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filters.from) query = query.gte("date", filters.from);
  if (filters.to) query = query.lte("date", filters.to);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ExpenseWithSources[];
}

export async function getExpenseById(
  supabase: SupabaseClient,
  expenseId: string
): Promise<ExpenseWithSources | null> {
  const { data, error } = await supabase
    .from("expenses")
    .select(
      "*, category:expense_categories(*), sources:expense_wallet_sources(*, wallet:wallets(id,name,type))"
    )
    .eq("id", expenseId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ExpenseWithSources) ?? null;
}

export async function createExpense(
  supabase: SupabaseClient,
  input: CreateExpenseInput
): Promise<string> {
  const { data, error } = await supabase.rpc("create_expense", {
    p_category_id: input.category_id,
    p_amount: input.amount,
    p_date: input.date,
    p_notes: input.notes ?? null,
    p_debt_id: input.debt_id ?? null,
    p_sources: input.sources ?? [],
  });
  if (error) throw error;
  return data as string;
}

export async function updateExpense(
  supabase: SupabaseClient,
  expenseId: string,
  input: CreateExpenseInput
): Promise<void> {
  const { error } = await supabase.rpc("update_expense", {
    p_expense_id: expenseId,
    p_category_id: input.category_id,
    p_amount: input.amount,
    p_date: input.date,
    p_notes: input.notes ?? null,
    p_debt_id: input.debt_id ?? null,
    p_sources: input.sources ?? [],
  });
  if (error) throw error;
}

export async function deleteExpense(
  supabase: SupabaseClient,
  expenseId: string
): Promise<void> {
  const { error } = await supabase.rpc("delete_expense", { p_expense_id: expenseId });
  if (error) throw error;
}

/* --------------------------- UNIFIED FEED -------------------------------- */

export async function getTransactionFeed(
  supabase: SupabaseClient,
  userId: string,
  filters: TransactionFilters = {}
): Promise<TransactionFeedItem[]> {
  const [incomes, expenses] = await Promise.all([
    getIncomes(supabase, userId, filters),
    getExpenses(supabase, userId, filters),
  ]);

  const feed: TransactionFeedItem[] = [
    ...incomes.map((i) => ({ type: "income" as const, ...i })),
    ...expenses.map((e) => ({ type: "expense" as const, ...e })),
  ];

  feed.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return filters.limit ? feed.slice(0, filters.limit) : feed;
}

/** Fetch a single transaction (income or expense) by id for the detail page. */
export async function getTransaction(
  supabase: SupabaseClient,
  id: string
): Promise<TransactionFeedItem | null> {
  const income = await getIncomeById(supabase, id);
  if (income) return { type: "income", ...income };
  const expense = await getExpenseById(supabase, id);
  if (expense) return { type: "expense", ...expense };
  return null;
}
