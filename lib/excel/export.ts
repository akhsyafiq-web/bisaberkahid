import * as XLSX from "xlsx";
import { formatDate } from "@/lib/utils";
import type {
  IncomeWithDistributions,
  ExpenseWithSources,
  TransactionSummary,
  CategorySummary,
} from "@/types";

/** Build and download an .xlsx of transactions for a period. */
export function exportTransactionsToExcel(opts: {
  incomes: IncomeWithDistributions[];
  expenses: ExpenseWithSources[];
  summary: TransactionSummary;
  expenseBreakdown: CategorySummary[];
  filename: string;
}) {
  const { incomes, expenses, summary, expenseBreakdown, filename } = opts;

  const incomeRows = incomes.map((i) => ({
    Tanggal: formatDate(i.date, "yyyy-MM-dd"),
    Kategori: i.category?.name ?? "",
    Nominal: i.amount,
    Catatan: i.notes ?? "",
    "Distribusi Dompet": i.distributions
      .map((d) => `${d.wallet?.name ?? "?"}: ${d.amount}`)
      .join("; "),
  }));

  const expenseRows = expenses.map((e) => ({
    Tanggal: formatDate(e.date, "yyyy-MM-dd"),
    Kategori: e.category?.name ?? "",
    Nominal: e.amount,
    Catatan: e.notes ?? "",
    "Dompet Sumber": e.sources
      .map((s) => `${s.wallet?.name ?? "?"}: ${s.amount}`)
      .join("; "),
  }));

  const summaryRows = [
    { Ringkasan: "Total Pemasukan", Nilai: summary.totalIncome },
    { Ringkasan: "Total Pengeluaran", Nilai: summary.totalExpense },
    { Ringkasan: "Saldo Bersih", Nilai: summary.netBalance },
    { Ringkasan: "", Nilai: "" },
    { Ringkasan: "Pengeluaran per Kategori", Nilai: "" },
    ...expenseBreakdown.map((c) => ({ Ringkasan: c.name, Nilai: c.total_amount })),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows), "Pemasukan");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), "Pengeluaran");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Ringkasan");

  XLSX.writeFile(wb, filename);
}
