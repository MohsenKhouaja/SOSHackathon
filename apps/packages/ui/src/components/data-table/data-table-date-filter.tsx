/** biome-ignore-all lint/performance/noNamespaceImport: this is good */
/** biome-ignore-all lint/nursery/noUnnecessaryConditions: this is good */
/** biome-ignore-all lint/a11y/useSemanticElements: this is good */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: this is good */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: this is good */
"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { formatDate } from "@repo/ui/lib/format";
import type { Column } from "@tanstack/react-table";
import { CalendarIcon, XCircle } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

type DateSelection = Date[] | DateRange;

function getIsDateRange(value: DateSelection): value is DateRange {
  return value && typeof value === "object" && !Array.isArray(value);
}

// Regex for ISO date format (YYYY-MM-DD) - defined at top level for performance
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}/;

function parseAsDate(
  value: number | string | Date | undefined
): Date | undefined {
  if (!value) {
    return;
  }
  // Handle Date objects directly
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }
  // Handle ISO string format (YYYY-MM-DD or full ISO)
  if (typeof value === "string" && ISO_DATE_REGEX.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  // Handle numeric timestamp (legacy support)
  const numericTimestamp = typeof value === "string" ? Number(value) : value;
  const date = new Date(numericTimestamp);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseColumnFilterValue(value: unknown) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (
        typeof item === "number" ||
        typeof item === "string" ||
        item instanceof Date
      ) {
        return item;
      }
      return;
    });
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date
  ) {
    return [value];
  }

  return [];
}

type DataTableDateFilterProps<TData> = {
  column: Column<TData, unknown>;
  title?: string;
  multiple?: boolean;
  filterValue?: unknown;
};

export function DataTableDateFilter<TData>({
  column,
  title,
  multiple,
  filterValue,
}: DataTableDateFilterProps<TData>) {
  const columnFilterValue = filterValue ?? column.getFilterValue();

  const selectedDates = React.useMemo<DateSelection>(() => {
    if (!columnFilterValue) {
      return multiple ? { from: undefined, to: undefined } : [];
    }

    if (multiple) {
      const timestamps = parseColumnFilterValue(columnFilterValue);
      return {
        from: parseAsDate(timestamps[0]),
        to: parseAsDate(timestamps[1]),
      };
    }

    const timestamps = parseColumnFilterValue(columnFilterValue);
    const date = parseAsDate(timestamps[0]);
    return date ? [date] : [];
  }, [columnFilterValue, multiple]);

  const onSelect = React.useCallback(
    (date: Date | DateRange | undefined) => {
      if (!date) {
        column.setFilterValue(undefined);
        return;
      }

      if (multiple && !("getTime" in date)) {
        // For date ranges: from = start of day, to = end of day
        let from: Date | undefined;
        let to: Date | undefined;

        if (date.from) {
          // Start of day: set time to 00:00:00.000
          const startOfDay = new Date(date.from);
          startOfDay.setHours(0, 0, 0, 0);
          from = startOfDay;
        }

        if (date.to) {
          // End of day: set time to 23:59:59.999
          const endOfDay = new Date(date.to);
          endOfDay.setHours(23, 59, 59, 999);
          to = endOfDay;
        } else if (date.from) {
          // If to is undefined, default to from (end of day)
          const endOfDay = new Date(date.from);
          endOfDay.setHours(23, 59, 59, 999);
          to = endOfDay;
        }

        column.setFilterValue(from && to ? [from, to] : undefined);
      } else if (!multiple && "getTime" in date) {
        // Single date - use start of day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        column.setFilterValue(startOfDay);
      }
    },
    [column, multiple]
  );

  const onReset = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      column.setFilterValue(undefined);
    },
    [column]
  );

  const hasValue = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) {
        return false;
      }
      return selectedDates.from || selectedDates.to;
    }
    if (!Array.isArray(selectedDates)) {
      return false;
    }
    return selectedDates.length > 0;
  }, [multiple, selectedDates]);

  const formatDateRange = React.useCallback((range: DateRange) => {
    if (!(range.from || range.to)) {
      return "";
    }
    if (range.from && range.to) {
      return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    }
    return formatDate(range.from ?? range.to);
  }, []);

  const label = React.useMemo(() => {
    if (multiple) {
      if (!getIsDateRange(selectedDates)) {
        return null;
      }

      const hasSelectedDates = selectedDates.from || selectedDates.to;
      const dateText = hasSelectedDates
        ? formatDateRange(selectedDates)
        : "Select date range";

      return (
        <span className="flex items-center gap-2">
          <span>{title}</span>
          {hasSelectedDates && (
            <>
              <Separator
                className="mx-0.5 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <span>{dateText}</span>
            </>
          )}
        </span>
      );
    }

    if (getIsDateRange(selectedDates)) {
      return null;
    }

    const hasSelectedDate = selectedDates.length > 0;
    const dateText = hasSelectedDate
      ? formatDate(selectedDates[0])
      : "Select date";

    return (
      <span className="flex items-center gap-2">
        <span>{title}</span>
        {hasSelectedDate && (
          <>
            <Separator
              className="mx-0.5 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <span>{dateText}</span>
          </>
        )}
      </span>
    );
  }, [selectedDates, multiple, formatDateRange, title]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="border-dashed" size="sm" variant="outline">
          {hasValue ? (
            <div
              aria-label={`Clear ${title} filter`}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={onReset}
              role="button"
              tabIndex={0}
            >
              <XCircle />
            </div>
          ) : (
            <CalendarIcon />
          )}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {multiple ? (
          <Calendar
            autoFocus
            mode="range"
            onSelect={onSelect}
            selected={
              getIsDateRange(selectedDates)
                ? selectedDates
                : { from: undefined, to: undefined }
            }
          />
        ) : (
          <Calendar
            autoFocus
            mode="single"
            onSelect={onSelect}
            selected={
              getIsDateRange(selectedDates) ? undefined : selectedDates[0]
            }
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
