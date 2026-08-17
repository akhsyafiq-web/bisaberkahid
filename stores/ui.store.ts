import { create } from "zustand";

export type BottomSheetKind = "transactionType" | "income" | "expense" | null;

interface UIState {
  isBottomSheetOpen: boolean;
  activeBottomSheet: BottomSheetKind;
  selectedTransactionId: string | null;
  openBottomSheet: (kind: Exclude<BottomSheetKind, null>) => void;
  closeBottomSheet: () => void;
  setActiveBottomSheet: (kind: BottomSheetKind) => void;
  setSelectedTransactionId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isBottomSheetOpen: false,
  activeBottomSheet: null,
  selectedTransactionId: null,
  openBottomSheet: (kind) => set({ isBottomSheetOpen: true, activeBottomSheet: kind }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false, activeBottomSheet: null }),
  setActiveBottomSheet: (activeBottomSheet) => set({ activeBottomSheet }),
  setSelectedTransactionId: (selectedTransactionId) => set({ selectedTransactionId }),
}));
