/** biome-ignore-all lint/performance/noNamespaceImport: yes */
"use client";

import { DataTableViewOptions } from "@repo/ui/components/data-table/data-table-view-options";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { formatDate } from "@repo/ui/lib/format";
import { cn } from "@repo/ui/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Funnel,
  FunnelX,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";
import { ButtonGroup } from "../ui/button-group";

type FilterBadge = {
  id: string;
  columnId: string;
  columnLabel: string;
  value: string;
};

/**
 * Custom action button configuration for the data table selection bar.
 * When provided, these replace the default Export/Delete buttons.
 */
export type DataTableActionButtonsProps<TData> = {
  /** The currently selected rows */
  selectedRows: TData[];
  /** The table instance for additional control */
  table: Table<TData>;
};

interface DataTableControlsProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  showToolbar?: boolean;
  showPagination?: boolean;
  onDeleteSelected?: () => void;
  onExportSelected?: () => void;
  /**
   * Custom action buttons to display when rows are selected.
   * If provided, replaces the default Export/Delete buttons.
   * Receives selectedRows and table instance as props.
   */
  actionButtons?: (
    props: DataTableActionButtonsProps<TData>
  ) => React.ReactNode;
}

export function DataTableControls<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showToolbar = true,
  showPagination = true,
  onDeleteSelected,
  onExportSelected,
  actionButtons,
  children,
  className,
  ...props
}: DataTableControlsProps<TData>) {
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedColumn, setSelectedColumn] = React.useState<string>("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);

  // Force re-render when filters change
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Explicitly read table state to ensure React Compiler tracks it
  // biome-ignore lint/correctness/noUnusedVariables: Reading state for React Compiler
  const { rowSelection } = table.getState();

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;
  const hasSelectedRows = selectedRowsCount > 0;

  const searchableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            column.getCanFilter() && column.columnDef.meta?.variant === "text"
        ),
    [table]
  );
  // Derive filter badges from table's column filters state (synced with URL)
  // Note: Not memoized to ensure fresh state is always read
  const columnFilters = table.getState().columnFilters;
  const searchableColumnIds = new Set(searchableColumns.map((col) => col.id));

  const filterBadges = columnFilters
    .filter((filter) => searchableColumnIds.has(filter.id))
    .map((filter) => {
      const column = searchableColumns.find((col) => col.id === filter.id);
      let displayValue = String(filter.value);

      // Handle Date values (single or range)
      if (Array.isArray(filter.value) && filter.value[0] instanceof Date) {
        const [from, to] = filter.value;
        if (from && to) {
          displayValue = `${formatDate(from)} - ${formatDate(to)}`;
        } else if (from) {
          displayValue = formatDate(from);
        }
      } else if (filter.value instanceof Date) {
        displayValue = formatDate(filter.value);
      }

      return {
        id: `${filter.id}-${displayValue}`,
        columnId: filter.id,
        columnLabel: column?.columnDef.meta?.label || filter.id,
        value: displayValue,
      } as FilterBadge;
    });

  // Set default selected column
  React.useEffect(() => {
    if (!selectedColumn && searchableColumns.length > 0) {
      const firstColumnId = searchableColumns[0]?.id;
      if (firstColumnId) {
        setSelectedColumn(firstColumnId);
      }
    }
  }, [selectedColumn, searchableColumns]);

  // Force update on mount to ensure badges appear from URL state
  React.useEffect(() => {
    forceUpdate();
  }, []);

  const addFilterBadge = React.useCallback(() => {
    if (!(searchValue.trim() && selectedColumn)) return;

    const column = searchableColumns.find((col) => col.id === selectedColumn);
    if (!column) return;

    // Use table's column filter method which will sync with URL automatically
    column.setFilterValue(searchValue.trim());
    setSearchValue("");
    // Force re-render to update badges
    forceUpdate();
  }, [searchValue, selectedColumn, searchableColumns]);

  const removeFilterBadge = React.useCallback(
    (badgeId: string, forceRerender = true) => {
      // Extract column ID from badge ID
      const columnId = badgeId.split("-")[0];
      if (!columnId) return;
      const column = table.getColumn(columnId);
      column?.setFilterValue(undefined);
      // Force re-render to update badges
      forceRerender && forceUpdate();
    },
    [table]
  );

  const clearAllFilters = React.useCallback(() => {
    for (const filterBadge of filterBadges)
      removeFilterBadge(filterBadge.id, false);
    forceUpdate();
  }, [filterBadges, removeFilterBadge]);

  const handleKeyPress = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        addFilterBadge();
      }
    },
    [addFilterBadge]
  );

  const isFiltered = table.getState().columnFilters.length > 0;
  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      className={cn(
        "group flex w-screen flex-col font-mono md:w-full",
        "sticky mb-11 bg-background md:relative md:m-0 md:mb-0 md:p-0 md:px-0 md:py-0",
        "border-t bg-background md:ml-0 md:border-t-0",
        className
      )}
      data-has-selection={hasSelectedRows}
      {...props}
    >
      {/* Controls and Selection Info Container */}
      <div className="relative flex flex-col">
        {/* Controls: Always visible on desktop, hidden on mobile when something is selected */}
        <div
          className={cn(
            "h-auto translate-y-0 overflow-visible opacity-100 transition-all duration-200 ease-out",
            "group-data-[has-selection=true]:pointer-events-none group-data-[has-selection=true]:invisible group-data-[has-selection=true]:h-0 group-data-[has-selection=true]:translate-y-2 group-data-[has-selection=true]:overflow-hidden group-data-[has-selection=true]:opacity-0",
            "md:group-data-[has-selection=true]:pointer-events-auto md:group-data-[has-selection=true]:visible md:group-data-[has-selection=true]:h-auto md:group-data-[has-selection=true]:translate-y-0 md:group-data-[has-selection=true]:overflow-visible md:group-data-[has-selection=true]:opacity-100",
            "group-data-[has-selection=true]:hidden"
          )}
        >
          {/* Main Controls Row */}
          <div className="flex w-full flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-0 md:py-0 md:pb-2">
            {/* Left Section: Search + Children */}
            <div className="hidden w-full flex-col gap-2 md:flex md:w-auto md:grow md:flex-row lg:flex-nowrap">
              {/* Desktop Filter UI */}
              {showToolbar && searchableColumns.length > 0 && (
                <div className="hidden w-full flex-col gap-2 sm:flex-row md:flex md:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Input
                      className="h-8 w-full border-muted pr-8 transition-colors hover:border-foreground/20 focus:border-primary sm:w-48"
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Search..."
                      value={searchValue}
                    />
                    <Button
                      className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-primary/10"
                      disabled={!searchValue.trim()}
                      onClick={addFilterBadge}
                      size="sm"
                      variant="ghost"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Select
                    onValueChange={setSelectedColumn}
                    value={selectedColumn}
                  >
                    <SelectTrigger className="h-8! w-full border-muted transition-colors hover:border-foreground/20 sm:w-auto sm:min-w-32">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchableColumns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.columnDef.meta?.label || column.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Desktop: Show children (DataTableToolbar) inline */}
              <div className="hidden w-full shrink md:block md:w-auto">
                {children}
              </div>
            </div>

            {/* Right Section: Pagination + Row Size Selector + View Options */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {showPagination && (
                <div className="flex items-center justify-between gap-2 pb-3 sm:justify-start md:flex-nowrap md:pb-0">
                  <div className="flex items-center gap-1">
                    <ButtonGroup>
                      <Button
                        aria-label="Go to first page"
                        className="h-8! w-8 transition-colors hover:bg-primary/10 md:flex"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.setPageIndex(0)}
                        size="icon"
                        variant="outline"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Go to previous page"
                        className="h-8! w-8 transition-colors hover:bg-primary/10"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                        size="icon"
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </ButtonGroup>
                    <div className="flex items-center gap-1 px-2 sm:px-3">
                      <Input
                        aria-label="Go to page"
                        className="h-7 w-9 border-muted px-1 text-center font-medium text-sm transition-colors [appearance:textfield] hover:border-foreground/20 focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        key={table.getState().pagination.pageIndex}
                        max={table.getPageCount()}
                        min={1}
                        onBlur={(e) => {
                          // Reset to current page if input is invalid on blur
                          const value = e.target.value;
                          const pageNumber = Number.parseInt(value, 10);
                          if (
                            Number.isNaN(pageNumber) ||
                            pageNumber < 1 ||
                            pageNumber > table.getPageCount()
                          ) {
                            e.target.value = String(
                              table.getState().pagination.pageIndex + 1
                            );
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input for typing
                          if (value === "") return;
                          const pageNumber = Number.parseInt(value, 10);
                          if (
                            !Number.isNaN(pageNumber) &&
                            pageNumber >= 1 &&
                            pageNumber <= table.getPageCount()
                          ) {
                            table.setPageIndex(pageNumber - 1);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        type="number"
                      />
                      <span className="whitespace-nowrap font-medium text-muted-foreground text-sm">
                        / {table.getPageCount()}
                      </span>
                    </div>
                    <ButtonGroup>
                      <Button
                        aria-label="Go to next page"
                        className="h-8! w-8 transition-colors hover:bg-primary/10"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                        size="icon"
                        variant="outline"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Go to last page"
                        className="h-8! w-8 transition-colors hover:bg-primary/10 md:flex"
                        disabled={!table.getCanNextPage()}
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        size="icon"
                        variant="outline"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </ButtonGroup>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mobile Filter Dialog */}
                    {isFiltered && (
                      <Button
                        aria-label="Reset filters"
                        className="h-8 w-fit gap-1 border-destructive! px-2 md:hidden"
                        onClick={onReset}
                        size="icon"
                        variant="outline"
                      >
                        <FunnelX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    {showToolbar && searchableColumns.length > 0 && (
                      <Dialog
                        onOpenChange={setIsFilterDialogOpen}
                        open={isFilterDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="h-8 w-fit gap-1 px-2 md:hidden"
                            size="icon"
                            variant="outline"
                          >
                            <Funnel className="h-4 w-4" />
                            {filterBadges.length > 0 && (
                              <Badge
                                className="h-5 w-5 rounded-full p-0"
                                variant="secondary"
                              >
                                {filterBadges.length}
                              </Badge>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[85vh] max-w-[90vw] overflow-y-auto sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Filters</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {searchableColumns.length > 0 && (
                              <div className="space-y-2">
                                <Select
                                  onValueChange={setSelectedColumn}
                                  value={selectedColumn}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {searchableColumns.map((column) => (
                                      <SelectItem
                                        key={column.id}
                                        value={column.id}
                                      >
                                        {column.columnDef.meta?.label ||
                                          column.id}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <div className="relative">
                                  <Input
                                    className="w-full pr-8"
                                    onChange={(e) =>
                                      setSearchValue(e.target.value)
                                    }
                                    onKeyDown={handleKeyPress}
                                    placeholder="Search..."
                                    value={searchValue}
                                  />
                                  <Button
                                    className="absolute top-0 right-0 h-full w-10 p-0"
                                    disabled={!searchValue.trim()}
                                    onClick={() => {
                                      addFilterBadge();
                                    }}
                                    size="sm"
                                    variant="ghost"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">{children}</div>

                            {filterBadges.length > 0 && (
                              <div className="space-y-2 border-t pt-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground text-sm">
                                    Active Filters
                                  </span>
                                  <Button
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      clearAllFilters();
                                      setIsFilterDialogOpen(false);
                                    }}
                                    size="sm"
                                    variant="ghost"
                                  >
                                    Clear all
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {filterBadges.map((badge) => (
                                    <Badge
                                      className="flex items-center gap-1 py-1 pr-1 pl-2"
                                      key={badge.id}
                                      variant="secondary"
                                    >
                                      <span className="text-muted-foreground text-xs">
                                        {badge.columnLabel}:
                                      </span>
                                      <span className="text-xs">
                                        {badge.value}
                                      </span>
                                      <Button
                                        className="ml-1 h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() =>
                                          removeFilterBadge(badge.id)
                                        }
                                        size="sm"
                                        variant="ghost"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Select
                      onValueChange={(value) =>
                        table.setPageSize(Number(value))
                      }
                      value={`${table.getState().pagination.pageSize}`}
                    >
                      <SelectTrigger className="h-8! border-muted transition-colors hover:border-foreground/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {pageSizeOptions.map((pageSize) => (
                          <SelectItem
                            className="font-mono focus:bg-primary/10"
                            key={pageSize}
                            value={`${pageSize}`}
                          >
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="hidden sm:block">
                <DataTableViewOptions table={table} />
              </div>
            </div>
          </div>

          {/* Filter Badges Row (Desktop) */}
          {filterBadges.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-2 px-4 pb-3 md:px-0 md:pb-0">
              {filterBadges.map((badge) => (
                <Badge
                  className="flex items-center gap-1 py-1 pr-1 pl-2 text-xs"
                  key={badge.id}
                  variant="secondary"
                >
                  <span className="text-muted-foreground">
                    {badge.columnLabel}:
                  </span>
                  <span>{badge.value}</span>
                  <Button
                    className="ml-1 h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFilterBadge(badge.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                className="h-6 border-dashed px-2 text-xs hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                onClick={clearAllFilters}
                size="sm"
                variant="outline"
              >
                <X className="mr-1 h-3 w-3" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Selection Info: Visible whenever rows are selected */}
        <div
          className={cn(
            "pointer-events-none h-0 -translate-y-2 overflow-hidden p-0 opacity-0",
            "group-data-[has-selection=true]:pointer-events-auto group-data-[has-selection=true]:h-auto group-data-[has-selection=true]:translate-y-0 group-data-[has-selection=true]:overflow-visible group-data-[has-selection=true]:opacity-100"
          )}
        >
          {/* Selection Info Bar */}
          <div className="md:mb-2">
            <div className="flex items-center justify-between px-4 py-3 pb-6 md:rounded-lg md:px-0 md:py-0.5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm">
                  <span className="font-semibold text-primary">
                    {selectedRowsCount}
                  </span>{" "}
                  <span className="hidden sm:inline">
                    of <span className="font-medium">{totalRowsCount}</span> row
                    {totalRowsCount !== 1 ? "s" : ""}
                  </span>{" "}
                  selected
                </span>
                <Button
                  aria-label="Clear selection"
                  className="h-7 gap-1 px-2 font-medium text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => table.resetRowSelection()}
                  size="sm"
                  title="Clear selection"
                  variant="ghost"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {actionButtons ? (
                  actionButtons({
                    selectedRows: table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original),
                    table,
                  })
                ) : (
                  <>
                    <Button
                      aria-label="Export selected"
                      className="md:h-7 md:w-auto md:px-3 md:text-xs"
                      onClick={onExportSelected}
                      size="icon"
                      variant="outline"
                    >
                      <Download className="size-4" />
                      <span className="hidden md:ml-2 md:inline">
                        Export Selected
                      </span>
                    </Button>
                    <Button
                      aria-label="Delete selected"
                      className="text-destructive hover:bg-destructive/10 md:h-7 md:w-auto md:px-3 md:text-xs"
                      onClick={onDeleteSelected}
                      size="icon"
                      variant="outline"
                    >
                      <Trash2 className="size-4" />
                      <span className="hidden md:ml-2 md:inline">
                        Delete Selected
                      </span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
