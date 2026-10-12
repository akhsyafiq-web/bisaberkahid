"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
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
  const [pickedWalletId, setPickedWalletId] = useState<string | null>(null);
  const walletId =
    pickedWalletId ?? wallets?.find((w) => w.type === "default")?.id ?? wallets?.[0]?.id ?? null;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { creditor_name: "", total_amount: 0, due_date: "", notes: "" },
  });

  const onSubmit = async (v: Values) => {
    if (asIncome && !walletId) {
      toast.error("Pilih dompet tujuan pemasukan dulu");
      return;
    }
    try {
      const res = await createDebt.mutateAsync({
        creditor_name: v.creditor_name,
        total_amount: v.total_amount,
        due_date: v.due_date || null,
        notes: v.notes || null,
        incomeWalletId: asIncome ? walletId : null,
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
                Uang hutang ini otomatis menambah saldo dompet yang kamu pilih.
              </span>
            </span>
          </label>

          {asIncome && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Masukkan ke dompet</p>
              {(wallets ?? []).map((w) => {
                const selected = w.id === walletId;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setPickedWalletId(w.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left",
                      selected ? "border-brand-300 bg-brand-25" : "border-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border",
                        selected ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300"
                      )}
                    >
                      {selected && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {w.name}
                      </span>
                      <span className="block text-xs text-gray-500">
                        Saldo {formatCurrency(Number(w.current_balance))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" full size="lg" loading={isSubmitting}>
          Simpan hutang
        </Button>
      </form>
    </>
  );
}
