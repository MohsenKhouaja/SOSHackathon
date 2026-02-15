/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <explanation> */
"use client";

import { cn } from "@repo/ui/lib/utils";
import {
  Activity,
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

/** A single snap point definition */
interface SnapPointDef {
  /** Height value */
  height: number;
  /** Unit for height: "vh" (viewport height) or "px" (pixels). Defaults to "px" */
  unit?: "vh" | "px";
}

export interface SwipeableDrawerProps {
  /** Content visible when drawer is collapsed (peek state) */
  peekContent: ReactNode;
  /** Content visible only when drawer is expanded */
  expandedContent?: ReactNode;

  // --- Legacy 2-point API (still fully supported) ---
  /** Height in pixels when collapsed (peek state) */
  collapsedHeight?: number;
  /** Height when expanded - can be in vh units (number 0-100) or pixels */
  expandedHeight?: number;
  /** Whether expandedHeight is in viewport height (vh) or pixels */
  expandedHeightUnit?: "vh" | "px";
  /** Whether the drawer starts expanded */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Callback when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;

  // --- Multi-snap-point API ---
  /**
   * Array of snap point definitions, from smallest to largest.
   * When provided, overrides collapsedHeight/expandedHeight.
   * Example: [{ height: 100, unit: "px" }, { height: 50, unit: "vh" }, { height: 90, unit: "vh" }]
   */
  snapPoints?: SnapPointDef[];
  /** Current snap point index (0-based, controlled) */
  snapIndex?: number;
  /** Default snap point index */
  defaultSnapIndex?: number;
  /** Callback when snap index changes */
  onSnapIndexChange?: (index: number) => void;

  // --- Common props ---
  /** Threshold in pixels to trigger snap after drag */
  snapThreshold?: number;
  /** Whether to show the drag handle */
  showHandle?: boolean;
  /** Custom drag handle element */
  customHandle?: ReactNode;
  /** Additional className for the drawer container */
  className?: string;
  /** Additional className for the content wrapper */
  contentClassName?: string;
  /** Whether to show overlay when expanded */
  showOverlay?: boolean;
  /** Overlay click closes drawer */
  closeOnOverlayClick?: boolean;
  /** Z-index for the drawer */
  zIndex?: number;
}

export interface SwipeableDrawerRef {
  /** Expand the drawer to the highest snap point */
  expand: () => void;
  /** Collapse the drawer to the lowest snap point */
  collapse: () => void;
  /** Toggle between collapsed and fully expanded */
  toggle: () => void;
  /** Get current expanded state (true if above the lowest snap point) */
  isExpanded: () => boolean;
  /** Go to a specific snap point by index */
  goToSnapPoint: (index: number) => void;
  /** Get current snap index */
  getSnapIndex: () => number;
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum velocity (px/ms) for a flick gesture to trigger snap */
const FLICK_VELOCITY_THRESHOLD = 0.4;
/** Minimum drag distance (px) before we consider it a drag vs a tap */
const DRAG_DEAD_ZONE = 8;
/** Spring-like transition for snapping */
const SNAP_TRANSITION = "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";

// ============================================================================
// Helpers
// ============================================================================

/** Convert a snap point definition to pixels */
function snapPointToPx(sp: SnapPointDef): number {
  if (sp.unit === "vh") {
    if (typeof window === "undefined") return (sp.height / 100) * 800;
    return window.innerHeight * (sp.height / 100);
  }
  return sp.height;
}

// ============================================================================
// Memoized Content Wrapper - Prevents unnecessary re-renders
// ============================================================================

const DrawerContent = memo(function DrawerContent({
  peekContent,
  expandedContent,
  isExpanded,
  contentClassName,
}: {
  peekContent: ReactNode;
  expandedContent?: ReactNode;
  isExpanded: boolean;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 pb-8",
        isExpanded ? "h-[calc(100%-20px)] overflow-y-auto" : "overflow-hidden",
        contentClassName
      )}
      data-slot="swipeable-drawer-content"
    >
      {/* Peek content - always visible */}
      {peekContent}

      {/* Expanded content - use Activity for optimal show/hide */}
      <Activity mode={isExpanded ? "visible" : "hidden"}>
        {expandedContent}
      </Activity>
    </div>
  );
});

// ============================================================================
// Component
// ============================================================================

export const SwipeableDrawer = forwardRef<
  SwipeableDrawerRef,
  SwipeableDrawerProps
