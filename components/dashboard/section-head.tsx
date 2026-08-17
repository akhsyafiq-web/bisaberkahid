import Link from "next/link";

export function SectionHead({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-bold text-gray-900">{title}</h2>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-sm font-semibold text-brand-700">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
