"use client";

import { useAuthStore } from "@/stores/auth.store";

/** Current authenticated user's id (undefined until the session loads). */
export function useUserId(): string | undefined {
  return useAuthStore((s) => s.user?.id);
}
