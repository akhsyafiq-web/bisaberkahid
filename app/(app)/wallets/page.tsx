"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { useWallets } from "@/hooks/use-wallets";
import { WalletCard } from "@/components/wallets/wallet-card";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { formatCurrency } from "@/lib/utils";
import type { WalletType } from "@/types";

type Filter = "all" | "monthly" | "goals";

export default function WalletsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: wallets, isLoading } = useWallets();

  const totalBalance = useMemo(
    () => (wallets ?? []).reduce((s, w) => s + Number(w.current_balance), 0),
    [wallets]
  );

  const filtered = useMemo(() => {
    if (!wallets) return [];
    if (filter === "all") return wallets;
    return wallets.filter((w) => w.type === (filter as WalletType));
  }, [wallets, filter]);

  const hasOnlyDefault =
    !isLoading && (wallets?.every((w) => w.type === "default") ?? false);

  return (
    <>
      <AppHeader
        title="Dompet"
        rightAction={
          <Button asChild size="sm">
            <Link href="/wallets/new">
              <Plus className="size-4" /> Baru
            </Link>
          </Button>
        }
      />

      <div className="space-y-5 px-4 pt-4">
        {/* Total balance */}
        <Card className="bg-brand-800 p-5 text-white shadow-brand">
          <p className="text-xs opacity-80">Total saldo semua dompet</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-8 w-40 bg-white/20" />
          ) : (
            <p className="amount mt-0.5 text-3xl">{formatCurrency(totalBalance)}</p>
          )}
        </Card>

        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "monthly", label: "Bulanan" },
            { value: "goals", label: "Goals" },
          ]}
        />

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onlyDefault={hasOnlyDefault} filter={filter} />
        ) : (
          <div className="space-y-3 pb-2">
            {filtered.map((w) => (
              <WalletCard key={w.id} wallet={w} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState({ onlyDefault, filter }: { onlyDefault: boolean; filter: Filter }) {
  const msg =
    filter === "monthly"
      ? "Belum ada dompet bulanan."
      : filter === "goals"
        ? "Belum ada dompet goals."
        : onlyDefault
          ? "Buat dompet untuk mulai mengatur budget dan tujuanmu."
          : "Belum ada dompet.";

  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <WalletIcon className="size-7" />
      </span>
      <p className="text-sm text-gray-500">{msg}</p>
      <Button asChild size="sm">
        <Link href="/wallets/new">
          <Plus className="size-4" /> Buat dompet
        </Link>
      </Button>
    </Card>
  );
}
