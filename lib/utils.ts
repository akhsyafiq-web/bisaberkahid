import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*  Currency & numbers (Indonesian Rupiah)                                    */
/* -------------------------------------------------------------------------- */

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 1500000 -> "Rp1.500.000" (no space after Rp, dot thousands separators). */
export function formatCurrency(amount: number): string {
  // Intl renders "Rp 1.500.000"; the brand wants no space after Rp.
  return rupiah.format(Math.round(amount || 0)).replace(/\s/g, "");
}

/** Compact money for tight spaces: 12500000 -> "Rp12,5jt", 1200000000 -> "Rp1,2M". */
export function formatCurrencyCompact(amount: number): string {
  const n = Math.round(amount || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp${trimComma(abs / 1_000_000_000)}M`;
  if (abs >= 1_000_000) return `${sign}Rp${trimComma(abs / 1_000_000)}jt`;
  if (abs >= 1_000) return `${sign}Rp${trimComma(abs / 1_000)}rb`;
  return formatCurrency(n);
}

function trimComma(value: number): string {
  // One decimal, Indonesian comma separator, no trailing ",0".
  return value
    .toFixed(1)
    .replace(/\.0$/, "")
    .replace(".", ",");
}

/** Parse a user-typed currency string ("1.500.000" / "Rp 1.500.000") to a number. */
export function parseCurrency(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/* -------------------------------------------------------------------------- */
/*  Dates (Indonesian locale)                                                 */
/* -------------------------------------------------------------------------- */

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
} from "date-fns";
import { id } from "date-fns/locale";

/** "Minggu, 7 Juni 2026" by default. */
export function formatDate(date: string | Date, pattern = "EEEE, d MMMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: id });
}

/** Friendly relative label: "Hari ini", "Kemarin", else "5 Jun 2026". */
export function formatRelativeDay(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = differenceInCalendarDays(new Date(), d);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return format(d, "d MMM yyyy", { locale: id });
}

export function getStartOfMonth(date = new Date()): Date {
  return startOfMonth(date);
}
export function getEndOfMonth(date = new Date()): Date {
  return endOfMonth(date);
}

/** Days remaining in the current month (inclusive of today). */
export function getDaysUntilEndOfMonth(date = new Date()): number {
  return differenceInCalendarDays(endOfMonth(date), date);
}

export type Period = "today" | "week" | "month" | "year";

export function getDateRange(period: Period, ref = new Date()): { from: Date; to: Date } {
  switch (period) {
    case "today":
      return { from: startOfDay(ref), to: endOfDay(ref) };
    case "week":
      return {
        from: startOfWeek(ref, { weekStartsOn: 1 }),
        to: endOfWeek(ref, { weekStartsOn: 1 }),
      };
    case "year":
      return { from: startOfYear(ref), to: endOfYear(ref) };
    case "month":
    default:
      return { from: startOfMonth(ref), to: endOfMonth(ref) };
  }
}

/** ISO date (yyyy-MM-dd) for DB date columns / inputs. */
export function toISODate(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

/* -------------------------------------------------------------------------- */
/*  Goals                                                                     */
/* -------------------------------------------------------------------------- */

/** Progress percentage (0–100), clamped. */
export function calculateGoalProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

export function calculateGoalMonthlyTarget(total: number, months: number): number {
  if (!months || months <= 0) return total;
  return Math.ceil(total / months);
}

/* -------------------------------------------------------------------------- */
/*  Misc                                                                      */
/* -------------------------------------------------------------------------- */

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/** Initials for avatar fallback: "Naufal Syafiq" -> "NS". */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}
