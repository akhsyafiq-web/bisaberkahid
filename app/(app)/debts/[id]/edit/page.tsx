"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppHeader } from "@/components/layout/app-header";
import { NotFoundState } from "@/components/layout/not-found-state";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DateField } from "@/components/ui/date-field";
import { toast } from "@/hooks/use-toast";
import { useDebt, useUpdateDebt } from "@/hooks/use-debts";
import { formatCurrency, toISODate } from "@/lib/utils";
import type { Debt } from "@/types";

export default function EditDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: debt, isLoading } = useDebt(id);

  if (!isLoading && !debt) {
    return (
      <NotFoundState
        title="Edit hutang"
        message="Catatan hutang ini tidak ditemukan atau sudah dihapus."
        backHref="/debts"
        backLabel="Lihat semua hutang"
      />
    );
  }

  return (
    <>
      <AppHeader title="Edit hutang" showBack />
      {isLoading || !debt ? (
        <div className="space-y-4 px-4 pt-5">
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      ) : (
        // Mounted only once the debt is loaded, so defaults come straight from it.
        <EditDebtForm debt={debt} />
      )}
    </>
  );
}

function EditDebtForm({ debt }: { debt: Debt }) {
  const router = useRouter();
  const updateDebt = useUpdateDebt(debt.id);

  const schema = z.object({
    creditor_name: z.string().min(2, "Nama minimal 2 karakter"),
    total_amount: z
      .number()
      .positive("Nominal harus lebih dari Rp0")
      .min(
        debt.paid_amount,
        `Tidak boleh lebih kecil dari yang sudah dibayar (${formatCurrency(debt.paid_amount)})`
      ),
    debt_date: z.string().min(1, "Tanggal hutang wajib diisi"),
    due_date: z.string().optional(),
    notes: z.string().optional(),
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      creditor_name: debt.creditor_name,
      total_amount: debt.total_amount,
      debt_date: debt.debt_date ?? toISODate(new Date(debt.created_at)),
      due_date: debt.due_date ?? "",
      notes: debt.notes ?? "",
    },
  });

  const onSubmit = async (v: Values) => {
    try {
      await updateDebt.mutateAsync({
        creditor_name: v.creditor_name,
        total_amount: v.total_amount,
        debt_date: v.debt_date,
        due_date: v.due_date || null,
        notes: v.notes || null,
      });
      toast.success("Hutang berhasil diperbarui!");
      router.push(`/debts/${debt.id}`);
      router.refresh();
    } catch (e) {
      const err = e as { code?: string; message?: string };
      toast.error(
        err.code === "PGRST204" || err.code === "42703"
          ? "Fitur hutang perlu diperbarui. Jalankan database/debt_features.sql di Supabase."
          : err.message || "Gagal menyimpan hutang"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pt-5">
      <div>
        <Label htmlFor="creditor_name">Nama pemberi hutang</Label>
        <Input
          id="creditor_name"
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
        {debt.income_id && (
          <p className="mt-1.5 text-xs text-gray-500">
            Hutang ini tercatat juga sebagai pemasukan &quot;Pinjaman&quot;. Mengubah nominal di
            sini tidak mengubah pemasukannya; edit pemasukan itu di halaman Transaksi bila perlu.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="debt_date">Tanggal hutang</Label>
        <Controller
          control={control}
          name="debt_date"
          render={({ field }) => (
            <DateField id="debt_date" value={field.value} onChange={field.onChange} />
          )}
        />
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
        <Textarea id="notes" maxLength={255} {...register("notes")} />
      </div>

      <Button type="submit" full size="lg" loading={isSubmitting}>
        Simpan perubahan
      </Button>
    </form>
  );
}
