"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateField } from "@/components/ui/date-field";
import { CategorySelect } from "@/components/transactions/category-select";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import {
  useCreateExpense,
  useUpdateExpense,
  useTransaction,
} from "@/hooks/use-transactions";
import { formatCurrency, toISODate, cn } from "@/lib/utils";

interface Initial {
  amount: number;
  categoryId: string | null;
  date: string;
  notes: string;
  sources: Record<string, number>;
  debtId: string | null;
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<AppHeader title="Catat pengeluaran" showBack />}>
      <ExpenseLoader />
    </Suspense>
  );
}

function ExpenseLoader() {
  const editId = useSearchParams().get("edit");
  const { data: existing, isLoading } = useTransaction(editId ?? "");

  if (editId && isLoading) {
    return (
      <>
        <AppHeader title="Edit pengeluaran" showBack />
        <div className="space-y-4 px-4 pt-5">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      </>
    );
  }

  const initial: Initial =
    existing && existing.type === "expense"
      ? {
          amount: existing.amount,
          categoryId: existing.category_id,
          date: existing.date,
          notes: existing.notes ?? "",
          sources: Object.fromEntries(existing.sources.map((s) => [s.wallet_id, s.amount])),
          debtId: existing.debt_id,
        }
      : {
          amount: 0,
          categoryId: null,
          date: toISODate(new Date()),
          notes: "",
          sources: {},
          debtId: null,
        };

  return <ExpenseForm editId={editId} initial={initial} />;
}

function ExpenseForm({ editId, initial }: { editId: string | null; initial: Initial }) {
  const router = useRouter();
  const isEdit = !!editId;

  const { data: categories, isLoading: loadingCats } = useCategories("expense");
  const { data: wallets } = useWallets();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(editId ?? "");

  const [amount, setAmount] = useState(initial.amount);
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId);
  const [date, setDate] = useState(initial.date);
  const [notes, setNotes] = useState(initial.notes);
  const [sources, setSources] = useState<Record<string, number>>(initial.sources);
  const [tried, setTried] = useState(false);

  const allWallets = wallets ?? [];
  const taken = useMemo(
    () => Object.values(sources).reduce((s, v) => s + (v || 0), 0),
    [sources]
  );
  const remaining = amount - taken;

  const overdraw = allWallets.some(
    (w) => (sources[w.id] ?? 0) > Number(w.current_balance)
  );
  const canSubmit =
    amount > 0 && !!categoryId && remaining === 0 && !overdraw && taken > 0;

  /** Auto-fill algorithm: fill the wallet with min(balance, remaining). */
  const toggleWallet = (walletId: string, balance: number) => {
    setSources((prev) => {
      const next = { ...prev };
      if (walletId in next) {
        delete next[walletId];
        return next;
      }
      const currentTaken = Object.entries(prev).reduce((s, [, v]) => s + (v || 0), 0);
      const need = Math.max(0, amount - currentTaken);
      next[walletId] = Math.min(balance, need);
      return next;
    });
  };

  const submit = async () => {
    const payload = {
      category_id: categoryId!,
      amount,
      date,
      notes: notes || null,
      debt_id: initial.debtId,
      sources: allWallets
        .map((w) => ({ wallet_id: w.id, amount: sources[w.id] || 0 }))
        .filter((s) => s.amount > 0),
    };
    try {
      if (isEdit) {
        await updateExpense.mutateAsync(payload);
        toast.success("Pengeluaran berhasil diperbarui!");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Pengeluaran berhasil dicatat!");
      }
      router.push("/transactions");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pengeluaran");
    }
  };

  return (
    <>
      <AppHeader title={isEdit ? "Edit pengeluaran" : "Catat pengeluaran"} showBack />

      <div className="space-y-5 px-4 pt-5">
        <div>
          <Label htmlFor="amount">Nominal</Label>
          <CurrencyInput
            id="amount"
            size="hero"
            value={amount}
            onChange={setAmount}
            aria-invalid={tried && amount <= 0}
            autoFocus
          />
        </div>

        <div>
          <Label>Kategori</Label>
          <CategorySelect
            categories={categories ?? []}
            loading={loadingCats}
            value={categoryId}
            onChange={setCategoryId}
            invalid={tried && !categoryId}
          />
        </div>

        <div>
          <Label htmlFor="date">Tanggal</Label>
          <DateField id="date" value={date} onChange={setDate} />
        </div>

        <div>
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea
            id="notes"
            maxLength={255}
            placeholder="Tambah keterangan…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Wallet sources */}
        <div>
          <Label>Sumber dompet</Label>
          <div
            className={cn(
              "mb-3 rounded-2xl p-4",
              remaining === 0 ? "bg-success-50" : "bg-warning-50"
            )}
          >
            {remaining === 0 ? (
              <p className="flex items-center gap-2 font-semibold text-success-700">
                <Check className="size-5" /> Semua terpenuhi
              </p>
            ) : (
              <>
                <p className="text-sm text-warning-700">Belum terpenuhi</p>
                <p className="amount text-2xl text-warning-700">
                  {formatCurrency(Math.max(0, remaining))}
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            {allWallets.map((w) => {
              const selected = w.id in sources;
              const balance = Number(w.current_balance);
              const insufficient = (sources[w.id] ?? 0) > balance;
              const emptyWallet = balance <= 0;
              return (
                <div
                  key={w.id}
                  className={cn(
                    "rounded-2xl border bg-white p-3",
                    selected ? "border-brand-300" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={emptyWallet && !selected}
                      onClick={() => toggleWallet(w.id, balance)}
                      aria-label={selected ? "Batalkan dompet" : "Pilih dompet"}
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md border",
                        selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-gray-300",
                        emptyWallet && !selected && "opacity-40"
                      )}
                    >
                      {selected && <Check className="size-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{w.name}</p>
                      <p className="text-xs text-gray-500">
                        Tersedia {formatCurrency(balance)}
                      </p>
                    </div>
                    {insufficient && <Badge variant="error">Tidak cukup</Badge>}
                  </div>
                  {selected && (
                    <div className="mt-3">
                      <CurrencyInput
                        value={sources[w.id] || 0}
                        onChange={(v) => setSources((s) => ({ ...s, [w.id]: v }))}
                        aria-invalid={insufficient}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Button
          full
          size="lg"
          onClick={() => {
            setTried(true);
            if (canSubmit) submit();
          }}
          disabled={!canSubmit}
          loading={createExpense.isPending || updateExpense.isPending}
        >
          {remaining > 0
            ? "Pilih sumber dompet dulu"
            : isEdit
              ? "Simpan perubahan"
              : "Simpan pengeluaran"}
        </Button>
      </div>
    </>
  );
}
