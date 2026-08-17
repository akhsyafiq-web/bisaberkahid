"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/24 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Brand jade — primary actions
        primary:
          "bg-brand-600 text-white shadow-xs hover:bg-brand-700 active:bg-brand-800",
        // Neutral outline
        secondary:
          "border border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50",
        ghost: "text-brand-700 hover:bg-brand-50",
        // Barakah Gold — zakat / sadaqah / milestones ONLY
        gold: "bg-gold-500 text-white shadow-xs hover:bg-gold-600 active:bg-gold-700",
        // Destructive (validation/confirm-delete)
        danger:
          "border border-error-200 bg-white text-error-600 hover:bg-error-50",
        link: "text-brand-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px]",
        md: "h-11 px-[18px] text-[15px]",
        lg: "h-[52px] px-[22px] text-base",
        icon: "h-11 w-11",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", full: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, full, asChild = false, loading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, full, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
