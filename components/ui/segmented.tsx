"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Pill segmented control — brand-tinted active segment. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full gap-1 rounded-full bg-gray-100 p-1",
        className
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-brand-700 shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
