"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { WalletForm } from "@/components/wallets/wallet-form";
import type { WalletType } from "@/types";

export default function NewWalletPage() {
  const [type, setType] = useState<"monthly" | "goals" | null>(null);

  return (
    <>
      <AppHeader title={type ? "Buat dompet" : "Pilih tipe dompet"} showBack />

      <div className="px-4 pt-5">
        {!type ? (
          <div className="space-y-3">
            <TypeChoice
              onClick={() => setType("monthly")}
              emoji="📅"
              title="Dompet bulanan"
              desc="Untuk pengeluaran rutin bulanan — Makan, Listrik, Transportasi"
            />
            <TypeChoice
              onClick={() => setType("goals")}
              emoji="🎯"
              title="Dompet goals (tabungan)"
              desc="Untuk menabung dengan tujuan — Umroh, Dana Darurat, Liburan"
            />
          </div>
        ) : (
          <WalletForm type={type as WalletType} />
        )}
      </div>
    </>
  );
}

function TypeChoice({
  onClick,
  emoji,
  title,
  desc,
}: {
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.99]"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">
        {emoji}
      </span>
      <span className="flex-1">
        <span className="block font-bold text-gray-900">{title}</span>
        <span className="block text-sm text-gray-500">{desc}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-gray-400" />
    </button>
  );
}
