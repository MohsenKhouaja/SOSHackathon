/** biome-ignore-all lint/a11y/noStaticElementInteractions: yes */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: yes */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: yes */
import { cn } from "@repo/ui/lib/utils";
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Card, CardContent } from "../ui/card";

// Regex patterns defined at module level for performance
const CAMEL_CASE_REGEX = /(?=[A-Z])/;
const FIRST_CHAR_REGEX = /^./;

// Mobile selection timing constants
// Delay before showing the hold animation (allows scrolling without triggering visuals)
const HOLD_START_DELAY = 300;
// Total hold duration after animation starts to trigger selection
const HOLD_DURATION = 300;
const MOVE_THRESHOLD = 10;

// Helper function to format column id to readable text
function formatColumnId(columnId: string): string {
  return columnId
    .split(CAMEL_CASE_REGEX)
    .join(" ")
    .replace(FIRST_CHAR_REGEX, (str) => str.toUpperCase());
}

// Hook for mobile selection logic
function useMobileSelection<TData>({
  row,
  isSelectionMode,
  onClick,
}: {
  row: ReturnType<TanstackTable<TData>["getRowModel"]>["rows"][number];
  isSelectionMode: boolean;
  onClick?: () => void;
}) {
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartDelayRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(
    () => () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (holdStartDelayRef.current) {
        clearTimeout(holdStartDelayRef.current);
      }
    },
    []
  );

  const clearAllTimers = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdStartDelayRef.current) {
      clearTimeout(holdStartDelayRef.current);
      holdStartDelayRef.current = null;
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (isSelectionMode) {
      // In selection mode, click toggles selection
      e.preventDefault();
      e.stopPropagation();
      row.toggleSelected(!row.getIsSelected());
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else {
      // Otherwise, call external onClick (e.g., expand)
      onClick?.();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (isSelectionMode) return;
    const touch = e.touches[0];
    if (!touch) return;

    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    // Start with a delay before showing the hold animation
    // This prevents the animation from starting when users just want to scroll
    holdStartDelayRef.current = setTimeout(() => {
      // Only start the visual feedback after the safe delay
      setIsHolding(true);

      // Then start the main hold timer for selection
      holdTimerRef.current = setTimeout(() => {
        row.toggleSelected(true);
        setIsHolding(false);
        startPosRef.current = null;
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, HOLD_DURATION);
    }, HOLD_START_DELAY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!startPosRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const diffX = Math.abs(currentX - startPosRef.current.x);
    const diffY = Math.abs(currentY - startPosRef.current.y);

    if (diffX > MOVE_THRESHOLD || diffY > MOVE_THRESHOLD) {
      clearAllTimers();
      setIsHolding(false);
      startPosRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    clearAllTimers();
    setIsHolding(false);
    startPosRef.current = null;
  };

  return {
    isHolding,
    holdDuration: HOLD_DURATION,
    handlers: {
      onClick: handleClick,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
  };
}

export function MobileSelectionWrapper<TData>({
  children,
  row,
  isSelected,
  isSelectionMode,
  className,
}: {
  children: ReactNode;
  row: ReturnType<TanstackTable<TData>["getRowModel"]>["rows"][number];
  isSelected: boolean;
  isSelectionMode: boolean;
  className?: string;
}) {
  const { isHolding, holdDuration, handlers } = useMobileSelection({
    row,
    isSelectionMode,
  });

  return (
    <div
      className={cn(
        "relative transition-all",
        isSelected && "rounded-xl bg-accent/20 ring-2 ring-primary",
        isHolding && "scale-[0.98]",
        className
      )}
      {...handlers}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-10 flex h-2 w-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md" />
      )}

      {/* Hold Progress Indicator */}
      {isHolding && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg bg-primary/10">
          <div
            className="h-full bg-primary/10 transition-all"
            style={{
              width: "100%",
              animation: `holdProgress ${holdDuration}ms linear`,
            }}
          />
        </div>
      )}

      {children}
    </div>
  );
}

// Mobile card field component
function MobileCardField<TData>({
  cell,
  table,
}: {
  cell: ReturnType<
    ReturnType<
      TanstackTable<TData>["getRowModel"]
    >["rows"][number]["getVisibleCells"]
  >[number];
  table: TanstackTable<TData>;
}) {
  // Extract header text: prioritize meta.label, then string header, then formatted column id
  const metaLabel = cell.column.columnDef.meta?.label;
  const header = cell.column.columnDef.header;
  const stringHeader = typeof header === "string" ? header : null;

  // Get header from header group if available
  let headerFromGroup: string | null = null;
  if (!(metaLabel || stringHeader)) {
    const headerGroup = table.getHeaderGroups()[0];
    const headerCell = headerGroup?.headers.find(
      (h) => h.column.id === cell.column.id
    );

    if (headerCell && !headerCell.isPlaceholder) {
      const renderedHeader = flexRender(
        headerCell.column.columnDef.header,
        headerCell.getContext()
      );

      if (
        renderedHeader &&
        typeof renderedHeader === "object" &&
        "props" in renderedHeader &&
        renderedHeader.props?.title
      ) {
        headerFromGroup = String(renderedHeader.props.title);
      }
    }
  }

  const headerText =
    metaLabel ||
    stringHeader ||
    headerFromGroup ||
    formatColumnId(cell.column.id);

  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <div className="shrink-0 text-muted-foreground">{headerText}</div>
      <div
        className="wrap-break-word text-right font-medium"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button")) {
            e.stopPropagation();
          }
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </div>
  );
}

export function DataTableMobileCard<TData>({
  row,
  table,
  isSelected,
  isSelectionMode,
  className,
}: {
  row: ReturnType<TanstackTable<TData>["getRowModel"]>["rows"][number];
  table: TanstackTable<TData>;
  isSelected: boolean;
  isSelectionMode: boolean;
  actions?: ReactNode;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCells = row.getVisibleCells();
  const actionsCell = visibleCells.find((cell) => cell.column.id === "actions");

  // Filter out select and actions to get data cells
  const dataCells = visibleCells.filter(
    (cell) => cell.column.id !== "select" && cell.column.id !== "actions"
  );

  // Use the first data cell as the "Title" or "Primary" info in the header
  const primaryCell = dataCells[0];
  // The rest go in the body
  const bodyCells = dataCells.slice(1);

  return (
    <MobileSelectionWrapper
      className={className}
      isSelected={isSelected}
      isSelectionMode={isSelectionMode}
      row={row}
    >
      <Card
        className={cn(
          "relative overflow-hidden py-0 transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={() => {
          if (!isSelectionMode) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="flex w-full cursor-pointer items-center justify-between border-b bg-muted/30 p-4 py-2 text-left transition-colors hover:bg-muted/50 active:bg-muted/60">
            <div className="flex items-center gap-3">
              {/* Actions (if available) */}
              {actionsCell ? (
                <div onClick={(e) => e.stopPropagation()}>
                  {flexRender(
                    actionsCell.column.columnDef.cell,
                    actionsCell.getContext()
                  )}
                </div>
              ) : null}

              {/* Primary Data */}
              {primaryCell && (
                <div
                  className="font-mono font-semibold text-sm"
                  onClickCapture={(e) => {
                    if ((e.target as HTMLElement).closest("a")) {
                      e.preventDefault();
                    }
                  }}
                >
                  {flexRender(
                    primaryCell.column.columnDef.cell,
                    primaryCell.getContext()
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Expandable Content */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-3 p-4">
              {bodyCells.map((cell) => (
                <MobileCardField cell={cell} key={cell.id} table={table} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </MobileSelectionWrapper>
  );
}
