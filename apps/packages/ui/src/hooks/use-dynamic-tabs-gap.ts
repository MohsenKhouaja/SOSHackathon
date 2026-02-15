import { useCallback, useEffect, useRef, useState } from "react";

type UseDynamicTabsGapOptions = {
  /** Minimum gap between items in pixels */
  minGap: number;
  /** Ref to the container element that holds the items (used to measure children) */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Optional ref to the scroll container (used to get visible viewport width). If not provided, containerRef is used. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Optional horizontal padding to subtract from viewport width (e.g., 32 for px-4 on both sides) */
  padding?: number;
};

type UseDynamicTabsGapResult = {
  /** The calculated gap value in pixels */
  gap: number;
};

// Threshold to prevent infinite loops from tiny floating-point differences
const GAP_CHANGE_THRESHOLD = 1;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 50;
// Stability lock duration after a gap change (prevents immediate recalculation)
const STABILITY_LOCK_DURATION = 150;

/**
 * Hook that calculates a dynamic gap for horizontally laid out items.
 *
 * Behavior:
 * - If all items + gaps fit inside the container, the gap is calculated to evenly space items (space-between).
 * - If items overflow, the gap is adjusted so the first overflowing item is intersected around its middle (30%-70% visible).
 * - If that intersection condition can't be met for an item, we move to the next item and redistribute.
 */
