import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, formatRelativeDay, truncateText } from "@/lib/utils";
import { ZAKAT_CATEGORY_NAME } from "@/lib/constants";
import type { TransactionFeedItem } from "@/types";

function walletSummary(item: TransactionFeedItem): string | null {
  const parts =
    item.type === "income"
      ? item.distributions.map((d) => d.wallet?.name).filter(Boolean)
      : item.sources.map((s) => s.wallet?.name).filter(Boolean);
  if (parts.length === 0) return null;
  return parts.length > 1 ? `${parts[0]} +${parts.length - 1}` : (parts[0] as string);
}

export function TransactionItem({
  item,
  href,
}: {
  item: TransactionFeedItem;
  href?: string;
}) {
  const isIncome = item.type === "income";
  const isZakat = !isIncome && item.category?.name === ZAKAT_CATEGORY_NAME;

  const tint = isIncome ? "bg-success-50" : isZakat ? "bg-gold-50" : "bg-gray-100";
  const amountColor = isIncome
    ? "text-success-600"
    : isZakat
      ? "text-gold-600"
      : "text-gray-900";
  const wallet = walletSummary(item);

  const body = (
    <div className="flex items-center gap-3 py-3">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-lg", tint)}>
        {item.category?.icon ?? (isIncome ? "💰" : "🧾")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">
          {item.category?.name ?? (isIncome ? "Pemasukan" : "Pengeluaran")}
        </p>
        <p className="truncate text-[13px] text-gray-500">
          {item.notes ? truncateText(item.notes, 28) : wallet ?? formatRelativeDay(item.date)}
          {item.notes && wallet ? ` · ${wallet}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("amount text-[15px]", amountColor)}>
          {isIncome ? "+" : "−"}
          {formatCurrency(item.amount)}
        </p>
        <p className="text-[11px] text-gray-400">{formatRelativeDay(item.date)}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-gray-50">
        {body}
      </Link>
    );
  }
  return body;
}
