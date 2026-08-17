"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { toISODate } from "@/lib/utils";

export interface DateFieldProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  max?: string;
  id?: string;
  invalid?: boolean;
}

/** Native date input, styled to match the design system. Defaults max to today. */
export function DateField({ value, onChange, max, id, invalid }: DateFieldProps) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      max={max ?? toISODate(new Date())}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid}
      className={cn(
        "flex h-11 w-full rounded-[8px] border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 shadow-xs",
        "focus-visible:border-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/24",
        invalid && "border-error-500"
      )}
    />
  );
}
