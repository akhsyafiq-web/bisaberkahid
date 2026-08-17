"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { parseCurrency } from "@/lib/utils";

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Large hero style (used at the top of transaction forms). */
  size?: "md" | "hero";
  className?: string;
  id?: string;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
}

const groups = new Intl.NumberFormat("id-ID");

/** Numeric money input that auto-formats to "1.500.000" with an Rp prefix. */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = "0", disabled, size = "md", className, id, autoFocus, ...aria }, ref) => {
    const display = value > 0 ? groups.format(value) : "";

    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseCurrency(e.target.value));
    };

    const hero = size === "hero";

    return (
      <div
        className={cn(
          "flex items-center rounded-[8px] border border-gray-300 bg-white shadow-xs transition-colors focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-600/24",
          disabled && "bg-gray-50",
          aria["aria-invalid"] && "border-error-500 focus-within:ring-error-500/20",
          hero ? "px-4 py-3" : "h-11 px-3.5",
          className
        )}
      >
        <span
          className={cn(
            "select-none font-semibold text-gray-400",
            hero ? "text-2xl" : "text-[15px]"
          )}
        >
          Rp
        </span>
        <input
          ref={ref}
          id={id}
          inputMode="numeric"
          autoFocus={autoFocus}
          disabled={disabled}
          value={display}
          onChange={handle}
          placeholder={placeholder}
          aria-invalid={aria["aria-invalid"]}
          className={cn(
            "amount w-full bg-transparent pl-2 text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400",
            hero ? "text-3xl" : "text-[15px]"
          )}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
