"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserId } from "@/hooks/use-user";
import { qk } from "@/lib/query-keys";
import {
  getWalletsWithStats,
  getWalletById,
  getTransactionsByWallet,
  createWallet,
  updateWallet,
  deleteWallet,
} from "@/lib/supabase/queries/wallets";
import type { WalletType, CreateWalletInput, UpdateWalletInput } from "@/types";

export function useWallets(type?: WalletType) {
  const userId = useUserId();
  return useQuery({
    queryKey: [...qk.wallets(userId), type ?? "all"],
    enabled: !!userId,
    queryFn: () => getWalletsWithStats(createClient(), userId!, type),
  });
}

export function useWallet(walletId: string) {
  return useQuery({
    queryKey: qk.wallet(walletId),
    enabled: !!walletId,
    queryFn: () => getWalletById(createClient(), walletId),
  });
}

export function useWalletTransactions(walletId: string) {
  return useQuery({
    queryKey: qk.walletTransactions(walletId),
    enabled: !!walletId,
    queryFn: () => getTransactionsByWallet(createClient(), walletId),
  });
}

export function useCreateWallet() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWalletInput) =>
      createWallet(createClient(), userId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets(userId) });
    },
  });
}

export function useUpdateWallet(walletId: string) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWalletInput) =>
      updateWallet(createClient(), walletId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets(userId) });
      queryClient.invalidateQueries({ queryKey: qk.wallet(walletId) });
    },
  });
}

export function useDeleteWallet() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) => deleteWallet(createClient(), walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.wallets(userId) });
    },
  });
}
