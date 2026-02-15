import type { ReactNode } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidePanelStore = {
  // State
  isOpen: boolean;
  content: ReactNode | null;
  title?: string;
  description?: string;
  currentPath: string | null;

  // Persisted path states (only this is persisted to localStorage)
  pathStates: Record<string, boolean>;

  // Actions
  setContent: (
    content: ReactNode | null,
    title?: string,
    description?: string
  ) => void;
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
  clear: () => void;

  // Path-based initialization
  initializePath: (path: string, defaultOpen: boolean) => void;
};

export const useSidePanelStore = create<SidePanelStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      content: null,
      title: undefined,
      description: undefined,
      currentPath: null,
      pathStates: {},

      setContent: (content, title, description) => {
        set({ content, title, description });
      },

      setOpen: (isOpen) => {
        const { currentPath, pathStates } = get();
        // Save the state for the current path
        if (currentPath) {
          set({
            isOpen,
            pathStates: { ...pathStates, [currentPath]: isOpen },
          });
        } else {
          set({ isOpen });
        }
      },

      toggle: () => {
        const { isOpen, currentPath, pathStates } = get();
        const newIsOpen = !isOpen;
        // Save the toggled state for the current path
        if (currentPath) {
          set({
            isOpen: newIsOpen,
            pathStates: { ...pathStates, [currentPath]: newIsOpen },
          });
        } else {
          set({ isOpen: newIsOpen });
        }
      },

      clear: () => {
        // Clear content but don't clear pathStates (those are persisted)
        set({
          isOpen: false,
          content: null,
          title: undefined,
          description: undefined,
          currentPath: null,
        });
      },

      initializePath: (path, defaultOpen) => {
        const { pathStates } = get();
        // Use saved state for this path if it exists, otherwise use defaultOpen
        const savedState = pathStates[path];
        const shouldBeOpen = savedState !== undefined ? savedState : defaultOpen;

        set({
          currentPath: path,
          isOpen: shouldBeOpen,
        });
      },
    }),
    {
      name: "side-panel-state",
      // Only persist pathStates to localStorage
      partialize: (state) => ({ pathStates: state.pathStates }),
    }
  )
);
