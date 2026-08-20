"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, PartyPopper } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { DebtCard } from "@/components/debts/debt-card";
import { DebtPaymentSheet } from "@/components/debts/debt-payment-sheet";
import { useDebts } from "@/hooks/use-debts";
import { formatCurrency } from "@/lib/utils";
import type { Debt, DebtStatus } from "@/types";

export default function DebtsPage() {
  const [tab, setTab] = useState<DebtStatus>("active");
  const [payTarget, setPayTarget] = useState<Debt | null>(null);
  const { data: debts, isLoading } = useDebts(tab);
  const { data: allActive } = useDebts("active");

  const summary = useMemo(() => {
    const list = allActive ?? [];
    return {
      total: list.reduce((s, d) => s + d.total_amount, 0),
      paid: list.reduce((s, d) => s + d.paid_amount, 0),
      remaining: list.reduce((s, d) => s + d.remaining_amount, 0),
    };
  }, [allActive]);

  return (
    <>
      <AppHeader
        title="Hutang"
        showBack
        rightAction={
          <Button asChild size="sm">
            <Link href="/debts/new">
              <Plus className="size-4" /> Baru
            </Link>
          </Button>
        }
      />

      <div className="space-y-5 px-4 pt-4">
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="amount text-sm text-gray-900">{formatCurrency(summary.total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Dibayar</p>
              <p className="amount text-sm text-success-600">{formatCurrency(summary.paid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sisa</p>
              <p className="amount text-sm text-error-600">{formatCurrency(summary.remaining)}</p>
            </div>
          </div>
        </Card>

        <Segmented<DebtStatus>
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: "Aktif" },
            { value: "paid", label: "Lunas" },
          ]}
        />

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : !debts || debts.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-success-50 text-success-600">
              <PartyPopper className="size-7" />
            </span>
            <p className="text-sm text-gray-500">
              {tab === "active"
                ? "Alhamdulillah, tidak ada hutang aktif 🎉"
                : "Belum ada hutang yang lunas."}
            </p>
            {tab === "active" && (
              <Button asChild size="sm" variant="secondary">
                <Link href="/debts/new">Catat hutang</Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3 pb-2">
            {debts.map((d) => (
              <DebtCard key={d.id} debt={d} onPay={setPayTarget} />
            ))}
          </div>
        )}
      </div>

      <DebtPaymentSheet debt={payTarget} onClose={() => setPayTarget(null)} />
    </>
  );
}
