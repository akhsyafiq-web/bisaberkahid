"use client";

import { useRef, useState } from "react";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { toast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { useUserId } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { getDefaultWallet } from "@/lib/supabase/queries/wallets";
import { getIncomes, getExpenses } from "@/lib/supabase/queries/transactions";
import { getCategoryBreakdown } from "@/lib/supabase/queries/reports";
import { exportTransactionsToExcel } from "@/lib/excel/export";
import { downloadBisaBerkahTemplate } from "@/lib/excel/template";
import { parseExcelFile, processImport, type ParseResult } from "@/lib/excel/import";
import { formatCurrency, getStartOfMonth, getEndOfMonth } from "@/lib/utils";

type State = "idle" | "parsing" | "preview" | "importing" | "done";

export default function ImportExportPage() {
  const userId = useUserId();
  const { data: incomeCats } = useCategories("income");
  const { data: expenseCats } = useCategories("expense");
  const fileRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [tab, setTab] = useState<"in" | "out" | "err">("in");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null);
  const [fileName, setFileName] = useState("");

  const handleExport = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const supabase = createClient();
      const [incomes, expenses, breakdown] = await Promise.all([
        getIncomes(supabase, userId),
        getExpenses(supabase, userId),
        getCategoryBreakdown(supabase, userId, "expense", getStartOfMonth(new Date(2000, 0)), getEndOfMonth()),
      ]);
      const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
      const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
      exportTransactionsToExcel({
        incomes,
        expenses,
        summary: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, from: "", to: "" },
        expenseBreakdown: breakdown,
        filename: "BisaBerkah_Semua.xlsx",
      });
      toast.success("Data diekspor ke Excel");
    } catch {
      toast.error("Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!incomeCats || !expenseCats) return;
    setFileName(file.name);
    setState("parsing");
    try {
      const res = await parseExcelFile(file, { income: incomeCats, expense: expenseCats });
      setParsed(res);
      setState("preview");
    } catch {
      toast.error("Gagal membaca file");
      setState("idle");
    }
  };

  const doImport = async () => {
    if (!parsed || !userId) return;
    setState("importing");
    try {
      const supabase = createClient();
      const def = await getDefaultWallet(supabase, userId);
      if (!def) throw new Error("Dompet Besar tidak ditemukan");
      const r = await processImport(supabase, parsed, def.id);
      setResult(r);
      setState("done");
      toast.success(`${r.imported} transaksi diimpor`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mengimpor");
      setState("preview");
    }
  };

  const reset = () => {
    setParsed(null);
    setResult(null);
    setFileName("");
    setState("idle");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <AppHeader title="Import & Export data" showBack />

      <div className="space-y-5 px-4 pt-4">
        {/* Export */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-bold text-gray-900">Export data</h2>
            <p className="text-sm text-gray-500">
              Unduh semua transaksi ke Excel — sheet Pemasukan, Pengeluaran, dan Ringkasan.
            </p>
            <Button variant="secondary" onClick={handleExport} loading={exporting}>
              <Download className="size-4" /> Export Excel (.xlsx)
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-bold text-gray-900">Import dari Excel</h2>
            <p className="text-sm text-gray-500">
              Isi template lalu upload. Kategori harus sama persis; baris bermasalah dilewati.
            </p>

            <Button
              variant="ghost"
              onClick={() =>
                downloadBisaBerkahTemplate({
                  income: (incomeCats ?? []).map((c) => c.name),
                  expense: (expenseCats ?? []).map((c) => c.name),
                })
              }
            >
              <FileSpreadsheet className="size-4" /> Download template
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {state === "idle" && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-8 text-gray-500 hover:bg-gray-50"
              >
                <Upload className="size-6" />
                <span className="text-sm font-semibold">Pilih file .xlsx</span>
              </button>
            )}

            {state === "parsing" && (
              <p className="py-6 text-center text-sm text-gray-500">Membaca file…</p>
            )}

            {state === "preview" && parsed && (
              <div>
                <p className="mb-2 text-sm text-gray-600">{fileName}</p>
                <div className="mb-3">
                  <Segmented<"in" | "out" | "err">
                    value={tab}
                    onChange={setTab}
                    options={[
                      { value: "in", label: `Masuk (${parsed.incomes.length})` },
                      { value: "out", label: `Keluar (${parsed.expenses.length})` },
                      { value: "err", label: `Error (${parsed.errors.length})` },
                    ]}
                  />
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200">
                  {tab === "err" ? (
                    parsed.errors.length === 0 ? (
                      <p className="p-4 text-center text-sm text-gray-400">Tidak ada error 🎉</p>
                    ) : (
                      parsed.errors.slice(0, 50).map((e, i) => (
                        <div key={i} className="border-b border-gray-100 px-3 py-2 text-sm last:border-0">
                          <span className="font-medium text-error-600">
                            {e.sheet} baris {e.row}
                          </span>{" "}
                          · {e.field}: {e.message}
                        </div>
                      ))
                    )
                  ) : (
                    (tab === "in" ? parsed.incomes : parsed.expenses).slice(0, 50).map((r, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-0">
                        <span className="truncate text-gray-700">
                          {r.date} · {r.categoryName}
                        </span>
                        <span className="amount text-gray-900">{formatCurrency(r.amount)}</span>
                      </div>
                    ))
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {parsed.incomes.length + parsed.expenses.length} baris siap diimpor,{" "}
                  {parsed.errors.length} dilewati.
                </p>

                <div className="mt-3 flex gap-3">
                  <Button variant="secondary" full onClick={reset}>
                    Batalkan
                  </Button>
                  <Button
                    full
                    onClick={doImport}
                    disabled={parsed.incomes.length + parsed.expenses.length === 0}
                  >
                    Import ({parsed.incomes.length + parsed.expenses.length})
                  </Button>
                </div>
              </div>
            )}

            {state === "importing" && (
              <p className="py-6 text-center text-sm text-gray-500">Mengimpor data…</p>
            )}

            {state === "done" && result && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                {result.failed === 0 ? (
                  <CheckCircle2 className="size-10 text-success-600" />
                ) : (
                  <AlertTriangle className="size-10 text-warning-600" />
                )}
                <p className="font-semibold text-gray-900">
                  {result.imported} berhasil, {result.failed} gagal
                </p>
                <Button variant="secondary" onClick={reset}>
                  Selesai
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
