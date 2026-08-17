"use client";

import { use } from "react";
import { useWallet } from "@/hooks/use-wallets";
import { AppHeader } from "@/components/layout/app-header";
import { WalletForm } from "@/components/wallets/wallet-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditWalletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: wallet, isLoading } = useWallet(id);

  return (
    <>
      <AppHeader title="Edit dompet" showBack />
      <div className="px-4 pt-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        ) : !wallet ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Dompet tidak ditemukan.
          </p>
        ) : wallet.type === "default" ? (
          <p className="py-12 text-center text-sm text-gray-500">
            Dompet Besar tidak bisa diedit.
          </p>
        ) : (
          <WalletForm type={wallet.type} wallet={wallet} />
        )}
      </div>
    </>
  );
}
