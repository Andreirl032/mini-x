import { create } from "zustand";

interface UiState {
  feedTick: number;
  bumpFeed: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  feedTick: 0,
  bumpFeed: () => set((state) => ({ feedTick: state.feedTick + 1 })),
}));
