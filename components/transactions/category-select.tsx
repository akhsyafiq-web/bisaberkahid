"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/sheet";
import type { Category } from "@/types";

export function CategorySelect({
  categories,
  value,
  onChange,
  loading,
  invalid,
}: {
  categories: Category[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-invalid={invalid}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-[8px] border border-gray-300 bg-white px-3.5 text-left text-[15px] shadow-xs",
          "focus-visible:border-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/24",
          invalid && "border-error-500"
        )}
      >
        {selected ? (
          <>
            <span className="text-lg">{selected.icon}</span>
            <span className="text-gray-900">{selected.name}</span>
          </>
        ) : (
          <span className="text-gray-400">
            {loading ? "Memuat kategori…" : "Pilih kategori"}
          </span>
        )}
        <ChevronDown className="ml-auto size-5 text-gray-400" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Pilih kategori">
        <div className="max-h-[55vh] space-y-1 overflow-y-auto pb-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-gray-50"
            >
              <span className="grid size-9 place-items-center rounded-full bg-gray-100 text-lg">
                {c.icon}
              </span>
              <span className="flex-1 font-medium text-gray-900">{c.name}</span>
              {c.id === value && <Check className="size-5 text-brand-600" />}
            </button>
          ))}

          <Link
            href="/categories"
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-brand-700 hover:bg-brand-50"
          >
            <span className="grid size-9 place-items-center rounded-full bg-brand-50">
              <Plus className="size-5" />
            </span>
            <span className="font-semibold">Tambah kategori baru</span>
          </Link>
        </div>
      </BottomSheet>
    </>
  );
}
