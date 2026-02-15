import { DataTable } from "@repo/ui/components/data-table/data-table";
import { DataTableControls } from "@repo/ui/components/data-table/data-table-controls";
import { DataTableToolbar } from "@repo/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@repo/ui/hooks/use-data-table";
import { useDataTableStore } from "@repo/ui/stores/data-table-store";
import type { UsersPage } from "@repo/validators";
import { useNavigate } from "react-router";
import DataTableActions from "../data-table-actions";
import { useUserColumns } from "./user-data-table-columns";

type UsersTableProps = {
  data: UsersPage["data"];
  count: number;
  isLoading?: boolean;
};

const defaultUnivisibleValues = {} as Record<string, boolean>;

export default function UsersTable({
  data,
  count,
  isLoading,
}: UsersTableProps) {
  const navigate = useNavigate();
  const { rightClickedRowId, rightClickCellValue, rightClickedCellId } =
    useDataTableStore();

  const { table } = useDataTable({
    columns: useUserColumns(),
    data,
    pageCount: count,
    initialState: {
      columnVisibility: {
        ...defaultUnivisibleValues,
      },
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
    getRowId: (row) => row.id,
  });

  const handleCopy = async () => {
    try {
      if (rightClickCellValue && rightClickedCellId) {
        await navigator.clipboard.writeText(rightClickCellValue as string);
      }
      // maybe use toast
    } catch {
      // ignore
    }
  };

  return (
    <DataTable
      actions={
        <DataTableActions
          onCopy={handleCopy}
          onDelete={() =>
            rightClickedRowId && console.log("Delete", rightClickedRowId)
          }
          onEdit={() =>
            rightClickedRowId && navigate(`${rightClickedRowId}/edit`)
          }
          onView={() => rightClickedRowId && navigate(rightClickedRowId)}
        />
      }
      className="h-full"
      isLoading={isLoading}
      table={table}
    >
      <DataTableControls table={table}>
        <DataTableToolbar table={table} />
      </DataTableControls>
    </DataTable>
  );
}
