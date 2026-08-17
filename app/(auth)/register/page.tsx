"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Password tidak sama",
  });

type FormValues = z.infer<typeof schema>;

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Lemah", color: "bg-error-500" };
  if (score <= 2) return { score: 2, label: "Sedang", color: "bg-warning-500" };
  if (score === 3) return { score: 3, label: "Kuat", color: "bg-success-500" };
  return { score: 4, label: "Sangat kuat", color: "bg-brand-600" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch("password") ?? "";
  const strength = passwordStrength(password);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name } },
    });

    if (error) {
      const msg = /already registered|already exists/i.test(error.message)
        ? "Email ini sudah terdaftar. Coba masuk."
        : error.message;
      setServerError(msg);
      return;
    }

    toast.success("Akun berhasil dibuat! 🎉");
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-7 flex flex-col items-center text-center">
        <LogoMark size={56} />
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-gray-900">
          Buat akun baru
        </h1>
        <p className="mt-1 text-gray-500">Mulai catat keuanganmu hari ini.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Nama lengkap</Label>
          <Input
            id="name"
            placeholder="Nama kamu"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@kamu.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-colors",
                      i <= strength.score ? strength.color : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="w-20 text-right text-xs text-gray-500">{strength.label}</span>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirm">Konfirmasi password</Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Ulangi password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
          {errors.confirm && (
            <p className="mt-1.5 text-sm text-error-600">{errors.confirm.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">
            {serverError}
          </p>
        )}

        <Button type="submit" full size="lg" loading={isSubmitting}>
          Daftar sekarang
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-brand-700">
          Masuk
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-gray-400">
        Dengan mendaftar, kamu setuju dengan cara BisaBerkah menyimpan data
        keuanganmu secara aman.
      </p>
    </div>
  );
}
