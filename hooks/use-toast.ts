"use client";

import { toast as sonner } from "sonner";

/**
 * Thin wrapper over Sonner with BisaBerkah's warm Indonesian defaults.
 * Import { toast } and call toast.success("...") etc.
 */
export const toast = {
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  info: (message: string) => sonner.message(message),
  loading: (message: string) => sonner.loading(message),
  dismiss: (id?: string | number) => sonner.dismiss(id),
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => sonner.promise(promise, msgs),
};

export function useToast() {
  return { toast };
}