>(
  (
    {
      peekContent,
      expandedContent,
      // Legacy 2-point API
      collapsedHeight = 100,
      expandedHeight = 50,
      expandedHeightUnit = "vh",
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      // Multi-snap-point API
      snapPoints: snapPointsProp,
      snapIndex: controlledSnapIndex,
      defaultSnapIndex,
      onSnapIndexChange,
      // Common
      snapThreshold: _snapThreshold = 50,
      showHandle = true,
      customHandle,
      className,
      contentClassName,
      showOverlay = false,
      closeOnOverlayClick = true,
      zIndex = 9999,
    },
    ref
  ) => {
    // ========================================================================
    // Build snap points (normalize legacy API into snap points array)
    // ========================================================================

    const snapPointDefs = useMemo((): SnapPointDef[] => {
      if (snapPointsProp && snapPointsProp.length >= 2) {
        return snapPointsProp;
      }
      // Legacy: 2 snap points from collapsedHeight / expandedHeight
      return [
        { height: collapsedHeight, unit: "px" },
        { height: expandedHeight, unit: expandedHeightUnit },
      ];
    }, [snapPointsProp, collapsedHeight, expandedHeight, expandedHeightUnit]);

    // ========================================================================
    // State: snap index
    // ========================================================================

    const resolveDefaultIndex = () => {
      if (defaultSnapIndex !== undefined) return defaultSnapIndex;
      // Legacy: map defaultExpanded boolean
      return defaultExpanded ? snapPointDefs.length - 1 : 0;
    };

    const isIndexControlled =
      controlledSnapIndex !== undefined || controlledExpanded !== undefined;
    const [internalSnapIndex, setInternalSnapIndex] =
      useState(resolveDefaultIndex);

    // Resolve the current index from controlled props
    const currentSnapIndex = useMemo(() => {
      if (controlledSnapIndex !== undefined) return controlledSnapIndex;
      if (controlledExpanded !== undefined) {
        return controlledExpanded ? snapPointDefs.length - 1 : 0;
      }
      return internalSnapIndex;
    }, [
      controlledSnapIndex,
      controlledExpanded,
      internalSnapIndex,
      snapPointDefs.length,
    ]);

    // Derived: is expanded = above the lowest snap point
    const isExpanded = currentSnapIndex > 0;
    const maxIndex = snapPointDefs.length - 1;

    // ========================================================================
    // Refs (no re-renders during drag)
    // ========================================================================

    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef(0);

    // Drag state (all in refs to avoid renders)
    const dragState = useRef({
      active: false,
      startY: 0,
      currentOffset: 0,
      startTimestamp: 0,
      lastY: 0,
      lastTimestamp: 0,
      velocity: 0,
      didDrag: false,
      startedFromScrollableContent: false,
      scrollableElement: null as HTMLElement | null,
      contentScrollTop: 0,
    });

    // Cache snap point pixel values
    const snapPxRef = useRef<number[]>([]);
    // Track current snap index in a ref for use in non-React callbacks
    const snapIndexRef = useRef(currentSnapIndex);
    snapIndexRef.current = currentSnapIndex;

    // ========================================================================
    // Computed: snap points in pixels (recalculated on resize)
    // ========================================================================

    const computeSnapPx = useCallback((): number[] => {
      return snapPointDefs.map(snapPointToPx);
    }, [snapPointDefs]);

    useEffect(() => {
      const update = () => {
        snapPxRef.current = computeSnapPx();
      };
      update();
      window.addEventListener("resize", update, { passive: true });
      return () => window.removeEventListener("resize", update);
    }, [computeSnapPx]);

    const getSnapPx = useCallback((): number[] => {
      if (snapPxRef.current.length === 0) {
        snapPxRef.current = computeSnapPx();
      }
      return snapPxRef.current;
    }, [computeSnapPx]);

    /** Get the maximum height (tallest snap point) */
    const getMaxHeight = useCallback(() => {
      const px = getSnapPx();
      return px[px.length - 1] ?? 0;
    }, [getSnapPx]);

    /** Get translateY offset for a given snap index.
     *  translateY(0) = tallest snap, translateY(maxH - minH) = shortest snap */
    const getOffsetForIndex = useCallback(
      (index: number): number => {
        const px = getSnapPx();
        const maxH = px[px.length - 1] ?? 0;
        const targetH = px[index] ?? px[0] ?? 0;
        return maxH - targetH;
      },
      [getSnapPx]
    );

    // ========================================================================
    // State setter
    // ========================================================================

    const setSnapIndex = useCallback(
      (index: number) => {
        const clamped = Math.max(0, Math.min(maxIndex, index));
        if (!isIndexControlled) {
          setInternalSnapIndex(clamped);
        }
        onSnapIndexChange?.(clamped);
        // Fire legacy callback too
        onExpandedChange?.(clamped > 0);
      },
      [isIndexControlled, maxIndex, onSnapIndexChange, onExpandedChange]
    );

    // ========================================================================
    // DOM manipulation helpers (no React re-renders)
    // ========================================================================

    /** Apply a translateY to the drawer, clamped to valid range */
    const applyTransform = useCallback(
      (offsetY: number, withTransition = false) => {
        const drawer = drawerRef.current;
        if (!drawer) return;

        const maxH = getMaxHeight();
        const px = getSnapPx();
        const minH = px[0] ?? 0;
        const maxOffset = maxH - minH;
        // Clamp: 0 = fully expanded, maxOffset = fully collapsed
        const clamped = Math.max(0, Math.min(maxOffset, offsetY));

        if (withTransition) {
          drawer.style.transition = SNAP_TRANSITION;
        } else {
          drawer.style.transition = "none";
        }
        drawer.style.transform = `translateY(${clamped}px)`;

        // Update overlay opacity proportionally
        if (overlayRef.current && maxOffset > 0) {
          const progress = 1 - clamped / maxOffset;
          overlayRef.current.style.opacity = `${progress}`;
          overlayRef.current.style.pointerEvents =
            progress > 0.1 ? "auto" : "none";
        }
      },
      [getMaxHeight, getSnapPx]
    );

    /** Snap to a specific index with transition */
    const snapToIndex = useCallback(
      (index: number) => {
        const clamped = Math.max(0, Math.min(maxIndex, index));
        const targetOffset = getOffsetForIndex(clamped);
        applyTransform(targetOffset, true);

        if (clamped !== snapIndexRef.current) {
          setSnapIndex(clamped);
        }
      },
      [maxIndex, getOffsetForIndex, applyTransform, setSnapIndex]
    );

    // ========================================================================
    // Sync React state → DOM transform
    // ========================================================================

    useEffect(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;

      const targetOffset = getOffsetForIndex(currentSnapIndex);

      drawer.style.transition = SNAP_TRANSITION;
      drawer.style.transform = `translateY(${targetOffset}px)`;

      if (overlayRef.current) {
        const maxH = getMaxHeight();
        const px = getSnapPx();
        const minH = px[0] ?? 0;
        const maxOffset = maxH - minH;
        const progress = maxOffset > 0 ? 1 - targetOffset / maxOffset : 0;
        overlayRef.current.style.opacity = `${progress}`;
        overlayRef.current.style.pointerEvents =
          progress > 0.1 ? "auto" : "none";
      }
    }, [currentSnapIndex, getOffsetForIndex, getMaxHeight, getSnapPx]);

    // ========================================================================
    // Unified pointer handlers (touch + mouse)
    // ========================================================================

    /** Walk up from the touch target to find the nearest vertically scrollable ancestor */
    const findScrollableAncestor = useCallback(
      (target: EventTarget | null): HTMLElement | null => {
        let node = target as HTMLElement | null;
        while (node && node !== drawerRef.current) {
          // Check if this element is vertically scrollable
          if (node.scrollHeight > node.clientHeight) {
            const style = window.getComputedStyle(node);
            const overflowY = style.overflowY;
            if (
              overflowY === "auto" ||
              overflowY === "scroll" ||
              // data-slot content area is always considered scrollable
              node.dataset.slot === "swipeable-drawer-content"
            ) {
              return node;
            }
          }
          node = node.parentElement;
        }
        return null;
      },
      []
    );

    /** Get scrollTop of the stored scrollable element (or the main content area) */
    const getScrollableScrollTop = useCallback(() => {
      const el = dragState.current.scrollableElement;
      if (el) return el.scrollTop;
      // Fallback: check the main content area
      const content = drawerRef.current?.querySelector(
        '[data-slot="swipeable-drawer-content"]'
      );
      return content?.scrollTop ?? 0;
    }, []);

    const handlePointerDown = useCallback(
      (clientY: number, target: EventTarget | null) => {
        const ds = dragState.current;
        ds.active = true;
        ds.startY = clientY;
        ds.lastY = clientY;
        ds.currentOffset = 0;
        ds.startTimestamp = performance.now();
        ds.lastTimestamp = ds.startTimestamp;
        ds.velocity = 0;
        ds.didDrag = false;
        // Find and store the scrollable element at touch start
        const scrollable =
          snapIndexRef.current > 0 ? findScrollableAncestor(target) : null;
        ds.startedFromScrollableContent = scrollable !== null;
        ds.scrollableElement = scrollable;
        ds.contentScrollTop = scrollable?.scrollTop ?? 0;
      },
      [findScrollableAncestor]
    );

    const handlePointerMove = useCallback(
      (clientY: number) => {
        const ds = dragState.current;
        if (!ds.active) return;

        const deltaFromStart = clientY - ds.startY;
        const now = performance.now();

        // If started inside scrollable content, hand off to drawer drag
        // when scroll limit is reached in the drag direction
        if (ds.startedFromScrollableContent) {
          const el = ds.scrollableElement;
          const currentScrollTop = getScrollableScrollTop();
          const isAtBottom = el
            ? el.scrollHeight - el.scrollTop - el.clientHeight < 1
            : false;

          // Dragging down (collapse direction): only take over if at scroll top
          if (deltaFromStart > 0) {
            if (currentScrollTop > 0) {
              ds.startY = clientY;
              return;
            }
            // At top + dragging down → hand off to drawer
          }
          // Dragging up (expand direction): only take over if at scroll bottom
          else if (deltaFromStart < 0) {
            if (!isAtBottom) {
              ds.startY = clientY;
              return;
            }
            // At bottom + dragging up → hand off to drawer
          } else {
            // No movement yet, keep waiting
            return;
          }

          ds.startedFromScrollableContent = false;
          ds.scrollableElement = null;
        }

        // Dead zone check
        if (!ds.didDrag && Math.abs(deltaFromStart) < DRAG_DEAD_ZONE) {
          return;
        }
        ds.didDrag = true;

        // Calculate velocity (exponential moving average)
        const dt = now - ds.lastTimestamp;
        if (dt > 0) {
          const instantVelocity = (clientY - ds.lastY) / dt;
          ds.velocity = 0.7 * instantVelocity + 0.3 * ds.velocity;
        }
        ds.lastY = clientY;
        ds.lastTimestamp = now;

        // Compute the visual offset
        const baseOffset = getOffsetForIndex(snapIndexRef.current);
        const targetOffset = baseOffset + deltaFromStart;

        // Cancel previous rAF and schedule new one
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          applyTransform(targetOffset, false);
        });

        ds.currentOffset = deltaFromStart;
      },
      [getOffsetForIndex, applyTransform, getScrollableScrollTop]
    );

    const handlePointerUp = useCallback(() => {
      const ds = dragState.current;
      if (!ds.active) return;
      ds.active = false;

      // Cancel any pending rAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      // If it was a tap (no significant drag), expand one step if collapsed
      if (!ds.didDrag) {
        if (snapIndexRef.current === 0) {
          snapToIndex(1);
        }
        return;
      }

      // Current position in translateY space
      const baseOffset = getOffsetForIndex(snapIndexRef.current);
      const currentTranslateY = baseOffset + ds.currentOffset;
      // Convert to height: height = maxH - translateY
      const maxH = getMaxHeight();
      const currentHeight = maxH - currentTranslateY;

      const px = getSnapPx();

      // Velocity-based decision (flick gesture)
      if (Math.abs(ds.velocity) > FLICK_VELOCITY_THRESHOLD) {
        const currentIdx = snapIndexRef.current;
        if (ds.velocity < 0) {
          // Flick up → go to next higher snap point
          snapToIndex(Math.min(maxIndex, currentIdx + 1));
        } else {
          // Flick down → go to next lower snap point
          snapToIndex(Math.max(0, currentIdx - 1));
        }
        return;
      }

      // Position-based: find nearest snap point by height
      let nearestIdx = 0;
      let nearestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < px.length; i++) {
        const dist = Math.abs(currentHeight - (px[i] ?? 0));
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      snapToIndex(nearestIdx);
    }, [getOffsetForIndex, getMaxHeight, getSnapPx, maxIndex, snapToIndex]);

    // ========================================================================
    // Touch event handlers (native, non-passive for preventDefault)
    // ========================================================================

    const handleTouchStart = useCallback(
      (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        handlePointerDown(touch.clientY, e.target);
      },
      [handlePointerDown]
    );

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;

        const ds = dragState.current;
        if (!ds.active) return;

        const deltaY = touch.clientY - ds.startY;

        // Prevent pull-to-refresh IMMEDIATELY:
        // - When collapsed: any touch movement should be ours, not the browser's
        // - When expanded and touching scrollable content: let it scroll naturally
        // - When already actively dragging past dead zone: always block
        if (ds.didDrag) {
          e.preventDefault();
        } else if (snapIndexRef.current === 0) {
          // Collapsed: always prevent (drawer owns all gestures)
          e.preventDefault();
        } else if (ds.startedFromScrollableContent) {
          // Inside a scrollable element: prevent default at scroll boundaries
          const el = ds.scrollableElement;
          const scrollTop = getScrollableScrollTop();
          const isAtBottom = el
            ? el.scrollHeight - el.scrollTop - el.clientHeight < 1
            : false;

          if (scrollTop <= 0 && deltaY > 0) {
            // At top + dragging down → drawer takes over
            e.preventDefault();
          } else if (isAtBottom && deltaY < 0) {
            // At bottom + dragging up → drawer takes over
            e.preventDefault();
          }
          // Otherwise let native scroll happen
        } else {
          // Not in scrollable content: prevent for any direction
          e.preventDefault();
        }

        handlePointerMove(touch.clientY);
      },
      [handlePointerMove, getScrollableScrollTop]
    );

    const handleTouchEnd = useCallback(() => {
      handlePointerUp();
    }, [handlePointerUp]);

    // ========================================================================
    // Mouse event handlers (desktop support)
    // ========================================================================

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        handlePointerDown(e.clientY, e.target);

        const onMouseMove = (moveEvent: MouseEvent) => {
          handlePointerMove(moveEvent.clientY);
        };

        const onMouseUp = () => {
          handlePointerUp();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseup", onMouseUp);
      },
      [handlePointerDown, handlePointerMove, handlePointerUp]
    );

    // ========================================================================
    // Overlay click handler
    // ========================================================================

    const handleOverlayClick = useCallback(() => {
      if (closeOnOverlayClick && isExpanded) {
        snapToIndex(0);
      }
    }, [closeOnOverlayClick, isExpanded, snapToIndex]);

    // ========================================================================
    // Native touch event listeners (passive: false to allow preventDefault)
    // ========================================================================

    useEffect(() => {
      const el = drawerRef.current;
      if (!el) return;

      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchmove", handleTouchMove, { passive: false });
      el.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchmove", handleTouchMove);
        el.removeEventListener("touchend", handleTouchEnd);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    // ========================================================================
    // Imperative handle
    // ========================================================================

    useImperativeHandle(
      ref,
      () => ({
        expand: () => snapToIndex(maxIndex),
        collapse: () => snapToIndex(0),
        toggle: () => snapToIndex(currentSnapIndex === 0 ? maxIndex : 0),
        isExpanded: () => snapIndexRef.current > 0,
        goToSnapPoint: (index: number) => snapToIndex(index),
        getSnapIndex: () => snapIndexRef.current,
      }),
      [currentSnapIndex, maxIndex, snapToIndex]
    );

    // ========================================================================
    // Styles
    // ========================================================================

    const drawerStyle = useMemo((): CSSProperties => {
      const maxH = getMaxHeight();
      const targetOffset = getOffsetForIndex(currentSnapIndex);
      return {
        height: `${maxH}px`,
        transform: `translateY(${targetOffset}px)`,
        zIndex,
        willChange: "transform",
        touchAction: "none",
        overscrollBehavior: "contain",
      };
    }, [currentSnapIndex, getMaxHeight, getOffsetForIndex, zIndex]);

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <>
        {/* Overlay */}
        {showOverlay && (
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/50 transition-opacity duration-300"
            onClick={handleOverlayClick}
            ref={overlayRef}
            style={{
              zIndex: zIndex - 1,
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          />
        )}

        {/* Drawer */}
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 rounded-t-3xl border-t bg-background shadow-2xl",
            className
          )}
          data-expanded={isExpanded}
          data-slot="swipeable-drawer"
          data-snap-index={currentSnapIndex}
          onMouseDown={handleMouseDown}
          ref={drawerRef}
          role="dialog"
          style={drawerStyle}
          tabIndex={-1}
        >
          {/* Drag Handle */}
          {showHandle && (
            <div className="flex w-full cursor-grab flex-col items-center pt-4 pb-2 active:cursor-grabbing">
              {customHandle ?? (
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
              )}
            </div>
          )}

          {/* Custom handle when showHandle is false */}
          {!showHandle && customHandle && (
            <div className="cursor-grab active:cursor-grabbing">
              {customHandle}
            </div>
          )}

          {/* Content - Memoized to prevent re-renders during drag */}
          <DrawerContent
            contentClassName={contentClassName}
            expandedContent={expandedContent}
            isExpanded={isExpanded}
            peekContent={peekContent}
          />
        </div>
      </>
    );
  }
);

SwipeableDrawer.displayName = "SwipeableDrawer";

// ============================================================================
// Exports
// ============================================================================

export { SwipeableDrawer as default };
