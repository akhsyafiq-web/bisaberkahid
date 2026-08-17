/* ============================================================================
   BisaBerkah — TypeScript types mirroring the Supabase schema + derived shapes
   ============================================================================ */

export type WalletType = "monthly" | "goals" | "default";
export type DebtStatus = "active" | "paid";
export type CategoryKind = "income" | "expense";

/* -------------------------------------------------------------------------- */
/*  Database row types                                                        */
/* -------------------------------------------------------------------------- */

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

// income_categories and expense_categories share the same shape.
export type IncomeCategory = Category;
export type ExpenseCategory = Category;

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  current_balance: number;
  // monthly
  monthly_budget: number | null;
  budget_month: string | null; // yyyy-MM-01
  // goals
  goal_target: number | null;
  goal_duration_months: number | null;
  goal_monthly_target: number | null;
  goal_start_date: string | null;
  goal_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeDistribution {
  id: string;
  income_id: string;
  wallet_id: string;
  amount: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  date: string;
  notes: string | null;
  debt_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWalletSource {
  id: string;
  expense_id: string;
  wallet_id: string;
  amount: number;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  creditor_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number; // generated column
  due_date: string | null;
  notes: string | null;
  status: DebtStatus;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/*  Derived / joined types                                                    */
/* -------------------------------------------------------------------------- */

export interface WalletWithStats extends Wallet {
  /** monthly: spent this budget month. */
  spent?: number;
  /** monthly: spent / budget * 100. goals: balance / target * 100. */
  usagePercent?: number;
  /** goals: balance / target * 100. */
  goalProgress?: number;
  /** convenience: days left in the current month. */
  daysLeftInMonth?: number;
}

export interface DistributionWithWallet extends IncomeDistribution {
  wallet?: Pick<Wallet, "id" | "name" | "type">;
}

export interface SourceWithWallet extends ExpenseWalletSource {
  wallet?: Pick<Wallet, "id" | "name" | "type">;
}

export interface IncomeWithDistributions extends Income {
  category?: Category | null;
  distributions: DistributionWithWallet[];
}

export interface ExpenseWithSources extends Expense {
  category?: Category | null;
  sources: SourceWithWallet[];
}

export interface DebtWithPayments extends Debt {
  payments: ExpenseWithSources[];
}

/** Unified transaction feed item (income or expense). */
export type TransactionType = "income" | "expense";

export type TransactionFeedItem =
  | ({ type: "income" } & IncomeWithDistributions)
  | ({ type: "expense" } & ExpenseWithSources);

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  from: string;
  to: string;
}

export interface CategorySummary {
  category_id: string;
  name: string;
  icon: string | null;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface MonthlyTrendPoint {
  month: string; // "Jan", "Feb", …
  income: number;
  expense: number;
}

/* -------------------------------------------------------------------------- */
/*  Input types for mutations                                                 */
/* -------------------------------------------------------------------------- */

export interface DistributionInput {
  wallet_id: string;
  amount: number;
}

export interface CreateIncomeInput {
  category_id: string;
  amount: number;
  date: string;
  notes?: string | null;
  distributions: DistributionInput[];
  /** Route any unallocated remainder to the default wallet. */
  autoRemainderToDefault?: boolean;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;

export interface WalletSourceInput {
  wallet_id: string;
  amount: number;
}

export interface CreateExpenseInput {
  category_id: string;
  amount: number;
  date: string;
  notes?: string | null;
  debt_id?: string | null;
  sources: WalletSourceInput[];
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface CreateWalletInput {
  name: string;
  type: WalletType;
  icon?: string | null;
  monthly_budget?: number | null;
  goal_target?: number | null;
  goal_duration_months?: number | null;
}

export type UpdateWalletInput = Partial<CreateWalletInput> & { is_active?: boolean };

export interface CreateDebtInput {
  creditor_name: string;
  total_amount: number;
  due_date?: string | null;
  notes?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string | null;
}
