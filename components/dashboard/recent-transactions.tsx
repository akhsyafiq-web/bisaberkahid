"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { useRecentTransactions } from "@/hooks/use-dashboard";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { SectionHead } from "@/components/dashboard/section-head";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentTransactions() {
  const { data: feed, isLoading } = useRecentTransactions(5);

  return (
    <section>
      <SectionHead
        title="Transaksi terbaru"
        actionLabel="Lihat semua"
        actionHref="/transactions"
      />

      {isLoading ? (
        <Card className="divide-y divide-gray-100 px-4">
          {[0, 1, 2].map((i) => (
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
      ) : !feed || feed.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-gray-100 text-gray-400">
            <Receipt className="size-5" />
          </span>
          <p className="text-sm text-gray-500">Belum ada transaksi</p>
          <Link
            href="/transactions/new/expense"
            className="text-sm font-semibold text-brand-700"
          >
            Catat sekarang
          </Link>
        </Card>
      ) : (
        <Card className="divide-y divide-gray-100 px-4">
          {feed.map((item) => (
            <TransactionItem
              key={`${item.type}-${item.id}`}
              item={item}
              href={`/transactions/${item.id}`}
            />
          ))}
        </Card>
      )}
    </section>
  );
}
