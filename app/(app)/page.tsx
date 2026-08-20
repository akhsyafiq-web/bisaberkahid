"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  HandCoins,
  Tag,
  Settings,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAuth } from "@/hooks/use-auth";
import { useMonthSummary, useTotalBalance } from "@/hooks/use-dashboard";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { WalletScroll } from "@/components/dashboard/wallet-scroll";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getInitials, formatDate } from "@/lib/utils";

export default function BerandaPage() {
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const fullName = (user?.user_metadata?.name as string | undefined) ?? "";
  const name = fullName.split(" ")[0] || "kamu";
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { data: total, isLoading: loadingBalance } = useTotalBalance();
  const { data: summary, isLoading: loadingSummary } = useMonthSummary();
  const loading = loadingBalance || loadingSummary;

  return (
    <div className="space-y-6 px-4 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-gray-900">
            Assalamu&apos;alaikum, {name}! 👋
          </h1>
        </div>
        <button
          onClick={() => setLogoutOpen(true)}
          aria-label="Keluar dari akun"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-gray-600 shadow-xs hover:bg-gray-50"
        >
          <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {getInitials(fullName)}
          </span>
          <LogOut className="size-4" />
        </button>
      </header>

      {loading ? (
        <Skeleton className="h-44 rounded-3xl" />
      ) : (
        <BalanceCard
          total={total ?? 0}
          income={summary?.totalIncome ?? 0}
          expense={summary?.totalExpense ?? 0}
        />
      )}

      <WalletScroll />

      <RecentTransactions />

      <div className="grid grid-cols-2 gap-3 pb-2">
        <QuickAction
          href="/transactions/new/income"
          icon={<ArrowDownLeft className="size-5" />}
          label="Catat pemasukan"
          tint="text-success-600"
        />
        <QuickAction
          href="/transactions/new/expense"
          icon={<ArrowUpRight className="size-5" />}
          label="Catat pengeluaran"
          tint="text-gray-700"
        />
      </div>

      <section className="pb-2">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Lainnya
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <MenuLink href="/debts" icon={<HandCoins className="size-5" />} label="Hutang" />
          <MenuLink href="/categories" icon={<Tag className="size-5" />} label="Kategori" />
          <MenuLink href="/settings" icon={<Settings className="size-5" />} label="Pengaturan" />
        </div>
      </section>

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari akun?"
        description="Kamu perlu masuk lagi untuk mengakses data keuanganmu."
        confirmLabel="Ya, keluar"
        destructive
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0 hover:bg-gray-50"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1 font-medium text-gray-900">{label}</span>
      <ChevronRight className="size-5 text-gray-300" />
    </Link>
  );
}

function QuickAction({
  href,
  icon,
  label,
  tint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition-colors hover:bg-gray-50"
    >
      <span className={tint}>{icon}</span>
      <span className="text-sm font-semibold text-gray-900">{label}</span>
    </Link>
  );
}
