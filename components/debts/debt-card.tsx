import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Debt } from "@/types";

export function DebtCard({
  debt,
  onPay,
}: {
  debt: Debt;
  onPay?: (debt: Debt) => void;
}) {
  const isPaid = debt.status === "paid";
  const progress =
    debt.total_amount > 0
      ? Math.min(100, Math.round((debt.paid_amount / debt.total_amount) * 100))
      : 0;

  const daysLeft = debt.due_date
    ? differenceInCalendarDays(new Date(debt.due_date), new Date())
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <Link href={`/debts/${debt.id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="truncate font-bold text-gray-900">{debt.creditor_name}</p>
          <Badge variant={isPaid ? "success" : "warning"}>
            {isPaid ? "Lunas" : "Aktif"}
          </Badge>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="amount text-xl text-gray-900">
            {formatCurrency(debt.paid_amount)}
          </span>
          <span className="text-sm text-gray-400">/ {formatCurrency(debt.total_amount)}</span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn("h-full rounded-full", isPaid ? "bg-success-500" : "bg-brand-600")}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={cn("amount", isPaid ? "text-success-700" : "text-gray-900")}>
            Sisa {formatCurrency(debt.remaining_amount)}
          </span>
          {debt.due_date && !isPaid && (
            <span
              className={cn(
                "text-xs",
                daysLeft != null && daysLeft < 0
                  ? "text-error-600"
                  : daysLeft != null && daysLeft <= 7
                    ? "text-warning-600"
                    : "text-gray-500"
              )}
            >
              {daysLeft != null && daysLeft < 0
                ? `Telat ${Math.abs(daysLeft)} hari`
                : daysLeft === 0
                  ? "Jatuh tempo hari ini"
                  : `${daysLeft} hari lagi`}
              {" · "}
              {formatDate(debt.due_date, "d MMM yyyy")}
            </span>
          )}
        </div>
      </Link>

      {!isPaid && onPay && (
        <Button size="sm" full className="mt-3" onClick={() => onPay(debt)}>
          Bayar
        </Button>
      )}
    </div>
  );
}
