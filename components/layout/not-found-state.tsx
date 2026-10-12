import Link from "next/link";
import { SearchX } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

/** Shown when a detail page's record doesn't exist (deleted, wrong link, or failed to load). */
export function NotFoundState({
  title,
  message,
  backHref,
  backLabel,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <>
      <AppHeader title={title} showBack />
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-gray-100 text-gray-400">
          <SearchX className="size-7" />
        </span>
        <p className="max-w-xs text-sm text-gray-500">{message}</p>
        <Button asChild size="sm" variant="secondary">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </>
  );
}
