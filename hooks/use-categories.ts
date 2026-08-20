"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import {
  getCategories,
  getActiveCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@/lib/supabase/queries/categories";
import type { CategoryKind, CreateCategoryInput } from "@/types";

/** All categories (management page). */
export function useCategories(kind: CategoryKind) {
  const userId = useUserId();
  return useQuery({
    queryKey: qk.categories(userId, kind),
    enabled: !!userId,
    queryFn: () => getCategories(createClient(), userId!, kind),
  });
}

/** Only active categories (transaction forms). */
export function useActiveCategories(kind: CategoryKind) {
  const userId = useUserId();
  return useQuery({
    queryKey: [...qk.categories(userId, kind), "active"],
    enabled: !!userId,
    queryFn: () => getActiveCategories(createClient(), userId!, kind),
  });
}

function useInvalidateCategories(kind: CategoryKind) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: qk.categories(userId, kind) });
}

export function useCreateCategory(kind: CategoryKind) {
  const userId = useUserId();
  const invalidate = useInvalidateCategories(kind);
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      createCategory(createClient(), userId!, kind, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory(kind: CategoryKind) {
  const invalidate = useInvalidateCategories(kind);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateCategoryInput }) =>
      updateCategory(createClient(), kind, id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(kind: CategoryKind) {
  const invalidate = useInvalidateCategories(kind);
  return useMutation({
    mutationFn: (id: string) => deleteCategory(createClient(), kind, id),
    onSuccess: invalidate,
  });
}

export function useToggleCategory(kind: CategoryKind) {
  const invalidate = useInvalidateCategories(kind);
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategoryActive(createClient(), kind, id, isActive),
    onSuccess: invalidate,
  });
}
