"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import type { MonthlyTrendPoint } from "@/types";

export function TrendBarChart({ data }: { data: MonthlyTrendPoint[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#667085" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #EAECF0",
              fontSize: 12,
              fontFamily: "var(--font-jakarta)",
            }}
            formatter={(value, name) =>
              [
                formatCurrency(Number(value)),
                name === "income" ? "Masuk" : "Keluar",
              ] as [string, string]
            }
          />
          <Bar dataKey="income" fill="#079455" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="expense" fill="#98A2B3" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-[11px] text-gray-400">
        Hijau = pemasukan · Abu = pengeluaran · satuan {formatCurrencyCompact(1000000)}
      </p>
    </div>
  );
}
