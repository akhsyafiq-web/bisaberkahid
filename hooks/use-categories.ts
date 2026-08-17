"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import { getCategories } from "@/lib/supabase/queries/categories";
import type { CategoryKind } from "@/types";

export function useCategories(kind: CategoryKind) {
  const userId = useUserId();
  return useQuery({
    queryKey: qk.categories(userId, kind),
    enabled: !!userId,
    queryFn: () => getCategories(createClient(), userId!, kind),
  });
}
