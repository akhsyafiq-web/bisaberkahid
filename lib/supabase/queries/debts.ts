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

export async function createDebt(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDebtInput
): Promise<Debt> {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: userId,
      creditor_name: input.creditor_name,
      total_amount: input.total_amount,
      paid_amount: 0,
      due_date: input.due_date ?? null,
      notes: input.notes ?? null,
      status: "active",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Debt;
}

/** Records a debt payment (expense + paid_amount bump). Implemented in Prompt 21. */
export async function payDebt(
  _supabase: SupabaseClient,
  _debtId: string,
  _amount: number,
  _sources: WalletSourceInput[]
): Promise<void> {
  throw new Error("payDebt() belum diimplementasikan (lihat Prompt 21).");
}

export async function deleteDebt(
  supabase: SupabaseClient,
  debtId: string
): Promise<void> {
  const { data: debt } = await supabase
    .from("debts")
    .select("paid_amount")
    .eq("id", debtId)
    .maybeSingle();
  if (debt && debt.paid_amount > 0) {
    throw new Error("Hutang yang sudah dibayar sebagian tidak bisa dihapus.");
  }
  const { error } = await supabase.from("debts").delete().eq("id", debtId);
  if (error) throw error;
}
