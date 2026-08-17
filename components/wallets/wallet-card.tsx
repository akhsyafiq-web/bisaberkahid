import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { WalletWithStats } from "@/types";

function ProgressBar({ percent, tone }: { percent: number; tone: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={cn("h-full rounded-full transition-all", tone)}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function usageTone(percent: number): string {
  if (percent > 90) return "bg-error-500";
  if (percent >= 75) return "bg-warning-500";
  return "bg-brand-600";
}

export function WalletCard({
  wallet,
  compact,
}: {
  wallet: WalletWithStats;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/wallets/${wallet.id}`}
      className={cn(
        "block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50",
        compact && "min-w-[230px] snap-start"
      )}
    >
      {wallet.type === "monthly" && <MonthlyBody wallet={wallet} />}
      {wallet.type === "goals" && <GoalsBody wallet={wallet} />}
      {wallet.type === "default" && <DefaultBody wallet={wallet} />}
    </Link>
  );
}

function Header({
  icon,
  name,
  badge,
}: {
  icon: string;
  name: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gray-100 text-lg">
          {icon}
        </span>
        <span className="truncate font-bold text-gray-900">{name}</span>
      </div>
      {badge}
    </div>
  );
}

function MonthlyBody({ wallet }: { wallet: WalletWithStats }) {
  const budget = wallet.monthly_budget ?? 0;
  const usage = wallet.usagePercent ?? 0;
  return (
    <>
      <Header
        icon="📅"
        name={wallet.name}
        badge={<Badge variant="gray">Bulanan</Badge>}
      />
      <div className="flex items-baseline gap-1">
        <span className="amount text-xl text-gray-900">
          {formatCurrency(wallet.current_balance)}
        </span>
        <span className="text-sm text-gray-400">/ {formatCurrency(budget)}</span>
      </div>
      <div className="mt-3">
        <ProgressBar percent={usage} tone={usageTone(usage)} />
        <div className="mt-1.5 flex justify-between text-xs text-gray-500">
          <span>Terpakai {usage}%</span>
          {wallet.daysLeftInMonth != null && (
            <span>{wallet.daysLeftInMonth} hari lagi</span>
          )}
        </div>
      </div>
    </>
  );
}

function GoalsBody({ wallet }: { wallet: WalletWithStats }) {
  const target = wallet.goal_target ?? 0;
  const progress = wallet.goalProgress ?? 0;
  return (
    <>
      <Header
        icon="🎯"
        name={wallet.name}
        badge={<Badge variant="brand">Goals</Badge>}
      />
      <div className="flex items-baseline gap-1">
        <span className="amount text-xl text-gray-900">
          {formatCurrency(wallet.current_balance)}
        </span>
        <span className="text-sm text-gray-400">/ {formatCurrency(target)}</span>
      </div>
      <div className="mt-3">
        <ProgressBar percent={progress} tone="bg-brand-600" />
        <div className="mt-1.5 flex justify-between text-xs text-gray-500">
          <span>{progress}% terkumpul</span>
          {wallet.goal_end_date && (
            <span>Selesai {formatDate(wallet.goal_end_date, "MMM yyyy")}</span>
          )}
        </div>
      </div>
    </>
  );
}

function DefaultBody({ wallet }: { wallet: WalletWithStats }) {
  return (
    <>
      <Header
        icon="💰"
        name={wallet.name}
        badge={<Badge variant="gray">Tidak dianggarkan</Badge>}
      />
      <span className="amount text-xl text-gray-900">
        {formatCurrency(wallet.current_balance)}
      </span>
      <p className="mt-1 text-xs text-gray-500">
        Uang yang belum dialokasikan ke dompet manapun
      </p>
    </>
  );
}
