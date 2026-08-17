import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Wallet,
  WalletType,
  WalletWithStats,
  CreateWalletInput,
  UpdateWalletInput,
} from "@/types";
import {
  calculateGoalMonthlyTarget,
  calculateGoalProgress,
  getDaysUntilEndOfMonth,
  getEndOfMonth,
  getStartOfMonth,
  toISODate,
} from "@/lib/utils";

export async function getWallets(
  supabase: SupabaseClient,
  userId: string,
  type?: WalletType
): Promise<Wallet[]> {
  let query = supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Wallet[];
}

export async function getWalletById(
  supabase: SupabaseClient,
  walletId: string
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", walletId)
    .maybeSingle();
  if (error) throw error;
  return (data as Wallet) ?? null;
}

export async function getDefaultWallet(
  supabase: SupabaseClient,
  userId: string
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "default")
    .maybeSingle();
  if (error) throw error;
  return (data as Wallet) ?? null;
}

export async function createWallet(
  supabase: SupabaseClient,
  userId: string,
  input: CreateWalletInput
): Promise<Wallet> {
  const base = {
    user_id: userId,
    name: input.name,
    type: input.type,
    current_balance: 0,
    is_active: true,
  };

  let payload: Record<string, unknown> = base;

  if (input.type === "monthly") {
    payload = {
      ...base,
      monthly_budget: input.monthly_budget ?? 0,
      budget_month: toISODate(getStartOfMonth()),
    };
  } else if (input.type === "goals" && input.goal_target && input.goal_duration_months) {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + input.goal_duration_months);
    payload = {
      ...base,
      goal_target: input.goal_target,
      goal_duration_months: input.goal_duration_months,
      goal_monthly_target: calculateGoalMonthlyTarget(
        input.goal_target,
        input.goal_duration_months
      ),
      goal_start_date: toISODate(start),
      goal_end_date: toISODate(end),
    };
  }

  const { data, error } = await supabase
    .from("wallets")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Wallet;
}

export async function updateWallet(
  supabase: SupabaseClient,
  walletId: string,
  input: UpdateWalletInput
): Promise<Wallet> {
  const patch: Record<string, unknown> = { ...input };

  // Recompute goal monthly target if relevant fields changed.
  if (input.goal_target && input.goal_duration_months) {
    patch.goal_monthly_target = calculateGoalMonthlyTarget(
      input.goal_target,
      input.goal_duration_months
    );
  }

  const { data, error } = await supabase
    .from("wallets")
    .update(patch)
    .eq("id", walletId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Wallet;
}

export async function deleteWallet(
  supabase: SupabaseClient,
  walletId: string
): Promise<void> {
  const { error } = await supabase.from("wallets").delete().eq("id", walletId);
  if (error) throw error;
}

/** Adjust a wallet balance by a delta (positive credits, negative debits). */
export async function adjustWalletBalance(
  supabase: SupabaseClient,
  walletId: string,
  delta: number
): Promise<void> {
  const { error } = await supabase.rpc("adjust_wallet_balance", {
    p_wallet_id: walletId,
    p_delta: delta,
  });
  if (error) throw error;
}

/** Sum of expenses sourced from each wallet within the current month. */
export async function getMonthlySpentMap(
  supabase: SupabaseClient,
  userId: string,
  ref = new Date()
): Promise<Map<string, number>> {
  const from = toISODate(getStartOfMonth(ref));
  const to = toISODate(getEndOfMonth(ref));

  const { data, error } = await supabase
    .from("expense_wallet_sources")
    .select("wallet_id, amount, expense:expenses!inner(user_id, date)")
    .eq("expense.user_id", userId)
    .gte("expense.date", from)
    .lte("expense.date", to);
  if (error) throw error;

  const rows = (data ?? []) as unknown as { wallet_id: string; amount: number }[];
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.wallet_id, (map.get(r.wallet_id) ?? 0) + r.amount);
  }
  return map;
}

/** Wallets enriched with per-type stats (spent, usage %, goal progress). */
export async function getWalletsWithStats(
  supabase: SupabaseClient,
  userId: string,
  type?: WalletType
): Promise<WalletWithStats[]> {
  const [wallets, spentMap] = await Promise.all([
    getWallets(supabase, userId, type),
    getMonthlySpentMap(supabase, userId),
  ]);
  const daysLeft = getDaysUntilEndOfMonth();

  return wallets.map((w) => {
    if (w.type === "monthly") {
      const spent = spentMap.get(w.id) ?? 0;
      const budget = w.monthly_budget ?? 0;
      return {
        ...w,
        spent,
        usagePercent: budget > 0 ? Math.round((spent / budget) * 100) : 0,
        daysLeftInMonth: daysLeft,
      };
    }
    if (w.type === "goals") {
      return {
        ...w,
        goalProgress: calculateGoalProgress(w.current_balance, w.goal_target ?? 0),
      };
    }
    return { ...w };
  });
}

/** Combined balance across all active wallets. */
export async function getTotalBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const wallets = await getWallets(supabase, userId);
  return wallets.reduce((sum, w) => sum + Number(w.current_balance), 0);
}

export interface WalletTransactionItem {
  id: string;
  kind: "income" | "expense";
  amount: number;
  date: string;
  notes: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
}

/**
 * Unified transaction history for one wallet: income distributed into it +
 * expenses sourced from it, newest first.
 */
export async function getTransactionsByWallet(
  supabase: SupabaseClient,
  walletId: string
): Promise<WalletTransactionItem[]> {
  const [{ data: dist, error: e1 }, { data: src, error: e2 }] = await Promise.all([
    supabase
      .from("income_distributions")
      .select("id, amount, income:incomes(id, date, notes, category:income_categories(name, icon))")
      .eq("wallet_id", walletId),
    supabase
      .from("expense_wallet_sources")
      .select("id, amount, expense:expenses(id, date, notes, category:expense_categories(name, icon))")
      .eq("wallet_id", walletId),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  type DistRow = {
    id: string;
    amount: number;
    income: { date: string; notes: string | null; category: { name: string; icon: string | null } | null } | null;
  };
  type SrcRow = {
    id: string;
    amount: number;
    expense: { date: string; notes: string | null; category: { name: string; icon: string | null } | null } | null;
  };

  const incomes: WalletTransactionItem[] = ((dist ?? []) as unknown as DistRow[])
    .filter((r) => r.income)
    .map((r) => ({
      id: r.id,
      kind: "income",
      amount: r.amount,
      date: r.income!.date,
      notes: r.income!.notes,
      categoryName: r.income!.category?.name ?? null,
      categoryIcon: r.income!.category?.icon ?? null,
    }));

  const expenses: WalletTransactionItem[] = ((src ?? []) as unknown as SrcRow[])
    .filter((r) => r.expense)
    .map((r) => ({
      id: r.id,
      kind: "expense",
      amount: r.amount,
      date: r.expense!.date,
      notes: r.expense!.notes,
      categoryName: r.expense!.category?.name ?? null,
      categoryIcon: r.expense!.category?.icon ?? null,
    }));

  return [...incomes, ...expenses].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
