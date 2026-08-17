/* ============================================================================
   BisaBerkah — app-wide constants
   ============================================================================ */

export interface DefaultCategory {
  name: string;
  icon: string;
  is_default: true;
}

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "Gaji", icon: "💼", is_default: true },
  { name: "Bisnis", icon: "🏪", is_default: true },
  { name: "Freelance", icon: "💻", is_default: true },
  { name: "Investasi", icon: "📈", is_default: true },
  { name: "Hadiah", icon: "🎁", is_default: true },
  { name: "Lain-lain", icon: "📦", is_default: true },
];

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: "Makan & Minum", icon: "🍽️", is_default: true },
  { name: "Transportasi", icon: "🚗", is_default: true },
  { name: "Kesehatan", icon: "🏥", is_default: true },
  { name: "Pendidikan", icon: "📚", is_default: true },
  { name: "Belanja", icon: "🛒", is_default: true },
  { name: "Tagihan & Utilitas", icon: "💡", is_default: true },
  { name: "Hiburan", icon: "🎬", is_default: true },
  { name: "Sedekah & Zakat", icon: "🤲", is_default: true },
  { name: "Cicilan & Hutang", icon: "💳", is_default: true },
  { name: "Lain-lain", icon: "📦", is_default: true },
];

/** Name of the auto-created default ("big") wallet. */
export const DEFAULT_WALLET_NAME = "Dompet Besar";

/** Category name used when recording a debt payment. */
export const DEBT_CATEGORY_NAME = "Cicilan & Hutang";

/** Category that always renders with the gold zakat accent. */
export const ZAKAT_CATEGORY_NAME = "Sedekah & Zakat";

export const WALLET_TYPES = {
  monthly: "monthly",
  goals: "goals",
  default: "default",
} as const;

export type WalletType = (typeof WALLET_TYPES)[keyof typeof WALLET_TYPES];

export const WALLET_TYPE_LABEL: Record<WalletType, string> = {
  monthly: "Bulanan",
  goals: "Goals",
  default: "Tidak Dianggarkan",
};

export const DATE_FORMATS = {
  full: "EEEE, d MMMM yyyy", // Minggu, 7 Juni 2026
  short: "d MMM yyyy", // 7 Jun 2026
  monthYear: "MMMM yyyy", // Juni 2026
  iso: "yyyy-MM-dd",
} as const;

export const CURRENCY = {
  code: "IDR",
  symbol: "Rp",
  locale: "id-ID",
} as const;

/** Goal duration bounds, in months. */
export const GOAL_DURATION = { min: 1, max: 360 } as const;

/** Pagination size for transaction feeds. */
export const PAGE_SIZE = 20;
