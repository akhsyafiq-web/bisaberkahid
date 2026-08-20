"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Database, LogOut, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth.store";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const email = useAuthStore((s) => s.user?.email) ?? "";
  const { profile, isLoading, updateProfile } = useProfile();
  const [name, setName] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const currentName = name ?? profile?.name ?? "";
  const dirty = name !== null && name.trim() !== (profile?.name ?? "");

  const save = async () => {
    if (currentName.trim().length < 2) {
      toast.error("Nama minimal 2 karakter");
      return;
    }
    try {
      await updateProfile.mutateAsync({ name: currentName.trim() });
      toast.success("Profil diperbarui");
      setName(null);
    } catch {
      toast.error("Gagal menyimpan profil");
    }
  };

  return (
    <>
      <AppHeader title="Pengaturan" showBack />

      <div className="space-y-5 px-4 pt-4">
        {/* Profile */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {getInitials(profile?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-gray-900">{profile?.name ?? "—"}</p>
                <p className="truncate text-sm text-gray-500">{email}</p>
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-11 rounded-lg" />
            ) : (
              <div>
                <Label htmlFor="name">Nama lengkap</Label>
                <Input
                  id="name"
                  value={currentName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} readOnly disabled />
            </div>

            <Button full onClick={save} disabled={!dirty} loading={updateProfile.isPending}>
              Simpan perubahan
            </Button>
          </CardContent>
        </Card>

        {/* Data & privacy */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Data & privasi
          </p>
          <Card className="overflow-hidden">
            <Link
              href="/settings/import-export"
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 hover:bg-gray-50"
            >
              <Database className="size-5 text-gray-500" />
              <span className="flex-1 font-medium text-gray-900">Import & Export data</span>
              <ChevronRight className="size-5 text-gray-300" />
            </Link>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <ShieldCheck className="size-5 text-gray-500" />
              <span className="flex-1 text-sm text-gray-500">
                Data kamu tersimpan aman di server terenkripsi
              </span>
            </div>
          </Card>
        </div>

        {/* About */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tentang
          </p>
          <Card>
            <CardContent className="text-sm text-gray-500">
              <p className="font-semibold text-gray-900">BisaBerkah v1.0.0</p>
              <p className="mt-0.5">Kelola uang, temukan berkah.</p>
            </CardContent>
          </Card>
        </div>

        <Button variant="danger" full onClick={() => setLogoutOpen(true)} className="mb-2">
          <LogOut className="size-4" /> Keluar dari akun
        </Button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari akun?"
        description="Kamu perlu masuk lagi untuk mengakses data keuanganmu."
        confirmLabel="Ya, keluar"
        destructive
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
