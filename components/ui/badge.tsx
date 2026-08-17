import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        brand: "bg-brand-50 text-brand-700",
        gold: "bg-gold-50 text-gold-700",
        gray: "bg-gray-100 text-gray-700",
        success: "bg-success-50 text-success-700",
        warning: "bg-warning-50 text-warning-700",
        error: "bg-error-50 text-error-700",
        info: "bg-info-50 text-info-700",
      },
    },
    defaultVariants: { variant: "gray" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
