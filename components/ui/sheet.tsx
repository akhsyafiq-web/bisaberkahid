"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Hide the default close (X) button. */
  hideClose?: boolean;
  className?: string;
}

/**
 * Mobile bottom sheet: scrim + slide-up panel, dismissable by tapping the scrim.
 * Respects the iOS safe area at the bottom.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  hideClose,
  className,
}: BottomSheetProps) {
  // Lock body scroll while open.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {/* Scrim */}
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/50 backdrop-blur-[2px]"
      />

      {/* Panel — constrained to the app width and centered */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "pointer-events-auto w-full max-w-[480px] rounded-t-3xl bg-white shadow-xl transition-transform duration-200",
            "pb-[max(20px,env(safe-area-inset-bottom))]",
            open ? "translate-y-0" : "translate-y-full",
            className
          )}
        >
          <div className="flex justify-center pt-3">
            <span className="h-1.5 w-10 rounded-full bg-gray-200" />
          </div>

          {(title || !hideClose) && (
            <div className="flex items-center justify-between px-5 pt-2">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {!hideClose && (
                <button
                  onClick={onClose}
                  aria-label="Tutup"
                  className="-mr-1 rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          )}

          <div className="px-5 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
