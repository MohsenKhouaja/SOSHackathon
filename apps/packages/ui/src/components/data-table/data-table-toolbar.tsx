/** biome-ignore-all lint/performance/noNamespaceImport: this is good */
"use client";

import { DataTableDateFilter } from "@repo/ui/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@repo/ui/components/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@repo/ui/components/data-table/data-table-slider-filter";
// import { DataTableViewOptions } from "@repo/ui/components/data-table/data-table-view-options";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { cn } from "@repo/ui/lib/utils";
import type { Column, Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import type * as React from "react";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  filterState?: unknown;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  filterState,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());

  const onReset = () => {
    table.resetColumnFilters();
  };

  return (
    <div
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 font-mono",
        className
      )}
      role="toolbar"
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter
            column={column}
            filterValue={column.getFilterValue()}
            key={column.id}
          />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            className="border-dashed"
            onClick={onReset}
            size="sm"
            variant="outline"
          >
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {/* <DataTableViewOptions table={table} /> */}
      </div>
    </div>
  );
}
type DataTableToolbarFilterProps<TData> = {
  column: Column<TData>;
  filterValue?: unknown;
};

function DataTableToolbarFilter<TData>({
  column,
  filterValue,
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta;

  if (!columnMeta?.variant) {
    return null;
  }

  // const filterValue = column.getFilterValue(); // Use prop instead

  switch (columnMeta.variant) {
    // case "text":
    //   return (
    //     <Input
    //       className="h-8 w-40 lg:w-56"
    //       onChange={(event) => column.setFilterValue(event.target.value)}
    //       placeholder={columnMeta.placeholder ?? columnMeta.label}
    //       value={(column.getFilterValue() as string) ?? ""}
    //     />
    //   );

    case "number":
      return (
        <div className="relative">
          <Input
            className={cn("h-8 w-30", columnMeta.unit && "pr-8")}
            inputMode="numeric"
            onChange={(event) => column.setFilterValue(event.target.value)}
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            type="number"
            value={(filterValue as string) ?? ""}
          />
          {columnMeta.unit && (
            <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
              {columnMeta.unit}
            </span>
          )}
        </div>
      );

    case "range":
      return (
        <DataTableSliderFilter
          column={column}
          filterValue={filterValue}
          title={columnMeta.label ?? column.id}
        />
      );

    case "date":
    case "dateRange":
      return (
        <DataTableDateFilter
          column={column}
          filterValue={filterValue}
          multiple={columnMeta.variant === "dateRange"}
          title={columnMeta.label ?? column.id}
        />
      );

    case "select":
    case "multiSelect":
      return (
        <DataTableFacetedFilter
          column={column}
          filterValue={filterValue}
          multiple={columnMeta.variant === "multiSelect"}
          options={columnMeta.options ?? []}
          title={columnMeta.label ?? column.id}
        />
      );

    default:
      return null;
  }
}
