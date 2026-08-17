import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[8px] border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 shadow-xs transition-colors",
          "placeholder:text-gray-400",
          "focus-visible:border-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/24",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          "aria-[invalid=true]:border-error-500 aria-[invalid=true]:ring-error-500/20",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[88px] w-full rounded-[8px] border border-gray-300 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 shadow-xs transition-colors",
          "placeholder:text-gray-400",
          "focus-visible:border-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/24",
          "disabled:cursor-not-allowed disabled:bg-gray-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
