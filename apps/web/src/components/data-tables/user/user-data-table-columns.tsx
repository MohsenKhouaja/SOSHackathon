import type { ColumnDef } from "@repo/ui/@tanstack/react-table";
import { DataTableColumnHeader } from "@repo/ui/components/data-table/data-table-column-header";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import type { UsersPage } from "@repo/validators";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, Mail, MoreHorizontal, Text as TextIcon, X } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { prefetchUser } from "@/api/queries/user-queries";

export const useUserColumns = () => {
  const queryClient = useQueryClient();

  return useMemo<ColumnDef<UsersPage["data"][number]>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ cell, row }) => (
          <Link
            className="-my-2 flex items-center hover:underline"
            onFocus={() => prefetchUser(queryClient, row.original.id)}
            onMouseEnter={() => prefetchUser(queryClient, row.original.id)}
            to={row.original.id}
          >
            <div>{cell.getValue<UsersPage["data"][number]["name"]>()}</div>
          </Link>
        ),
        meta: {
          label: "Name",
          variant: "text",
          placeholder: "Search...",
          icon: TextIcon,
        },
        enableColumnFilter: true,
      },
      {
        id: "email",
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ cell }) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{cell.getValue<string>()}</span>
          </div>
        ),
        meta: { label: "Email", icon: Mail },
      },
      {
        id: "role",
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ cell }) => (
          <div className="capitalize">{cell.getValue<string>() ?? "N/A"}</div>
        ),
        meta: { label: "Role" },
      },

      {
        id: "emailVerified",
        accessorKey: "emailVerified",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Verified" />
        ),
        cell: ({ cell }) => {
          const value =
            cell.getValue<UsersPage["data"][number]["emailVerified"]>();
          if (value === true) {
            return (
              <Badge className="text-green-600" variant="outline">
                <Check className="h-3 w-3" />
                Verified
              </Badge>
            );
          }

          if (value === false) {
            return (
              <Badge className="text-red-700" variant="outline">
                <X className="h-3 w-3" />
                Unverified
              </Badge>
            );
          }

          return <span className="text-muted-foreground">N/A</span>;
        },
        meta: { label: "Email Verified", icon: Check },
        enableColumnFilter: true,
      },
      {
        id: "twoFactorEnabled",
        accessorKey: "twoFactorEnabled",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="2FA" />
        ),
        cell: ({ cell }) => {
          const value =
            cell.getValue<UsersPage["data"][number]["twoFactorEnabled"]>();
          if (value === true) {
            return (
              <Badge className="text-green-600" variant="outline">
                <Check className="h-3 w-3" />
                Enabled
              </Badge>
            );
          }

          if (value === false) {
            return (
              <Badge className="text-red-700" variant="outline">
                <X className="h-3 w-3" />
                Disabled
              </Badge>
            );
          }

          return <span className="text-muted-foreground">N/A</span>;
        },
        meta: { label: "2FA" },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return (
            <div className="whitespace-nowrap">
              {createdAt ? (
                <>
                  <div>{format(new Date(createdAt), "MMM dd, yyyy")}</div>
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(createdAt), "h:mm a")}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
          );
        },
        meta: { label: "Created At", variant: "dateRange" },
      },
      {
        id: "actions",
        cell({ row }) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-20 font-mono">
                <DropdownMenuItem>
                  <Link to={row.original.id}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to={`${row.original.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 32,
      },
    ],
    [queryClient]
  );
};
