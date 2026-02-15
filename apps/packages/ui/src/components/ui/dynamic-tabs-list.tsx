"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useDynamicTabsGap } from "../../hooks/use-dynamic-tabs-gap";
import { useIsMobile } from "../../hooks/use-mobile";
import { TabsList } from "./tabs";

export interface DynamicTabsListProps {
  children: ReactNode;
  /** Minimum gap between items in pixels. Default: 32 */
  minGap?: number;
  /** Horizontal padding to subtract from viewport width. Default: 32 */
  padding?: number;
  /** Additional className for the scroll container */
  scrollContainerClassName?: string;
  /** Additional className for the TabsList */
  tabsListClassName?: string;
  /** TabsList size - defaults to "sm" on mobile, "md" on desktop */
  size?: "sm" | "md" | "lg" | "xs" | null;
  /** TabsList variant. Default: "line" */
  variant?: "default" | "line" | "button" | null;
  /**
   * If true, dynamic gap calculation only applies on mobile.
   * On desktop, minGap is used as a fixed gap.
   * Default: true
   */
  mobileOnly?: boolean;
}

/**
 * A TabsList wrapper that automatically calculates dynamic gaps between tabs
 * to ensure partially visible tabs indicate scrollability.
 *
 * This component encapsulates all the logic needed for dynamic tab spacing:
 * - Uses ResizeObserver to detect container size changes
 * - Handles window resize events
 * - Calculates optimal gap spacing based on viewport
 * - By default, only applies on mobile (use mobileOnly={false} to enable on desktop)
 *
 * Usage:
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <DynamicTabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </DynamicTabsList>
 *   <TabsContent value="tab1">...</TabsContent>
 * </Tabs>
 * ```
 */
export function DynamicTabsList({
  children,
  minGap = 32,
  padding = 32,
  scrollContainerClassName = "",
  tabsListClassName = "",
  size,
  variant = "line",
  mobileOnly = true,
}: DynamicTabsListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Only use dynamic gap calculation when enabled (mobile or mobileOnly=false)
  const shouldUseDynamicGap = !mobileOnly || isMobile;

  const { gap: dynamicGap } = useDynamicTabsGap({
    containerRef: tabsListRef,
    scrollContainerRef,
    minGap,
    padding,
  });

  // Force re-calculation on window resize (only needed when dynamic gap is active)
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!shouldUseDynamicGap) return;

    const handleResize = () => setTick((t: number) => t + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [shouldUseDynamicGap]);

  // Use dynamic gap on mobile, minGap on desktop (when mobileOnly is true)
  const resolvedGap = shouldUseDynamicGap ? dynamicGap : minGap;

  // Determine size based on mobile or provided prop
  const resolvedSize = size ?? (isMobile ? "sm" : "md");

  // On desktop without dynamic behavior, render a simpler structure
  if (!shouldUseDynamicGap) {
    return (
      <TabsList
        className={`h-auto w-fit justify-start bg-transparent ${tabsListClassName}`.trim()}
        ref={tabsListRef}
        size={resolvedSize}
        style={{ gap: `${resolvedGap}px` }}
        variant={variant}
      >
        {children}
      </TabsList>
    );
  }

  return (
    <div
      className={`no-scrollbar w-full overflow-x-auto ${scrollContainerClassName}`.trim()}
      ref={scrollContainerRef}
    >
      <TabsList
        className={`h-auto w-fit justify-start gap-0 bg-transparent transition-all ${tabsListClassName}`.trim()}
        ref={tabsListRef}
        size={resolvedSize}
        style={{ gap: `${resolvedGap}px` }}
        variant={variant}
      >
        {children}
      </TabsList>
    </div>
  );
}
