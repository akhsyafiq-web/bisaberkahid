import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

type Variant = "in" | "out" | "zakat" | "neutral";
type Size = "sm" | "md" | "lg" | "xl";

const colorByVariant: Record<Variant, string> = {
  in: "text-success-600", // money-in: green
  out: "text-gray-900", // expenses: neutral dark (never alarmist red)
  zakat: "text-gold-600", // zakat/sadaqah: gold
  neutral: "text-gray-900",
};

const sizeClass: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-[34px] leading-none",
};

export interface CurrencyDisplayProps {
  amount: number;
  variant?: Variant;
  size?: Size;
  /** Show a leading "+" for money-in. */
  signed?: boolean;
  className?: string;
}

/** Renders a Rupiah figure with brand money semantics. */
export function CurrencyDisplay({
  amount,
  variant = "neutral",
  size = "md",
  signed = false,
  className,
}: CurrencyDisplayProps) {
  const sign = signed && variant === "in" ? "+" : signed && variant === "out" ? "−" : "";
  return (
    <span
      className={cn("amount", colorByVariant[variant], sizeClass[size], className)}
    >
      {sign}
      {formatCurrency(amount)}
    </span>
  );
}
