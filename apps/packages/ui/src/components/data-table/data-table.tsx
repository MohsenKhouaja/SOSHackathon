import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { getCommonPinningStyles } from "@repo/ui/lib/data-table";
import { cn } from "@repo/ui/lib/utils";
import { useDataTableStore } from "@repo/ui/stores/data-table-store";
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";
import { ContextMenu, ContextMenuTrigger } from "../ui/context-menu";
import { TextShimmer } from "../ui/motion-primitives/text-shimmer";
import {
  DataTableMobileCard,
  MobileSelectionWrapper,
} from "./data-table-mobile-card";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  isLoading?: boolean;
  // Context Menu Content
  actions?: React.ReactNode;
  // Custom mobile card renderer
  mobileCard?: (props: {
    row: ReturnType<TanstackTable<TData>["getRowModel"]>["rows"][number];
    actions?: React.ReactNode;
    isSelected: boolean;
    isSelectionMode: boolean;
  }) => React.ReactNode;
}

export function DataTable<TData>({
  table,
  isLoading,
  children,
  className,
  actions,
  mobileCard,
  ...props
}: DataTableProps<TData>) {
  "use no memo";
  const { setRightClickData } = useDataTableStore();

  return (
    <div className={cn("flex w-full flex-col", className)} {...props}>
      <div className="hidden md:block">{children}</div>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden flex-1 flex-col overflow-hidden rounded-md border md:flex">
        <div className="h-full min-w-full max-w-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-background font-mono ring ring-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="border-b" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      colSpan={header.colSpan}
                      key={header.id}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              className={cn(
                "font-mono first:border-t-0",
                !isLoading && "last:border-b"
              )}
            >
              {isLoading ? (
                <TableRow className="border-b-0 hover:bg-background">
                  <TableCell
                    className="h-[calc(100vh-15rem)] text-center"
                    colSpan={table.getAllColumns().length}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        <TextShimmer>Loading...</TextShimmer>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <ContextMenu
                        key={cell.id}
                        onOpenChange={() =>
                          setRightClickData(row.id, cell.id, cell.renderValue())
                        }
                      >
                        <ContextMenuTrigger asChild>
                          <TableCell
                            className="h-fit"
                            key={cell.id}
                            style={{
                              ...getCommonPinningStyles({
                                column: cell.column,
                              }),
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        </ContextMenuTrigger>
                        {actions}
                      </ContextMenu>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-b-0 hover:bg-background">
                  <TableCell
                    className="h-[calc(100vh-16rem)] text-center"
                    colSpan={table.getAllColumns().length}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      No results.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Mobile Card View - Visible only on mobile */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pt-2 md:hidden">
        {isLoading ? (
          <div className="flex h-[calc(100vh-15rem)] items-center justify-center">
            <TextShimmer>Loading...</TextShimmer>
          </div>
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const isSelected = row.getIsSelected();
            const isSelectionMode =
              Object.keys(table.getState().rowSelection).length > 0;

            // If custom mobile card is provided, use it
            if (mobileCard) {
              return (
                <MobileSelectionWrapper
                  className="last:mb-20"
                  isSelected={isSelected}
                  isSelectionMode={isSelectionMode}
                  key={row.id}
                  row={row}
                >
                  {mobileCard({
                    row,
                    actions,
                    isSelected,
                    isSelectionMode,
                  })}
                </MobileSelectionWrapper>
              );
            }

            return (
              <DataTableMobileCard
                actions={actions}
                isSelected={isSelected}
                isSelectionMode={isSelectionMode}
                key={row.id}
                row={row}
                table={table}
              />
            );
          })
        ) : (
          <div className="flex h-[calc(100vh-16rem)] items-center justify-center text-muted-foreground">
            No results.
          </div>
        )}
      </div>
      <div className="md:hidden">{children}</div>
    </div>
  );
}