export function useDynamicTabsGap({
  minGap,
  containerRef,
  scrollContainerRef,
  padding = 0,
}: UseDynamicTabsGapOptions): UseDynamicTabsGapResult {
  const [gap, setGap] = useState(minGap);
  // Use a ref to track the current gap value for comparison without triggering re-renders
  const currentGapRef = useRef(minGap);
  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stability lock ref - prevents recalculation immediately after a gap change
  const stabilityLockRef = useRef(false);
  // Pending recalculation flag - set when resize happens during stability lock
  const pendingRecalcRef = useRef(false);
  // Flag to track if we're currently calculating
  const isCalculatingRef = useRef(false);
  // Ref to store the calculation function to avoid circular dependencies
  const performCalculationRef = useRef<() => void>(() => {
    /* no-op placeholder */
  });

  // Helper function that only updates state if the gap changed significantly
  // This prevents infinite loops from tiny floating-point differences
  const updateGap = useCallback((newGap: number) => {
    // Round to avoid floating-point precision issues
    const roundedGap = Math.round(newGap * 10) / 10;

    // Only update if the change is significant enough
    if (Math.abs(roundedGap - currentGapRef.current) > GAP_CHANGE_THRESHOLD) {
      currentGapRef.current = roundedGap;
      setGap(roundedGap);

      // Enable stability lock to prevent immediate recalculation from our own gap change
      stabilityLockRef.current = true;
      setTimeout(() => {
        stabilityLockRef.current = false;
        // If a recalculation was requested during the lock, do it now
        if (pendingRecalcRef.current) {
          pendingRecalcRef.current = false;
          // Schedule after a microtask to ensure state has settled
          queueMicrotask(() => {
            if (debounceTimerRef.current !== null) {
              clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
              debounceTimerRef.current = null;
              // Call via ref to avoid dependency cycle
              performCalculationRef.current();
            }, DEBOUNCE_DELAY);
          });
        }
      }, STABILITY_LOCK_DURATION);
    }
  }, []);

  const performCalculation = useCallback(() => {
    // Prevent re-entrancy
    if (isCalculatingRef.current) {
      return;
    }

    const container = containerRef.current;
    const scrollContainer = scrollContainerRef?.current ?? container;
    if (!(container && scrollContainer)) {
      return;
    }

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) {
      return;
    }

    isCalculatingRef.current = true;

    try {
      // Use the scroll container's width as the visible viewport, minus padding
      const viewportWidth = scrollContainer.clientWidth - padding;
      const itemWidths = children.map((child) => child.offsetWidth);
      const totalItemsWidth = itemWidths.reduce((sum, w) => sum + w, 0);
      const gapCount = children.length - 1;

      // If there's only one item or no gaps needed
      if (gapCount <= 0) {
        updateGap(minGap);
        return;
      }

      // Check if items fit with minimum gap (space-between scenario)
      const totalWidthWithMinGap = totalItemsWidth + gapCount * minGap;

      if (totalWidthWithMinGap <= viewportWidth) {
        // Items fit - calculate gap for even spacing (space-between)
        const availableSpaceForGaps = viewportWidth - totalItemsWidth;
        const evenGap = availableSpaceForGaps / gapCount;
        updateGap(evenGap);
        return;
      }

      // Items overflow - find the right gap so first overflowing item is properly intersected
      let currentGap = minGap;
      let accumulatedWidth = 0;

      for (let i = 0; i < children.length; i++) {
        const itemWidth = itemWidths[i];

        // Guard against undefined (shouldn't happen, but satisfies TypeScript)
        if (itemWidth === undefined) {
          continue;
        }

        // Add gap before this item (except for the first one)
        if (i > 0) {
          accumulatedWidth += currentGap;
        }

        const itemStart = accumulatedWidth;
        const itemEnd = itemStart + itemWidth;

        // Check if this item overflows the container
        if (itemEnd > viewportWidth) {
          // This is the first overflowing item
          const visibleWidth = viewportWidth - itemStart;
          const visiblePercentage = visibleWidth / itemWidth;

          // Target: intersection should be between 30% and 70% of item width
          const minVisiblePercentage = 0.3;
          const maxVisiblePercentage = 0.7;

          if (
            visiblePercentage >= minVisiblePercentage &&
            visiblePercentage <= maxVisiblePercentage
          ) {
            // Current gap works - item is properly intersected
            updateGap(currentGap);
            return;
          }

          if (visiblePercentage < minVisiblePercentage) {
            // Too little of the item is visible - we need to decrease the gap
            // Calculate gap that would show exactly 30% of this item
            const targetVisibleWidth = itemWidth * minVisiblePercentage;
            const targetItemStart = viewportWidth - targetVisibleWidth;
            const precedingItemsWidth = itemWidths
              .slice(0, i)
              .reduce((sum, w) => sum + w, 0);
            const gapsBeforeThisItem = i;
            const requiredGap =
              (targetItemStart - precedingItemsWidth) / gapsBeforeThisItem;

            if (requiredGap >= minGap) {
              updateGap(requiredGap);
              return;
            }

            // Can't achieve 30% visibility with minGap constraint
            // Move to next item by adding this item's contribution to the gap
            currentGap += itemWidth / gapCount;
          } else {
            // More than 70% visible - we need to increase the gap
            // Calculate gap that would show exactly 70% of this item
            const targetVisibleWidth = itemWidth * maxVisiblePercentage;
            const targetItemStart = viewportWidth - targetVisibleWidth;
            const precedingItemsWidth = itemWidths
              .slice(0, i)
              .reduce((sum, w) => sum + w, 0);
            const gapsBeforeThisItem = i;
            const requiredGap =
              (targetItemStart - precedingItemsWidth) / gapsBeforeThisItem;

            updateGap(Math.max(requiredGap, minGap));
            return;
          }
        }

        accumulatedWidth += itemWidth;
      }

      // Fallback to minGap if we went through all items
      updateGap(currentGap);
    } finally {
      isCalculatingRef.current = false;
    }
  }, [containerRef, scrollContainerRef, minGap, padding, updateGap]);

  // Keep the ref updated with the latest function
  performCalculationRef.current = performCalculation;

  const calculateGap = useCallback(() => {
    // If stability lock is active, mark that we need to recalculate later
    if (stabilityLockRef.current) {
      pendingRecalcRef.current = true;
      return;
    }

    performCalculation();
  }, [performCalculation]);

  // Debounced version of calculateGap to batch rapid observer fires
  const debouncedCalculateGap = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      calculateGap();
    }, DEBOUNCE_DELAY);
  }, [calculateGap]);

  useEffect(() => {
    // Initial calculation (not debounced)
    performCalculation();

    const container = containerRef.current;
    const scrollContainer = scrollContainerRef?.current;
    if (!container) {
      return;
    }

    // Use ResizeObserver to recalculate on size changes (debounced)
    const resizeObserver = new ResizeObserver(() => {
      debouncedCalculateGap();
    });

    resizeObserver.observe(container);

    // Also observe scroll container if it's different from the items container
    if (scrollContainer && scrollContainer !== container) {
      resizeObserver.observe(scrollContainer);
    }

    // Window resize listener as a fallback for cases where ResizeObserver might miss
    const handleWindowResize = () => {
      debouncedCalculateGap();
    };
    window.addEventListener("resize", handleWindowResize);

    // MutationObserver for when children are added/removed (debounced)
    const mutationObserver = new MutationObserver(() => {
      debouncedCalculateGap();
    });

    mutationObserver.observe(container, { childList: true });

    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [
    performCalculation,
    debouncedCalculateGap,
    containerRef,
    scrollContainerRef,
  ]);

  return { gap };
}
