"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useWallets } from "@/hooks/use-wallets";
import { WalletCard } from "@/components/wallets/wallet-card";
import { SectionHead } from "@/components/dashboard/section-head";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletScroll() {
  const { data: wallets, isLoading } = useWallets();

  return (
    <section>
      <SectionHead title="Dompet kamu" actionLabel="Lihat semua" actionHref="/wallets" />

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 min-w-[230px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {wallets?.map((w) => (
            <WalletCard key={w.id} wallet={w} compact />
          ))}
          <Link
            href="/wallets/new"
            className="flex min-w-[120px] snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:bg-gray-50"
          >
            <Plus className="size-5" />
            <span className="text-sm font-semibold">Dompet baru</span>
          </Link>
        </div>
      )}
    </section>
  );
}
