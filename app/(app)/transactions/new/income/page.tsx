"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateField } from "@/components/ui/date-field";
import { CategorySelect } from "@/components/transactions/category-select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useActiveCategories } from "@/hooks/use-categories";
import { useWallets } from "@/hooks/use-wallets";
import { useCreateIncome, useUpdateIncome, useTransaction } from "@/hooks/use-transactions";
import { formatCurrency, toISODate, cn } from "@/lib/utils";

interface Initial {
  amount: number;
  categoryId: string | null;
  date: string;
  notes: string;
  alloc: Record<string, number>;
}

export default function NewIncomePage() {
  return (
    <Suspense fallback={<AppHeader title="Catat pemasukan" showBack />}>
      <IncomeLoader />
    </Suspense>
  );
}

/** Waits for edit data (if any), then mounts the form with initial values. */
function IncomeLoader() {
  const editId = useSearchParams().get("edit");
  const { data: existing, isLoading } = useTransaction(editId ?? "");

  if (editId && isLoading) {
    return (
      <>
        <AppHeader title="Edit pemasukan" showBack />
        <div className="space-y-4 px-4 pt-5">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      </>
    );
  }

  const initial: Initial =
    existing && existing.type === "income"
      ? {
          amount: existing.amount,
          categoryId: existing.category_id,
          date: existing.date,
          notes: existing.notes ?? "",
          alloc: Object.fromEntries(
            existing.distributions
              .filter((d) => d.wallet?.type !== "default")
              .map((d) => [d.wallet_id, d.amount])
          ),
        }
      : { amount: 0, categoryId: null, date: toISODate(new Date()), notes: "", alloc: {} };

  return <IncomeForm editId={editId} initial={initial} />;
}

function IncomeForm({ editId, initial }: { editId: string | null; initial: Initial }) {
  const router = useRouter();
  const isEdit = !!editId;

  const { data: categories, isLoading: loadingCats } = useActiveCategories("income");
  const { data: wallets } = useWallets();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome(editId ?? "");

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState(initial.amount);
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId);
  const [date, setDate] = useState(initial.date);
  const [notes, setNotes] = useState(initial.notes);
  const [alloc, setAlloc] = useState<Record<string, number>>(initial.alloc);
  const [autoRemainder, setAutoRemainder] = useState(true);
  const [triedNext, setTriedNext] = useState(false);

  const budgetWallets = useMemo(
    () => (wallets ?? []).filter((w) => w.type !== "default"),
    [wallets]
  );

  const allocated = useMemo(
    () => Object.values(alloc).reduce((s, v) => s + (v || 0), 0),
    [alloc]
  );
  const remaining = amount - allocated;

  const step1Valid = amount > 0 && !!categoryId && !!date;
  const canSubmit =
    step1Valid && allocated <= amount && (autoRemainder || remaining === 0);

  const goNext = () => {
    setTriedNext(true);
    if (step1Valid) setStep(2);
  };

  const submit = async () => {
    const distributions = budgetWallets
      .map((w) => ({ wallet_id: w.id, amount: alloc[w.id] || 0 }))
      .filter((d) => d.amount > 0);
    const payload = {
      category_id: categoryId!,
      amount,
      date,
      notes: notes || null,
      distributions,
      autoRemainderToDefault: autoRemainder,
    };
    try {
      if (isEdit) {
        await updateIncome.mutateAsync(payload);
        toast.success("Pemasukan berhasil diperbarui!");
      } else {
        await createIncome.mutateAsync(payload);
        toast.success("Pemasukan berhasil dicatat! 🎉");
      }
      router.push("/transactions");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pemasukan");
    }
  };

  return (
    <>
      <AppHeader
        title={isEdit ? "Edit pemasukan" : step === 1 ? "Catat pemasukan" : "Distribusi dompet"}
        showBack
      />

      <div className="space-y-5 px-4 pt-5">
        {step === 1 ? (
          <>
            <div>
              <Label htmlFor="amount">Nominal</Label>
              <CurrencyInput
                id="amount"
                size="hero"
                value={amount}
                onChange={setAmount}
                aria-invalid={triedNext && amount <= 0}
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
                invalid={triedNext && !categoryId}
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

            <Button full size="lg" onClick={goNext}>
              Lanjut → distribusi dompet
            </Button>
          </>
        ) : (
          <>
            <Card
              className={cn(
                "p-4",
                remaining === 0
                  ? "bg-success-50"
                  : remaining < 0
                    ? "bg-error-50"
                    : "bg-gold-50"
              )}
            >
              <p className="text-sm text-gray-600">
                {remaining < 0 ? "Kelebihan alokasi" : "Belum dialokasikan"}
              </p>
              <p
                className={cn(
                  "amount text-2xl",
                  remaining === 0
                    ? "text-success-700"
                    : remaining < 0
                      ? "text-error-700"
                      : "text-gray-900"
                )}
              >
                {formatCurrency(Math.abs(remaining))}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                dari total {formatCurrency(amount)}
              </p>
            </Card>

            {budgetWallets.length === 0 ? (
              <p className="text-sm text-gray-500">
                Belum ada dompet bulanan/goals. Seluruh pemasukan akan masuk ke
                Dompet Besar.
              </p>
            ) : (
              <div className="space-y-3">
                {budgetWallets.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{w.name}</p>
                      <p className="text-xs text-gray-500">
                        Saldo {formatCurrency(w.current_balance)}
                      </p>
                    </div>
                    <div className="w-36">
                      <CurrencyInput
                        value={alloc[w.id] || 0}
                        onChange={(v) => setAlloc((a) => ({ ...a, [w.id]: v }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5">
              <input
                type="checkbox"
                checked={autoRemainder}
                onChange={(e) => setAutoRemainder(e.target.checked)}
                className="size-5 accent-brand-600"
              />
              <span className="text-sm text-gray-700">
                Sisa otomatis ke Dompet Besar
              </span>
            </label>

            {autoRemainder && remaining > 0 && (
              <p className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-800">
                Sisa {formatCurrency(remaining)} akan masuk ke Dompet Besar.
              </p>
            )}
            {!autoRemainder && remaining > 0 && (
              <p className="rounded-xl bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
                Masih ada {formatCurrency(remaining)} yang belum dialokasikan.
              </p>
            )}
            {remaining < 0 && (
              <p className="rounded-xl bg-error-50 px-3.5 py-2.5 text-sm text-error-700">
                Total alokasi melebihi nominal pemasukan.
              </p>
            )}

            <Button
              full
              size="lg"
              onClick={submit}
              disabled={!canSubmit}
              loading={createIncome.isPending || updateIncome.isPending}
            >
              {isEdit ? "Simpan perubahan" : "Simpan pemasukan"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
