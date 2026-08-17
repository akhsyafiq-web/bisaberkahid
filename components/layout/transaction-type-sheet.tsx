"use client";

import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui.store";

/**
 * Opens when the center FAB is tapped. Lets the user choose to record income
 * or an expense, then routes to the matching form.
 */
export function TransactionTypeSheet() {
  const router = useRouter();
  const { isBottomSheetOpen, activeBottomSheet, closeBottomSheet } = useUIStore();
  const open = isBottomSheetOpen && activeBottomSheet === "transactionType";

  const go = (path: string) => {
    closeBottomSheet();
    router.push(path);
  };

  return (
    <BottomSheet open={open} onClose={closeBottomSheet} title="Catat transaksi">
      <div className="space-y-3 pb-2">
        <ChoiceRow
          onClick={() => go("/transactions/new/income")}
          icon={<ArrowDownLeft className="size-6" />}
          tint="bg-success-50 text-success-600"
          label="Catat pemasukan"
          desc="Gaji, bisnis, atau pemasukan lain"
        />
        <ChoiceRow
          onClick={() => go("/transactions/new/expense")}
          icon={<ArrowUpRight className="size-6" />}
          tint="bg-gray-100 text-gray-700"
          label="Catat pengeluaran"
          desc="Belanja, tagihan, dan kebutuhan"
        />
      </div>
    </BottomSheet>
  );
}

function ChoiceRow({
  onClick,
  icon,
  tint,
  label,
  desc,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tint: string;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 active:scale-[0.99]"
    >
      <span className={`grid size-12 place-items-center rounded-xl ${tint}`}>{icon}</span>
      <span className="flex-1">
        <span className="block font-bold text-gray-900">{label}</span>
        <span className="block text-sm text-gray-500">{desc}</span>
      </span>
      <ChevronRight className="size-5 text-gray-400" />
    </button>
  );
}
