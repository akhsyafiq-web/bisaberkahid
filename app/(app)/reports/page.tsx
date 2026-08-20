"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/reports/donut-chart";
import { CategoryTable } from "@/components/reports/category-table";
import { TrendBarChart } from "@/components/reports/bar-chart";
import { useReports } from "@/hooks/use-reports";
import { useWallets } from "@/hooks/use-wallets";
import { generateCategoryColors } from "@/lib/chart-colors";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { getIncomes, getExpenses } from "@/lib/supabase/queries/transactions";
import { exportTransactionsToExcel } from "@/lib/excel/export";
import { toast } from "@/hooks/use-toast";
import {
  cn,
  formatCurrency,
  formatDate,
  getDateRange,
  toISODate,
  type Period,
} from "@/lib/utils";

const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Hari ini" },
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan" },
  { value: "year", label: "Tahun" },
];

export default function ReportsPage() {
  const userId = useUserId();
  const [period, setPeriod] = useState<Period>("month");
  const [tableType, setTableType] = useState<"expense" | "income">("expense");
  const [exporting, setExporting] = useState(false);

  const { from, to } = useMemo(() => getDateRange(period), [period]);
  const { expense, income, trend } = useReports(period, from, to);
  const { data: wallets } = useWallets();

  const periodLabel = useMemo(() => {
    if (period === "today") return formatDate(from, "d MMMM yyyy");
    if (period === "year") return formatDate(from, "yyyy");
    if (period === "month") return formatDate(from, "MMMM yyyy");
    return `${formatDate(from, "d MMM")} – ${formatDate(to, "d MMM yyyy")}`;
  }, [period, from, to]);

  const expenseData = expense.data ?? [];
  const incomeData = income.data ?? [];
  const totalExpense = expenseData.reduce((s, c) => s + c.total_amount, 0);
  const totalIncome = incomeData.reduce((s, c) => s + c.total_amount, 0);
  const net = totalIncome - totalExpense;

  const colors = useMemo(
    () => generateCategoryColors([...expenseData, ...incomeData].map((c) => c.name)),
    [expenseData, incomeData]
  );

  // Top 6 for the donut, rest grouped as "Lainnya".
  const donutData = useMemo(() => {
    const top = expenseData.slice(0, 6).map((c) => ({
      name: c.name,
      value: c.total_amount,
      color: colors[c.name] ?? "#07835A",
    }));
    const rest = expenseData.slice(6).reduce((s, c) => s + c.total_amount, 0);
    if (rest > 0) top.push({ name: "Lainnya", value: rest, color: "#D0D5DD" });
    return top;
  }, [expenseData, colors]);

  const tableData = tableType === "expense" ? expenseData : incomeData;
  const loading = expense.isLoading || income.isLoading;

  const handleExport = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const supabase = createClient();
      const filters = { from: toISODate(from), to: toISODate(to) };
      const [incomes, expenses] = await Promise.all([
        getIncomes(supabase, userId, filters),
        getExpenses(supabase, userId, filters),
      ]);
      exportTransactionsToExcel({
        incomes,
        expenses,
        summary: { totalIncome, totalExpense, netBalance: net, from: filters.from, to: filters.to },
        expenseBreakdown: expenseData,
        filename: `BisaBerkah_${periodLabel.replace(/\s/g, "")}.xlsx`,
      });
      toast.success("Laporan diekspor ke Excel");
    } catch {
      toast.error("Gagal mengekspor laporan");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Laporan"
        rightAction={
          <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
            <Download className="size-4" /> Excel
          </Button>
        }
      />

      <div className="space-y-5 px-4 pt-4">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                period === p.value ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold text-gray-500">{periodLabel}</p>

        {/* Summary */}
        <Card>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Masuk</p>
              <p className="amount text-sm text-success-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Keluar</p>
              <p className="amount text-sm text-gray-900">{formatCurrency(totalExpense)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Selisih</p>
              <p className={cn("amount text-sm", net >= 0 ? "text-success-600" : "text-error-600")}>
                {formatCurrency(net)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Donut */}
        <Card>
          <CardContent>
            <h2 className="mb-2 font-bold text-gray-900">Distribusi pengeluaran</h2>
            {loading ? (
              <Skeleton className="h-[220px] rounded-xl" />
            ) : (
              <DonutChart data={donutData} totalLabel="Pengeluaran" totalValue={totalExpense} />
            )}
          </CardContent>
        </Card>

        {/* Category table */}
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-bold text-gray-900">Rincian kategori</h2>
              <div className="w-40">
                <Segmented<"expense" | "income">
                  value={tableType}
                  onChange={setTableType}
                  options={[
                    { value: "expense", label: "Keluar" },
                    { value: "income", label: "Masuk" },
                  ]}
                />
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : (
              <CategoryTable data={tableData} colors={colors} />
            )}
          </CardContent>
        </Card>

        {/* Trend (year) */}
        {period === "year" && (
          <Card>
            <CardContent>
              <h2 className="mb-2 font-bold text-gray-900">Tren 12 bulan</h2>
              {trend.isLoading ? (
                <Skeleton className="h-[200px] rounded-xl" />
              ) : (
                <TrendBarChart data={trend.data ?? []} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Wallet conditions */}
        <Card>
          <CardContent>
            <h2 className="mb-3 font-bold text-gray-900">Kondisi dompet</h2>
            <div className="space-y-3">
              {(wallets ?? []).map((w) => {
                const pct =
                  w.type === "goals"
                    ? (w.goalProgress ?? 0)
                    : w.type === "monthly"
                      ? (w.usagePercent ?? 0)
                      : null;
                return (
                  <div key={w.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{w.name}</span>
                      <span className="amount text-gray-900">
                        {formatCurrency(w.current_balance)}
                      </span>
                    </div>
                    {pct != null && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
