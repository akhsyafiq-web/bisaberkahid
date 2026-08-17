"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Receipt } from "lucide-react";
import { useWallet, useWalletTransactions, useDeleteWallet } from "@/hooks/use-wallets";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  formatRelativeDay,
  calculateGoalProgress,
} from "@/lib/utils";
import { WALLET_TYPE_LABEL } from "@/lib/constants";
import type { Wallet } from "@/types";

export default function WalletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: wallet, isLoading } = useWallet(id);
  const { data: txns, isLoading: loadingTxns } = useWalletTransactions(id);
  const deleteWallet = useDeleteWallet();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDefault = wallet?.type === "default";

  const onDelete = async () => {
    try {
      await deleteWallet.mutateAsync(id);
      toast.success("Dompet berhasil dihapus");
      router.push("/wallets");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus dompet");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <AppHeader
        title={wallet?.name ?? "Dompet"}
        showBack
        rightAction={
          wallet && !isDefault ? (
            <Link
              href={`/wallets/${id}/edit`}
              aria-label="Edit dompet"
              className="grid size-9 place-items-center rounded-full text-gray-600 hover:bg-gray-100"
            >
              <Pencil className="size-5" />
            </Link>
          ) : null
        }
      />

      <div className="space-y-5 px-4 pt-4">
        {isLoading || !wallet ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <StatsCard wallet={wallet} />
        )}

        <section>
          <h2 className="mb-3 text-[17px] font-bold text-gray-900">Transaksi</h2>
          {loadingTxns ? (
            <Card className="divide-y divide-gray-100 px-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </Card>
          ) : !txns || txns.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-gray-100 text-gray-400">
                <Receipt className="size-5" />
              </span>
              <p className="text-sm text-gray-500">Belum ada transaksi di dompet ini</p>
            </Card>
          ) : (
            <Card className="divide-y divide-gray-100 px-4">
              {txns.map((t) => (
                <div key={`${t.kind}-${t.id}`} className="flex items-center gap-3 py-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full text-lg ${
                      t.kind === "income" ? "bg-success-50" : "bg-gray-100"
                    }`}
                  >
                    {t.categoryIcon ?? (t.kind === "income" ? "💰" : "🧾")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {t.categoryName ?? (t.kind === "income" ? "Masuk" : "Keluar")}
                    </p>
                    <p className="text-[13px] text-gray-500">{formatRelativeDay(t.date)}</p>
                  </div>
                  <p
                    className={`amount text-[15px] ${
                      t.kind === "income" ? "text-success-600" : "text-gray-900"
                    }`}
                  >
                    {t.kind === "income" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </section>

        {wallet && !isDefault && (
          <Button
            variant="danger"
            full
            onClick={() => setConfirmOpen(true)}
            className="mb-2"
          >
            Hapus dompet
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus dompet?"
        description="Dompet akan dihapus. Riwayat transaksi yang sudah tercatat tidak ikut terhapus."
        confirmLabel="Ya, hapus"
        destructive
        loading={deleteWallet.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function StatsCard({ wallet }: { wallet: Wallet }) {
  if (wallet.type === "goals") return <GoalsStats wallet={wallet} />;
  if (wallet.type === "monthly") return <MonthlyStats wallet={wallet} />;
  return <DefaultStats wallet={wallet} />;
}

function MonthlyStats({ wallet }: { wallet: Wallet }) {
  const budget = wallet.monthly_budget ?? 0;
  const used = budget > 0 ? Math.round(((budget - wallet.current_balance) / budget) * 100) : 0;
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="gray">{WALLET_TYPE_LABEL.monthly}</Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500">Saldo saat ini</p>
          <p className="amount text-3xl text-gray-900">
            {formatCurrency(wallet.current_balance)}
          </p>
          <p className="mt-0.5 text-sm text-gray-400">
            dari budget {formatCurrency(budget)}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${Math.min(100, Math.max(0, 100 - used))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsStats({ wallet }: { wallet: Wallet }) {
  const target = wallet.goal_target ?? 0;
  const progress = calculateGoalProgress(wallet.current_balance, target);
  const totalMonths = wallet.goal_duration_months ?? 0;

  let monthsElapsed = 0;
  if (wallet.goal_start_date) {
    const start = new Date(wallet.goal_start_date);
    const now = new Date();
    monthsElapsed =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    monthsElapsed = Math.max(0, Math.min(totalMonths, monthsElapsed));
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="brand">{WALLET_TYPE_LABEL.goals}</Badge>
          {wallet.goal_end_date && (
            <span className="text-sm text-gray-500">
              Target {formatDate(wallet.goal_end_date, "MMM yyyy")}
            </span>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">Terkumpul</p>
          <p className="amount text-3xl text-gray-900">
            {formatCurrency(wallet.current_balance)}
          </p>
          <p className="mt-0.5 text-sm text-gray-400">dari {formatCurrency(target)}</p>
        </div>

        <div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-gray-500">
            <span>{progress}% tercapai</span>
            {totalMonths > 0 && (
              <span>
                Bulan ke-{monthsElapsed} dari {totalMonths}
              </span>
            )}
          </div>
        </div>

        {wallet.goal_monthly_target != null && (
          <p className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
            Sisihkan <b>{formatCurrency(wallet.goal_monthly_target)}</b> per bulan
            untuk mencapai tujuan tepat waktu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DefaultStats({ wallet }: { wallet: Wallet }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Badge variant="gray">{WALLET_TYPE_LABEL.default}</Badge>
        <div>
          <p className="text-sm text-gray-500">Saldo</p>
          <p className="amount text-3xl text-gray-900">
            {formatCurrency(wallet.current_balance)}
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Uang yang belum dialokasikan ke dompet manapun.
        </p>
      </CardContent>
    </Card>
  );
}
