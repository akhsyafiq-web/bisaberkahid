import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <div className="flex min-h-dvh justify-center bg-gray-50">
      <div className="flex w-full max-w-[480px] flex-col px-6 py-10">{children}</div>
    </div>
  );
}
