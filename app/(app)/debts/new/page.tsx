"use client";

import { useRouter } from "next/navigation";
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
import { toISODate } from "@/lib/utils";

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
    try {
      await createDebt.mutateAsync({
        creditor_name: v.creditor_name,
        total_amount: v.total_amount,
        due_date: v.due_date || null,
        notes: v.notes || null,
      });
      toast.success("Hutang berhasil dicatat!");
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

        <Button type="submit" full size="lg" loading={isSubmitting}>
          Simpan hutang
        </Button>
      </form>
    </>
  );
}
