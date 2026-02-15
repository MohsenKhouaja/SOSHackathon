"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useSidePanelStore } from "../stores/side-panel-store";
import { useIsMobileOrTablet } from "./use-mobile";

type UseSidePanelOptions = {
  defaultOpen?: boolean;
};

/**
 * Hook for managing side panel state at the page/component level.
 *
 * Features:
 * - Remembers user's open/close preference per path (persisted to localStorage)
 * - Auto-cleanup on unmount (navigation away clears content)
 * - First visit uses `defaultOpen`, subsequent visits use saved preference
 * - On mobile/tablet, `defaultOpen` is always false (drawer is closed by default)
 *
 * @example
 * ```tsx
 * const { toggle, setContent } = useSidePanel({ defaultOpen: true });
 *
 * // Set content on mount and when data changes
 * const content = useMemo(() => <MyContent data={data} />, [data]);
 * useEffect(() => {
 *   setContent(content, "Title");
 * }, [content, setContent]);
 * ```
 */
export function useSidePanel(options: UseSidePanelOptions = {}) {
  const location = useLocation();
  const path = location.pathname;
  const isMobileOrTablet = useIsMobileOrTablet();

  const { setContent, setOpen, clear, toggle, isOpen, initializePath } =
    useSidePanelStore();
  const initializedPathRef = useRef<string | null>(null);

  // On mobile/tablet, always default to closed
  const effectiveDefaultOpen = isMobileOrTablet
    ? false
    : (options.defaultOpen ?? false);

  // Initialize path state on mount - use useLayoutEffect to run before paint
  useLayoutEffect(() => {
    // Only initialize if this is a new path (prevents double initialization)
    if (initializedPathRef.current !== path) {
      initializePath(path, effectiveDefaultOpen);
      initializedPathRef.current = path;
    }
  }, [path, effectiveDefaultOpen, initializePath]);

  // Clear content on unmount (but preserve pathStates)
  useEffect(() => {
    return () => {
      clear();
      initializedPathRef.current = null;
    };
  }, [clear]);

  return {
    toggle,
    isOpen,
    setOpen,
    setContent,
  };
}
