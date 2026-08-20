import { formatCurrency } from "@/lib/utils";
import type { CategorySummary } from "@/types";

export function CategoryTable({
  data,
  colors,
}: {
  data: CategorySummary[];
  colors: Record<string, string>;
}) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">Belum ada data</p>;
  }
  return (
    <div className="divide-y divide-gray-100">
      {data.map((c) => (
        <div key={c.category_id} className="flex items-center gap-3 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gray-100 text-lg">
            {c.icon ?? "📦"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate font-medium text-gray-900">{c.name}</p>
              <span className="amount text-sm text-gray-900">
                {formatCurrency(c.total_amount)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.percentage}%`,
                    background: colors[c.name] ?? "#07835A",
                  }}
                />
              </div>
              <span className="w-16 text-right text-xs text-gray-500">
                {c.percentage}% · {c.transaction_count}x
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
