"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryFormSheet } from "@/components/categories/category-form-sheet";
import { toast } from "@/hooks/use-toast";
import {
  useCategories,
  useToggleCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { cn } from "@/lib/utils";
import type { Category, CategoryKind } from "@/types";

export default function CategoriesPage() {
  const [kind, setKind] = useState<CategoryKind>("expense");
  const { data: categories, isLoading } = useCategories(kind);
  const toggle = useToggleCategory(kind);
  const del = useDeleteCategory(kind);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const activeCount = useMemo(
    () => (categories ?? []).filter((c) => c.is_active !== false).length,
    [categories]
  );

  const onToggle = (c: Category, next: boolean) => {
    if (!next && activeCount <= 1) {
      toast.error("Minimal satu kategori harus aktif");
      return;
    }
    toggle.mutate(
      { id: c.id, isActive: next },
      {
        onError: () =>
          toast.error("Gagal mengubah kategori. Sudah jalankan migrasi is_active?"),
      }
    );
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del.mutateAsync(deleteTarget.id);
      toast.success("Kategori dihapus");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus kategori");
    } finally {
      setDeleteTarget(null);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setSheetOpen(true);
  };

  return (
    <>
      <AppHeader
        title="Kategori"
        showBack
        rightAction={
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />

      <div className="space-y-4 px-4 pt-4">
        <Segmented<CategoryKind>
          value={kind}
          onChange={setKind}
          options={[
            { value: "expense", label: "Pengeluaran" },
            { value: "income", label: "Pemasukan" },
          ]}
        />

        {isLoading ? (
          <Card className="divide-y divide-gray-100 px-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
            ))}
          </Card>
        ) : (
          <Card className="divide-y divide-gray-100 px-4">
            {(categories ?? []).map((c) => {
              const active = c.is_active !== false;
              return (
                <div key={c.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full bg-gray-100 text-lg",
                      !active && "opacity-40"
                    )}
                  >
                    {c.icon ?? "📦"}
                  </span>
                  <div className={cn("min-w-0 flex-1", !active && "opacity-50")}>
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-gray-900">{c.name}</p>
                      {c.is_default && <Badge variant="gray">Default</Badge>}
                    </div>
                  </div>

                  {!c.is_default && (
                    <>
                      <button
                        onClick={() => openEdit(c)}
                        aria-label="Edit kategori"
                        className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        aria-label="Hapus kategori"
                        className="grid size-8 place-items-center rounded-full text-gray-400 hover:bg-error-50 hover:text-error-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}

                  <Switch
                    checked={active}
                    onChange={(next) => onToggle(c, next)}
                    aria-label={`Aktifkan ${c.name}`}
                  />
                </div>
              );
            })}
          </Card>
        )}

        <p className="px-1 text-xs text-gray-400">
          Kategori nonaktif disembunyikan dari form transaksi, tapi riwayat lama
          tetap utuh. Kategori default tidak bisa diedit/dihapus, tapi bisa dinonaktifkan.
        </p>
      </div>

      <CategoryFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        kind={kind}
        editing={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus kategori?"
        description={`"${deleteTarget?.name}" akan dihapus. Kategori yang masih dipakai transaksi tidak bisa dihapus.`}
        confirmLabel="Ya, hapus"
        destructive
        loading={del.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
