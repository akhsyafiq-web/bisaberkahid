"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

/** Sticky 56px header with optional back button and a right-side action slot. */
export function AppHeader({ title, showBack, rightAction, className }: AppHeaderProps) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md",
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="-ml-2 grid size-9 place-items-center rounded-full text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft className="size-6" />
        </button>
      )}
      <h1 className="flex-1 truncate text-[17px] font-bold text-gray-900">{title}</h1>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
}
