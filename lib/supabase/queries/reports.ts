import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionSummary, CategorySummary, MonthlyTrendPoint } from "@/types";
import { getDateRange, getStartOfMonth, getEndOfMonth, toISODate } from "@/lib/utils";

/** Sum income/expense for a month and the net balance. */
export async function getMonthSummary(
  supabase: SupabaseClient,
  userId: string,
  month: Date = new Date()
): Promise<TransactionSummary> {
  const from = toISODate(getStartOfMonth(month));
  const to = toISODate(getEndOfMonth(month));

  const [{ data: inc }, { data: exp }] = await Promise.all([
    supabase.from("incomes").select("amount").eq("user_id", userId).gte("date", from).lte("date", to),
    supabase.from("expenses").select("amount").eq("user_id", userId).gte("date", from).lte("date", to),
  ]);

  const totalIncome = (inc ?? []).reduce((s, r) => s + (r.amount as number), 0);
  const totalExpense = (exp ?? []).reduce((s, r) => s + (r.amount as number), 0);

  return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, from, to };
}

export async function getCategoryBreakdown(
  supabase: SupabaseClient,
  userId: string,
  kind: "income" | "expense",
  from: Date,
  to: Date
): Promise<CategorySummary[]> {
  const table = kind === "income" ? "incomes" : "expenses";
  const catTable = kind === "income" ? "income_categories" : "expense_categories";

  const { data, error } = await supabase
    .from(table)
    .select(`amount, category:${catTable}(id,name,icon)`)
    .eq("user_id", userId)
    .gte("date", toISODate(from))
    .lte("date", toISODate(to));
  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    amount: number;
    category: { id: string; name: string; icon: string | null } | null;
  }[];

  const map = new Map<string, CategorySummary>();
  let grandTotal = 0;
  for (const row of rows) {
    if (!row.category) continue;
    grandTotal += row.amount;
    const existing = map.get(row.category.id);
    if (existing) {
      existing.total_amount += row.amount;
      existing.transaction_count += 1;
    } else {
      map.set(row.category.id, {
        category_id: row.category.id,
        name: row.category.name,
        icon: row.category.icon,
        total_amount: row.amount,
        transaction_count: 1,
        percentage: 0,
      });
    }
  }

  const result = [...map.values()].map((c) => ({
    ...c,
    percentage: grandTotal ? Math.round((c.total_amount / grandTotal) * 100) : 0,
  }));
  result.sort((a, b) => b.total_amount - a.total_amount);
  return result;
}

export async function getMonthlyTrend(
  supabase: SupabaseClient,
  userId: string,
  months = 12
): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (let i = months - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const summary = await getMonthSummary(supabase, userId, ref);
    points.push({
      month: labels[ref.getMonth()],
      income: summary.totalIncome,
      expense: summary.totalExpense,
    });
  }
  return points;
}

/** Convenience: summary for a named period. */
export async function getSummaryForPeriod(
  supabase: SupabaseClient,
  userId: string,
  period: "today" | "week" | "month" | "year"
): Promise<TransactionSummary> {
  const { from, to } = getDateRange(period);
  const [{ data: inc }, { data: exp }] = await Promise.all([
    supabase.from("incomes").select("amount").eq("user_id", userId).gte("date", toISODate(from)).lte("date", toISODate(to)),
    supabase.from("expenses").select("amount").eq("user_id", userId).gte("date", toISODate(from)).lte("date", toISODate(to)),
  ]);
  const totalIncome = (inc ?? []).reduce((s, r) => s + (r.amount as number), 0);
  const totalExpense = (exp ?? []).reduce((s, r) => s + (r.amount as number), 0);
  return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, from: toISODate(from), to: toISODate(to) };
}
