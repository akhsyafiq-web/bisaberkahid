"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { Category, CategoryKind } from "@/types";

const EMOJI: Record<CategoryKind, string[]> = {
  expense: ["🍽️", "🚗", "🏥", "📚", "🛒", "💡", "🎬", "🤲", "💳", "🏠", "🎓", "💊", "🧴", "✈️", "🎁", "📦"],
  income: ["💼", "🏪", "💻", "📈", "🎁", "🏦", "🤝", "💰", "🪙", "📦"],
};

export function CategoryFormSheet({
  open,
  onClose,
  kind,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  kind: CategoryKind;
  editing: Category | null;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? "Edit kategori" : "Tambah kategori"}>
      {/* Fresh mount per open/target → state initializes from `editing`, no effect. */}
      {open && (
        <CategoryFormBody
          key={editing?.id ?? "new"}
          kind={kind}
          editing={editing}
          onClose={onClose}
        />
      )}
    </BottomSheet>
  );
}

function CategoryFormBody({
  kind,
  editing,
  onClose,
}: {
  kind: CategoryKind;
  editing: Category | null;
  onClose: () => void;
}) {
  const create = useCreateCategory(kind);
  const update = useUpdateCategory(kind);
  const [icon, setIcon] = useState(editing?.icon ?? "📦");
  const [name, setName] = useState(editing?.name ?? "");

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error("Nama kategori minimal 2 karakter");
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, input: { name: name.trim(), icon } });
        toast.success("Kategori diperbarui");
      } else {
        await create.mutateAsync({ name: name.trim(), icon });
        toast.success("Kategori ditambahkan");
      }
      onClose();
    } catch {
      toast.error("Gagal menyimpan kategori");
    }
  };

  return (
    <div className="space-y-4 pb-2">
      <div>
        <Label>Ikon</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {EMOJI[kind].map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(e)}
              className={cn(
                "grid aspect-square place-items-center rounded-lg text-xl",
                icon === e ? "bg-brand-50 ring-2 ring-brand-300" : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <Input
          className="mt-2 text-center text-lg"
          maxLength={4}
          value={icon}
          onChange={(e) => setIcon(e.target.value || "📦")}
          aria-label="Emoji manual"
        />
      </div>

      <div>
        <Label htmlFor="cat-name">Nama kategori</Label>
        <Input
          id="cat-name"
          placeholder="mis. Kopi, Olahraga"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <p className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600">
        Tampil sebagai: <span className="text-lg">{icon}</span>{" "}
        <b className="text-gray-900">{name || "Nama kategori"}</b>
      </p>

      <Button full size="lg" onClick={submit} loading={create.isPending || update.isPending}>
        Simpan kategori
      </Button>
    </div>
  );
}
