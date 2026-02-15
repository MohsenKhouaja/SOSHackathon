import { Badge } from "@repo/ui/components/ui/badge";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { DataTableColumnHeader } from "@repo/ui/components/data-table/data-table-column-header";
import type { ColumnDef } from "@tanstack/react-table";
import type { RouterOutputs } from "@repo/trpc";
import { format } from "date-fns";
import { useMemo } from "react";

export type IncidentRow = RouterOutputs["incidents"]["findMany"]["data"][number];

export const useIncidentColumns = (): ColumnDef<IncidentRow>[] => {
  return useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => <div className="w-[80px]">{row.getValue("type")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "urgencyLevel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Urgency" />
      ),
      cell: ({ row }) => {
        const urgency = row.getValue("urgencyLevel") as string;
        return (
          <Badge
            variant={urgency === "CRITICAL" ? "destructive" : urgency === "HIGH" ? "destructive" : "outline"}
          >
            {urgency}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="secondary" className="rounded-sm font-normal">
            {status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "childNameFallback",
      header: "Child",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {row.getValue("childNameFallback") || "Anonymous"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reported" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex w-[100px] items-center">
            <span>{format(new Date(row.getValue("createdAt")), "PP")}</span>
          </div>
        );
      },
    },
  ], []);
};

