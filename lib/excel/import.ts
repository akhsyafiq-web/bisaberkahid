import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/types";
import { createIncome, createExpense } from "@/lib/supabase/queries/transactions";

export interface ImportError {
  row: number;
  sheet: string;
  field: string;
  message: string;
}

export interface ParsedRow {
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  notes: string | null;
}

export interface ParseResult {
  incomes: ParsedRow[];
  expenses: ParsedRow[];
  errors: ImportError[];
}

const FIVE_YEARS_MS = 5 * 365 * 24 * 60 * 60 * 1000;

function normalizeDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  // Excel serial date number
  if (typeof raw === "number") {
    const d = XLSX.SSF.parse_date_code(raw);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(raw).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

function parseSheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  categories: Category[],
  result: { rows: ParsedRow[]; errors: ImportError[] }
) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
  const today = Date.now();

  rows.forEach((row, i) => {
    const rowNum = i + 2; // header is row 1
    const rawDate = row["Tanggal"];
    const rawCat = String(row["Kategori"] ?? "").trim();
    const rawAmount = row["Nominal"];
    const notes = String(row["Catatan"] ?? "").trim();

    // skip fully-empty rows
    if (!rawDate && !rawCat && !rawAmount) return;

    const date = normalizeDate(rawDate);
    if (!date) {
      result.errors.push({ row: rowNum, sheet: sheetName, field: "Tanggal", message: "Format tanggal tidak valid (YYYY-MM-DD)" });
      return;
    }
    const t = new Date(date).getTime();
    if (t > today || today - t > FIVE_YEARS_MS) {
      result.errors.push({ row: rowNum, sheet: sheetName, field: "Tanggal", message: "Tanggal di luar rentang wajar" });
      return;
    }

    const cat = catByName.get(rawCat.toLowerCase());
    if (!cat) {
      result.errors.push({ row: rowNum, sheet: sheetName, field: "Kategori", message: `Kategori "${rawCat}" tidak dikenal` });
      return;
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      result.errors.push({ row: rowNum, sheet: sheetName, field: "Nominal", message: "Nominal harus angka positif" });
      return;
    }

    result.rows.push({
      date,
      categoryId: cat.id,
      categoryName: cat.name,
      amount,
      notes: notes ? notes.slice(0, 255) : null,
    });
  });
}

export async function parseExcelFile(
  file: File,
  categories: { income: Category[]; expense: Category[] }
): Promise<ParseResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const inc = { rows: [] as ParsedRow[], errors: [] as ImportError[] };
  const exp = { rows: [] as ParsedRow[], errors: [] as ImportError[] };
  parseSheet(wb, "Pemasukan", categories.income, inc);
  parseSheet(wb, "Pengeluaran", categories.expense, exp);

  return { incomes: inc.rows, expenses: exp.rows, errors: [...inc.errors, ...exp.errors] };
}

/**
 * Import parsed rows: incomes route entirely to the default wallet, expenses
 * draw from the default wallet. Done via the atomic RPCs, one row at a time.
 */
export async function processImport(
  supabase: SupabaseClient,
  parsed: ParseResult,
  defaultWalletId: string
): Promise<{ imported: number; failed: number }> {
  let imported = 0;
  let failed = 0;

  for (const row of parsed.incomes) {
    try {
      await createIncome(supabase, {
        category_id: row.categoryId,
        amount: row.amount,
        date: row.date,
        notes: row.notes,
        distributions: [{ wallet_id: defaultWalletId, amount: row.amount }],
        autoRemainderToDefault: false,
      });
      imported++;
    } catch {
      failed++;
    }
  }

  for (const row of parsed.expenses) {
    try {
      await createExpense(supabase, {
        category_id: row.categoryId,
        amount: row.amount,
        date: row.date,
        notes: row.notes,
        debt_id: null,
        sources: [{ wallet_id: defaultWalletId, amount: row.amount }],
      });
      imported++;
    } catch {
      failed++;
    }
  }

  return { imported, failed };
}
