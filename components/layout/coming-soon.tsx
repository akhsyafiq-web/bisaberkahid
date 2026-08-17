import { Hammer } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";

/** Placeholder for pages that later build phases will implement. */
export function ComingSoon({
  title,
  note,
  showBack,
}: {
  title: string;
  note?: string;
  showBack?: boolean;
}) {
  return (
    <>
      <AppHeader title={title} showBack={showBack} />
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Hammer className="size-7" />
        </span>
        <p className="font-bold text-gray-900">Sedang dibangun</p>
        <p className="max-w-xs text-sm text-gray-500">
          {note ?? "Halaman ini akan hadir di tahap pengembangan berikutnya."}
        </p>
      </div>
    </>
  );
}
