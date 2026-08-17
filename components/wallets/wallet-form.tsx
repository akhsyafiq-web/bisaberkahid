"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useCreateWallet, useUpdateWallet } from "@/hooks/use-wallets";
import {
  formatCurrency,
  formatDate,
  calculateGoalMonthlyTarget,
} from "@/lib/utils";
import { GOAL_DURATION } from "@/lib/constants";
import type { Wallet, WalletType } from "@/types";

const monthlySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Maksimal 50 karakter"),
  monthly_budget: z.number().positive("Alokasi harus lebih dari Rp0"),
});

const goalsSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(50, "Maksimal 50 karakter"),
  goal_target: z.number().positive("Target harus lebih dari Rp0"),
  goal_duration_months: z
    .number()
    .int("Durasi harus bilangan bulat")
    .min(GOAL_DURATION.min, `Minimal ${GOAL_DURATION.min} bulan`)
    .max(GOAL_DURATION.max, `Maksimal ${GOAL_DURATION.max} bulan`),
});

type MonthlyValues = z.infer<typeof monthlySchema>;
type GoalsValues = z.infer<typeof goalsSchema>;

export function WalletForm({
  type,
  wallet,
}: {
  type: WalletType;
  wallet?: Wallet;
}) {
  if (type === "monthly") return <MonthlyForm wallet={wallet} />;
  return <GoalsForm wallet={wallet} />;
}

/* ------------------------------- Monthly -------------------------------- */

function MonthlyForm({ wallet }: { wallet?: Wallet }) {
  const router = useRouter();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet(wallet?.id ?? "");
  const isEdit = !!wallet;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MonthlyValues>({
    resolver: zodResolver(monthlySchema),
    defaultValues: {
      name: wallet?.name ?? "",
      monthly_budget: wallet?.monthly_budget ?? 0,
    },
  });

  const name = watch("name");
  const budget = watch("monthly_budget");

  const onSubmit = async (v: MonthlyValues) => {
    try {
      if (isEdit) {
        await updateWallet.mutateAsync({
          name: v.name,
          monthly_budget: v.monthly_budget,
        });
        toast.success("Dompet berhasil diperbarui!");
      } else {
        await createWallet.mutateAsync({
          type: "monthly",
          name: v.name,
          monthly_budget: v.monthly_budget,
        });
        toast.success("Dompet bulanan berhasil dibuat! 🎉");
      }
      router.push("/wallets");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan dompet. Coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <NameField register={register} error={errors.name?.message} />

      <div>
        <Label htmlFor="monthly_budget">Alokasi per bulan</Label>
        <Controller
          control={control}
          name="monthly_budget"
          render={({ field }) => (
            <CurrencyInput
              id="monthly_budget"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={!!errors.monthly_budget}
            />
          )}
        />
        {errors.monthly_budget && (
          <p className="mt-1.5 text-sm text-error-600">{errors.monthly_budget.message}</p>
        )}
      </div>

      {budget > 0 && (
        <Card className="bg-brand-50 p-3.5 text-sm text-brand-800">
          Dompet <b>{name || "ini"}</b> akan mendapatkan{" "}
          <b>{formatCurrency(budget)}</b> setiap awal bulan.
        </Card>
      )}

      <Button type="submit" full size="lg" loading={isSubmitting}>
        {isEdit ? "Simpan perubahan" : "Buat dompet"}
      </Button>
    </form>
  );
}

/* -------------------------------- Goals --------------------------------- */

function GoalsForm({ wallet }: { wallet?: Wallet }) {
  const router = useRouter();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet(wallet?.id ?? "");
  const isEdit = !!wallet;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GoalsValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      name: wallet?.name ?? "",
      goal_target: wallet?.goal_target ?? 0,
      goal_duration_months: wallet?.goal_duration_months ?? 12,
    },
  });

  const target = watch("goal_target");
  const months = watch("goal_duration_months");

  const preview = useMemo(() => {
    if (!target || !months || months < 1) return null;
    const perMonth = calculateGoalMonthlyTarget(target, months);
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    return { perMonth, end };
  }, [target, months]);

  const onSubmit = async (v: GoalsValues) => {
    try {
      if (isEdit) {
        await updateWallet.mutateAsync({
          name: v.name,
          goal_target: v.goal_target,
          goal_duration_months: v.goal_duration_months,
        });
        toast.success("Tujuan berhasil diperbarui!");
      } else {
        await createWallet.mutateAsync({
          type: "goals",
          name: v.name,
          goal_target: v.goal_target,
          goal_duration_months: v.goal_duration_months,
        });
        toast.success("Dompet tujuan berhasil dibuat! 🎯");
      }
      router.push("/wallets");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan dompet. Coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <NameField
        register={register}
        error={errors.name?.message}
        label="Nama tujuan"
        placeholder="Umroh, Dana Darurat, …"
      />

      <div>
        <Label htmlFor="goal_target">Target nominal</Label>
        <Controller
          control={control}
          name="goal_target"
          render={({ field }) => (
            <CurrencyInput
              id="goal_target"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={!!errors.goal_target}
            />
          )}
        />
        {errors.goal_target && (
          <p className="mt-1.5 text-sm text-error-600">{errors.goal_target.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="goal_duration_months">Durasi (bulan)</Label>
        <Input
          id="goal_duration_months"
          type="number"
          inputMode="numeric"
          min={GOAL_DURATION.min}
          max={GOAL_DURATION.max}
          aria-invalid={!!errors.goal_duration_months}
          {...register("goal_duration_months", { valueAsNumber: true })}
        />
        {errors.goal_duration_months && (
          <p className="mt-1.5 text-sm text-error-600">
            {errors.goal_duration_months.message}
          </p>
        )}
      </div>

      {preview && (
        <Card className="space-y-1 bg-brand-50 p-3.5 text-sm text-brand-800">
          <p>
            Target per bulan: <b>{formatCurrency(preview.perMonth)}</b>
          </p>
          <p>
            Estimasi selesai: <b>{formatDate(preview.end, "MMMM yyyy")}</b>
          </p>
        </Card>
      )}

      <Button type="submit" full size="lg" loading={isSubmitting}>
        {isEdit ? "Simpan perubahan" : "Buat dompet"}
      </Button>
    </form>
  );
}

/* ------------------------------- shared --------------------------------- */

function NameField({
  register,
  error,
  label = "Nama dompet",
  placeholder = "Makan, Listrik, …",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor="name">{label}</Label>
      <Input id="name" placeholder={placeholder} aria-invalid={!!error} {...register("name")} />
      {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
    </div>
  );
}
