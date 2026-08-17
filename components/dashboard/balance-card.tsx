import { Eye, Sprout, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface BalanceCardProps {
  label?: string;
  total: number;
  income: number;
  expense: number;
}

/**
 * Hero balance card — Untitled UI "gradient-strip" credit-card motif re-skinned
 * in Berkah Green. money-in green, money-out neutral on the dark field.
 */
export function BalanceCard({
  label = "Total saldo",
  total,
  income,
  expense,
}: BalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-800 p-5 text-white shadow-brand">
      {/* diagonal sheen */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg,transparent 30%,rgba(34,185,129,.55) 46%,rgba(14,159,110,.30) 60%,transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full"
        style={{
          background: "radial-gradient(circle,rgba(79,211,160,.4),transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[15px] font-extrabold tracking-[-0.01em]">
            <Sprout className="size-5" /> BisaBerkah
          </div>
          <Eye className="size-[18px] opacity-85" />
        </div>

        <div className="mt-5 text-xs opacity-80">{label}</div>
        <div className="amount mt-0.5 text-[34px] leading-none">{formatCurrency(total)}</div>

        <div className="mt-4 flex gap-6">
          <div>
            <div className="flex items-center gap-1 text-[11px] opacity-80">
              <ArrowDownLeft className="size-3.5" /> Masuk
            </div>
            <div className="amount mt-0.5 text-sm">+{formatCurrency(income)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] opacity-80">
              <ArrowUpRight className="size-3.5" /> Keluar
            </div>
            <div className="amount mt-0.5 text-sm">−{formatCurrency(expense)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
