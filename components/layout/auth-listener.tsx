"use client";

import { useAuth } from "@/hooks/use-auth";

/** Mounts the Supabase auth subscription so the store stays in sync. */
export function AuthListener() {
  useAuth();
  return null;
}
