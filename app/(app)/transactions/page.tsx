"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { useTransactionFeed } from "@/hooks/use-transactions";
import {
  cn,
  formatCurrency,
  formatRelativeDay,
  getDateRange,
  toISODate,
  type Period,
} from "@/lib/utils";
import type { TransactionFeedItem } from "@/types";

type PeriodFilter = Period | "all";
type TypeFilter = "all" | "income" | "expense";

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan ini" },
  { value: "all", label: "Semua" },
];

export default function TransactionsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [type, setType] = useState<TypeFilter>("all");

  const range = useMemo(() => {
    if (period === "all") return {};
    const { from, to } = getDateRange(period);
    return { from: toISODate(from), to: toISODate(to) };
  }, [period]);

  const { data: feed, isLoading } = useTransactionFeed(range);

  const filtered = useMemo(
    () => (feed ?? []).filter((t) => type === "all" || t.type === type),
    [feed, type]
  );

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense };
  }, [filtered]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <>
      <AppHeader title="Transaksi" />

      <div className="space-y-4 px-4 pt-4">
        {/* Period chips */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                period === p.value
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Segmented<TypeFilter>
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "Semua" },
            { value: "income", label: "Pemasukan" },
            { value: "expense", label: "Pengeluaran" },
          ]}
        />

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs text-gray-500">Pemasukan</p>
            <p className="amount text-lg text-success-600">
              +{formatCurrency(totals.income)}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-gray-500">Pengeluaran</p>
            <p className="amount text-lg text-gray-900">
              −{formatCurrency(totals.expense)}
            </p>
          </Card>
        </div>

        {isLoading ? (
          <Card className="divide-y divide-gray-100 px-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Receipt className="size-7" />
            </span>
            <p className="text-sm text-gray-500">Belum ada transaksi di periode ini</p>
            <Button asChild size="sm">
              <Link href="/transactions/new/expense">Catat sekarang</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 pb-2">
            {groups.map(([label, items]) => (
              <div key={label}>
                <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {label}
                </p>
                <Card className="divide-y divide-gray-100 px-4">
                  {items.map((item) => (
                    <TransactionItem
                      key={`${item.type}-${item.id}`}
                      item={item}
                      href={`/transactions/${item.id}`}
                    />
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function groupByDay(items: TransactionFeedItem[]): [string, TransactionFeedItem[]][] {
  const map = new Map<string, TransactionFeedItem[]>();
  for (const item of items) {
    const label = formatRelativeDay(item.date);
    const arr = map.get(label) ?? [];
    arr.push(item);
    map.set(label, arr);
  }
  return [...map.entries()];
}
