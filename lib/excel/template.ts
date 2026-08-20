import * as XLSX from "xlsx";
import { toISODate } from "@/lib/utils";

/** Generate and download the BisaBerkah import template (.xlsx). */
export function downloadBisaBerkahTemplate(categories: {
  income: string[];
  expense: string[];
}) {
  const today = toISODate(new Date());

  const incomeSheet = XLSX.utils.json_to_sheet([
    { Tanggal: today, Kategori: categories.income[0] ?? "Gaji", Nominal: 5000000, Catatan: "contoh — hapus baris ini" },
  ]);
  const expenseSheet = XLSX.utils.json_to_sheet([
    { Tanggal: today, Kategori: categories.expense[0] ?? "Makan & Minum", Nominal: 25000, Catatan: "contoh — hapus baris ini" },
  ]);

  const panduan = XLSX.utils.aoa_to_sheet([
    ["Panduan Import BisaBerkah"],
    [""],
    ["1. Isi sheet 'Pemasukan' dan 'Pengeluaran'."],
    ["2. Format Tanggal: YYYY-MM-DD (mis. 2026-08-21)."],
    ["3. Kolom Kategori harus PERSIS sama dengan daftar di bawah."],
    ["4. Nominal berupa angka positif, tanpa titik/koma (mis. 25000)."],
    ["5. Hapus baris contoh sebelum upload."],
    [""],
    ["Kategori Pemasukan yang valid:"],
    ...categories.income.map((c) => [c]),
    [""],
    ["Kategori Pengeluaran yang valid:"],
    ...categories.expense.map((c) => [c]),
  ]);

  incomeSheet["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 30 }];
  expenseSheet["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 30 }];
  panduan["!cols"] = [{ wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, incomeSheet, "Pemasukan");
  XLSX.utils.book_append_sheet(wb, expenseSheet, "Pengeluaran");
  XLSX.utils.book_append_sheet(wb, panduan, "Panduan");

  XLSX.writeFile(wb, "Template_BisaBerkah.xlsx");
}
