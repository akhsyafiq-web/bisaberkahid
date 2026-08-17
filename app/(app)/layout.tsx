import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TransactionTypeSheet } from "@/components/layout/transaction-type-sheet";
import { AuthListener } from "@/components/layout/auth-listener";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-gray-50">
      <AuthListener />
      {/* Phone-width column centered on larger screens */}
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-gray-50 shadow-sm">
        <main className="flex-1 pb-28">{children}</main>
      </div>
      <BottomNav />
      <TransactionTypeSheet />
    </div>
  );
}
