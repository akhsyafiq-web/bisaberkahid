"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateField } from "@/components/ui/date-field";
import { toast } from "@/hooks/use-toast";
import { useCreateDebt } from "@/hooks/use-debts";
import { useWallets } from "@/hooks/use-wallets";
import { cn, formatCurrency } from "@/lib/utils";

const schema = z.object({
  creditor_name: z.string().min(2, "Nama minimal 2 karakter"),
  total_amount: z.number().positive("Nominal harus lebih dari Rp0"),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export default function NewDebtPage() {
  const router = useRouter();
  const createDebt = useCreateDebt();
  const { data: wallets } = useWallets();

  // Hutang biasanya berarti uang masuk, jadi default-nya dicatat sebagai pemasukan.
  const [asIncome, setAsIncome] = useState(true);
  const [alloc, setAlloc] = useState<Record<string, number>>({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { creditor_name: "", total_amount: 0, due_date: "", notes: "" },
  });

  const total = useWatch({ control, name: "total_amount" }) || 0;
  const budgetWallets = (wallets ?? []).filter((w) => w.type !== "default");
  const allocated = budgetWallets.reduce((s, w) => s + (alloc[w.id] || 0), 0);
  const remainder = total - allocated;
  const overAllocated = asIncome && remainder < 0;

  const onSubmit = async (v: Values) => {
    if (overAllocated) {
      toast.error("Total pembagian melebihi nominal hutang");
      return;
    }
    try {
      const res = await createDebt.mutateAsync({
        creditor_name: v.creditor_name,
        total_amount: v.total_amount,
        due_date: v.due_date || null,
        notes: v.notes || null,
        recordIncome: asIncome,
        incomeDistributions: budgetWallets.map((w) => ({
          wallet_id: w.id,
          amount: alloc[w.id] || 0,
        })),
      });
      if (res.incomeFailed) {
        toast.error("Hutang tersimpan, tapi pemasukannya gagal dicatat. Catat manual ya.");
      } else if (res.incomeRecorded) {
        toast.success("Hutang dicatat dan masuk sebagai pemasukan!");
      } else {
        toast.success("Hutang berhasil dicatat!");
      }
      router.push("/debts");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan hutang");
    }
  };

  return (
    <>
      <AppHeader title="Hutang baru" showBack />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pt-5">
        <div>
          <Label htmlFor="creditor_name">Nama pemberi hutang</Label>
          <Input
            id="creditor_name"
            placeholder="mis. Bank, teman, koperasi"
            aria-invalid={!!errors.creditor_name}
            {...register("creditor_name")}
          />
          {errors.creditor_name && (
            <p className="mt-1.5 text-sm text-error-600">{errors.creditor_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="total_amount">Total nominal hutang</Label>
          <Controller
            control={control}
            name="total_amount"
            render={({ field }) => (
              <CurrencyInput
                id="total_amount"
                value={field.value}
                onChange={field.onChange}
                aria-invalid={!!errors.total_amount}
              />
            )}
          />
          {errors.total_amount && (
            <p className="mt-1.5 text-sm text-error-600">{errors.total_amount.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="due_date">Jatuh tempo (opsional)</Label>
          <Controller
            control={control}
            name="due_date"
            render={({ field }) => (
              <DateField
                id="due_date"
                value={field.value || ""}
                allowFuture
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Textarea id="notes" maxLength={255} placeholder="Tambah keterangan…" {...register("notes")} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3.5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={asIncome}
              onChange={(e) => setAsIncome(e.target.checked)}
              className="mt-0.5 size-5 accent-brand-600"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900">
                Catat juga sebagai pemasukan
              </span>
              <span className="block text-xs text-gray-500">
                Uang hutang ini otomatis menambah saldo dompet; bisa dibagi ke beberapa dompet.
              </span>
            </span>
          </label>

          {asIncome && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Bagi ke dompet</p>
              {budgetWallets.map((w) => {
                const walletAlloc = alloc[w.id] || 0;
                const balance = Number(w.current_balance);
                return (
                  <div key={w.id} className="rounded-xl border border-gray-200 p-2.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{w.name}</p>
                        <p className="text-xs text-gray-500">
                          Saldo saat ini {formatCurrency(balance)}
                        </p>
                      </div>
                      <div className="w-36">
                        <CurrencyInput
                          value={walletAlloc}
                          onChange={(val) => setAlloc((a) => ({ ...a, [w.id]: val }))}
                        />
                      </div>
                    </div>
                    {walletAlloc > 0 && (
                      <p className="amount mt-1.5 text-xs text-success-600">
                        → Saldo jadi {formatCurrency(balance + walletAlloc)}
                      </p>
                    )}
                  </div>
                );
              })}

              <p
                className={cn(
                  "rounded-xl px-3.5 py-2.5 text-sm",
                  overAllocated ? "bg-error-50 text-error-700" : "bg-brand-50 text-brand-800"
                )}
              >
                {overAllocated
                  ? `Pembagian melebihi nominal hutang sebesar ${formatCurrency(-remainder)}.`
                  : budgetWallets.length === 0
                    ? "Seluruh nominal akan masuk ke Dompet Besar."
                    : `Sisa ${formatCurrency(remainder)} akan masuk ke Dompet Besar.`}
              </p>
            </div>
          )}
        </div>

        <Button type="submit" full size="lg" loading={isSubmitting} disabled={overAllocated}>
          Simpan hutang
        </Button>
      </form>
    </>
  );
}
