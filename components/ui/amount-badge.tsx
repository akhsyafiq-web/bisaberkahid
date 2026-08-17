import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { TransactionType } from "@/types";

export interface AmountBadgeProps {
  amount: number;
  type: TransactionType;
  className?: string;
}

/** Pill showing +/- nominal in a transaction list. */
export function AmountBadge({ amount, type, className }: AmountBadgeProps) {
  const isIncome = type === "income";
  return (
    <span
      className={cn(
        "amount inline-flex items-center rounded-full px-2.5 py-0.5 text-sm",
        isIncome ? "bg-success-50 text-success-700" : "bg-gray-100 text-gray-900",
        className
      )}
    >
      {isIncome ? "+" : "−"}
      {formatCurrency(amount)}
    </span>
  );
}
