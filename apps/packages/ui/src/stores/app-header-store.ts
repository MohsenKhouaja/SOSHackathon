import type { LucideIcon } from "lucide-react";
import { create } from "zustand";

export type HeaderVariant = "main" | "default" | "modal";
export type LeftButtonType = "back" | "x" | "none";

export interface HeaderAction {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
}

interface AppHeaderConfig {
  variant: HeaderVariant;
  title: string;
  subtitle?: string;
  leftButton?: LeftButtonType;
  onLeftClick?: () => void;
  onRightActionClick?: () => void;
  rightActions?: HeaderAction[];
}

interface AppHeaderState extends AppHeaderConfig {
  setHeader: (config: Partial<AppHeaderConfig>) => void;
  resetHeader: () => void;
}

export const useAppHeaderStore = create<AppHeaderState>((set) => ({
  variant: "default",
  title: "Lanci",
  subtitle: undefined,
  leftButton: undefined,
  rightActions: [],

  setHeader: (config) => set((state) => ({ ...state, ...config })),
  resetHeader: () =>
    set({
      variant: "default",
      title: "Lanci",
      subtitle: undefined,
      leftButton: undefined,
      rightActions: [],
    }),
}));
