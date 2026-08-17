"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { useTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ZAKAT_CATEGORY_NAME } from "@/lib/constants";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: txn, isLoading } = useTransaction(id);
  const del = useDeleteTransaction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isIncome = txn?.type === "income";
  const isZakat = txn?.type === "expense" && txn.category?.name === ZAKAT_CATEGORY_NAME;
  const amountColor = isIncome
    ? "text-success-600"
    : isZakat
      ? "text-gold-600"
      : "text-gray-900";

  const editHref = txn
    ? `/transactions/new/${txn.type === "income" ? "income" : "expense"}?edit=${id}`
    : "#";

  const onDelete = async () => {
    if (!txn) return;
    try {
      await del.mutateAsync({ id, type: txn.type });
      toast.success("Transaksi berhasil dihapus");
      router.push("/transactions");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus transaksi");
    } finally {
      setConfirmOpen(false);
    }
  };

  const rows =
    txn?.type === "income"
      ? txn.distributions.map((d) => ({ name: d.wallet?.name ?? "Dompet", amount: d.amount }))
      : txn?.type === "expense"
        ? txn.sources.map((s) => ({ name: s.wallet?.name ?? "Dompet", amount: s.amount }))
        : [];

  return (
    <>
      <AppHeader
        title="Detail transaksi"
        showBack
        rightAction={
          txn ? (
            <button
              onClick={() => router.push(editHref)}
              aria-label="Edit transaksi"
              className="grid size-9 place-items-center rounded-full text-gray-600 hover:bg-gray-100"
            >
              <Pencil className="size-5" />
            </button>
          ) : null
        }
      />

      <div className="space-y-5 px-4 pt-4">
        {isLoading || !txn ? (
          <Skeleton className="h-52 rounded-2xl" />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-gray-100 text-3xl">
                  {txn.category?.icon ?? (isIncome ? "💰" : "🧾")}
                </span>
                <p className="text-gray-500">
                  {txn.category?.name ?? (isIncome ? "Pemasukan" : "Pengeluaran")}
                </p>
                <p className={cn("amount text-3xl", amountColor)}>
                  {isIncome ? "+" : "−"}
                  {formatCurrency(txn.amount)}
                </p>
                <p className="text-sm text-gray-500">{formatDate(txn.date)}</p>
                {txn.notes && (
                  <p className="mt-1 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {txn.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">
                {isIncome ? "Didistribusikan ke" : "Diambil dari"}
              </p>
              <Card className="divide-y divide-gray-100 px-4">
                {rows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="text-gray-900">{r.name}</span>
                    <span className="amount text-gray-900">{formatCurrency(r.amount)}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div className="flex gap-3 pb-2">
              <Button
                variant="secondary"
                full
                onClick={() => router.push(editHref)}
              >
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="danger" full onClick={() => setConfirmOpen(true)}>
                Hapus
              </Button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus transaksi?"
        description="Ini akan mengembalikan saldo dompet seperti semula. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, hapus"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
