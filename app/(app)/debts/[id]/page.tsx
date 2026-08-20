"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Receipt } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DebtPaymentSheet } from "@/components/debts/debt-payment-sheet";
import { toast } from "@/hooks/use-toast";
import { useDebt, useDeleteDebt } from "@/hooks/use-debts";
import { formatCurrency, formatDate, formatRelativeDay } from "@/lib/utils";

export default function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: debt, isLoading } = useDebt(id);
  const del = useDeleteDebt();
  const [payOpen, setPayOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPaid = debt?.status === "paid";
  const progress =
    debt && debt.total_amount > 0
      ? Math.min(100, Math.round((debt.paid_amount / debt.total_amount) * 100))
      : 0;

  const onDelete = async () => {
    try {
      await del.mutateAsync(id);
      toast.success("Hutang berhasil dihapus");
      router.push("/debts");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus hutang");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <AppHeader
        title={debt?.creditor_name ?? "Hutang"}
        showBack
        rightAction={
          debt && debt.paid_amount === 0 ? (
            <button
              onClick={() => setConfirmOpen(true)}
              aria-label="Hapus hutang"
              className="grid size-9 place-items-center rounded-full text-error-600 hover:bg-error-50"
            >
              <Trash2 className="size-5" />
            </button>
          ) : null
        }
      />

      <div className="space-y-5 px-4 pt-4">
        {isLoading || !debt ? (
          <Skeleton className="h-44 rounded-2xl" />
        ) : (
          <>
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={isPaid ? "success" : "warning"}>
                    {isPaid ? "Lunas" : "Aktif"}
                  </Badge>
                  {debt.due_date && (
                    <span className="text-sm text-gray-500">
                      Jatuh tempo {formatDate(debt.due_date, "d MMM yyyy")}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="amount text-sm text-gray-900">
                      {formatCurrency(debt.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Terbayar</p>
                    <p className="amount text-sm text-success-600">
                      {formatCurrency(debt.paid_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sisa</p>
                    <p className="amount text-sm text-error-600">
                      {formatCurrency(debt.remaining_amount)}
                    </p>
                  </div>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${isPaid ? "bg-success-500" : "bg-brand-600"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {debt.notes && (
                  <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    {debt.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">History pembayaran</p>
              {debt.payments.length === 0 ? (
                <Card className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <span className="grid size-11 place-items-center rounded-full bg-gray-100 text-gray-400">
                    <Receipt className="size-5" />
                  </span>
                  <p className="text-sm text-gray-500">Belum ada pembayaran</p>
                </Card>
              ) : (
                <Card className="divide-y divide-gray-100 px-4">
                  {debt.payments
                    .slice()
                    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatRelativeDay(p.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.sources.map((s) => s.wallet?.name).filter(Boolean).join(", ") || "—"}
                          </p>
                        </div>
                        <span className="amount text-gray-900">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                </Card>
              )}
            </div>

            <div className="pb-2">
              {isPaid ? (
                <Button full size="lg" variant="secondary" disabled>
                  Hutang lunas ✅
                </Button>
              ) : (
                <Button full size="lg" onClick={() => setPayOpen(true)}>
                  Bayar hutang
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <DebtPaymentSheet debt={payOpen ? debt ?? null : null} onClose={() => setPayOpen(false)} />

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus hutang?"
        description="Hutang ini belum dibayar sama sekali, jadi aman dihapus."
        confirmLabel="Ya, hapus"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
