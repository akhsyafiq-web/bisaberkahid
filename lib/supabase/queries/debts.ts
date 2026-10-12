import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Debt,
  DebtStatus,
  DebtWithPayments,
  CreateDebtInput,
  WalletSourceInput,
} from "@/types";

export async function getDebts(
  supabase: SupabaseClient,
  userId: string,
  status?: DebtStatus
): Promise<Debt[]> {
  let query = supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Debt[];
}

export async function getDebtById(
  supabase: SupabaseClient,
  debtId: string
): Promise<DebtWithPayments | null> {
  const { data, error } = await supabase
    .from("debts")
    .select(
      "*, payments:expenses(*, category:expense_categories(*), sources:expense_wallet_sources(*, wallet:wallets(id,name,type)))"
    )
    .eq("id", debtId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as DebtWithPayments) ?? null;
}

/**
 * Create a debt. With `recordIncome`, the borrowed money is also recorded as a
 * "Pinjaman" income (split per `distributions`, remainder to Dompet Besar) in
 * the same DB transaction. Requires database/debt_features.sql.
 */
export async function createDebt(
  supabase: SupabaseClient,
  input: CreateDebtInput & { recordIncome?: boolean; distributions?: WalletSourceInput[] }
): Promise<string> {
  const { data, error } = await supabase.rpc("create_debt", {
    p_creditor_name: input.creditor_name,
    p_total_amount: input.total_amount,
    p_debt_date: input.debt_date ?? null,
    p_due_date: input.due_date ?? null,
    p_notes: input.notes ?? null,
    p_record_income: !!input.recordIncome,
    p_distributions: (input.distributions ?? []).filter((d) => d.amount > 0),
  });
  if (error) throw error;
  return data as string;
}

export async function updateDebt(
  supabase: SupabaseClient,
  debtId: string,
  input: CreateDebtInput
): Promise<void> {
  const { error } = await supabase
    .from("debts")
    .update({
      creditor_name: input.creditor_name,
      total_amount: input.total_amount,
      debt_date: input.debt_date ?? undefined,
      due_date: input.due_date ?? null,
      notes: input.notes ?? null,
    })
    .eq("id", debtId);
  if (error) throw error;
}

/** Delete an unpaid debt; `deleteIncome` also removes its linked "Pinjaman" income. */
export async function deleteDebt(
  supabase: SupabaseClient,
  debtId: string,
  deleteIncome = false
): Promise<void> {
  const { error } = await supabase.rpc("delete_debt", {
    p_debt_id: debtId,
    p_delete_income: deleteIncome,
  });
  if (error) throw error;
}
