"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, ArrowLeftRight, BarChart2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";

const TABS = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/wallets", icon: Wallet, label: "Dompet" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { href: "/reports", icon: BarChart2, label: "Laporan" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const openBottomSheet = useUIStore((s) => s.openBottomSheet);

  // Split tabs around the center FAB (2 + 2).
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div className="relative flex w-full max-w-[480px] items-end justify-between border-t border-gray-100 bg-white/92 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
        {left.map((t) => (
          <TabLink key={t.href} {...t} active={isActive(pathname, t.href)} />
        ))}

        {/* Center FAB */}
        <button
          onClick={() => openBottomSheet("transactionType")}
          aria-label="Tambah transaksi"
          className="mb-0.5 grid size-[54px] place-items-center rounded-full border-4 border-white bg-brand-600 text-white shadow-[0_8px_18px_-4px_rgba(7,131,90,0.5)] transition-transform active:scale-95"
        >
          <Plus className="size-6" strokeWidth={2.4} />
        </button>

        {right.map((t) => (
          <TabLink key={t.href} {...t} active={isActive(pathname, t.href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-14 flex-col items-center gap-1 text-[11px] font-semibold",
        active ? "text-brand-600" : "text-gray-400"
      )}
    >
      <Icon className="size-6" strokeWidth={active ? 2.2 : 2} />
      {label}
    </Link>
  );
}
