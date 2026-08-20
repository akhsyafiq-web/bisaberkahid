import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, CategoryKind, CreateCategoryInput } from "@/types";

function tableFor(kind: CategoryKind) {
  return kind === "income" ? "income_categories" : "expense_categories";
}

export async function getCategories(
  supabase: SupabaseClient,
  userId: string,
  kind: CategoryKind
): Promise<Category[]> {
  const { data, error } = await supabase
    .from(tableFor(kind))
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export const getIncomeCategories = (s: SupabaseClient, userId: string) =>
  getCategories(s, userId, "income");

export const getExpenseCategories = (s: SupabaseClient, userId: string) =>
  getCategories(s, userId, "expense");

/**
 * Only active categories (for transaction-form dropdowns).
 * Filters client-side on `is_active !== false` so it stays safe even before the
 * categories_toggle.sql migration adds the column (undefined → treated active).
 */
export async function getActiveCategories(
  supabase: SupabaseClient,
  userId: string,
  kind: CategoryKind
): Promise<Category[]> {
  const all = await getCategories(supabase, userId, kind);
  return all.filter((c) => c.is_active !== false);
}

/** Toggle a category on/off. Requires the is_active column (Fase 9 migration). */
export async function toggleCategoryActive(
  supabase: SupabaseClient,
  kind: CategoryKind,
  categoryId: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from(tableFor(kind))
    .update({ is_active: isActive })
    .eq("id", categoryId);
  if (error) throw error;
}

export async function createCategory(
  supabase: SupabaseClient,
  userId: string,
  kind: CategoryKind,
  input: CreateCategoryInput
): Promise<Category> {
  const { data, error } = await supabase
    .from(tableFor(kind))
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon ?? null,
      is_default: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(
  supabase: SupabaseClient,
  kind: CategoryKind,
  categoryId: string,
  input: CreateCategoryInput
): Promise<Category> {
  const { data, error } = await supabase
    .from(tableFor(kind))
    .update({ name: input.name, icon: input.icon ?? null })
    .eq("id", categoryId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Category;
}

/** Number of transactions referencing a category (blocks deletion if > 0). */
export async function getCategoryUsageCount(
  supabase: SupabaseClient,
  kind: CategoryKind,
  categoryId: string
): Promise<number> {
  const table = kind === "income" ? "incomes" : "expenses";
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw error;
  return count ?? 0;
}

export async function deleteCategory(
  supabase: SupabaseClient,
  kind: CategoryKind,
  categoryId: string
): Promise<void> {
  const used = await getCategoryUsageCount(supabase, kind, categoryId);
  if (used > 0) {
    throw new Error(`Kategori ini masih digunakan oleh ${used} transaksi.`);
  }
  const { error } = await supabase.from(tableFor(kind)).delete().eq("id", categoryId);
  if (error) throw error;
}
