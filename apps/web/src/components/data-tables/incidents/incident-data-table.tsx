import { DataTable } from "@repo/ui/components/data-table/data-table";
import {
  type DataTableActionButtonsProps,
  DataTableControls,
} from "@repo/ui/components/data-table/data-table-controls";
import { DataTableToolbar } from "@repo/ui/components/data-table/data-table-toolbar";
import { Button } from "@repo/ui/components/ui/button";
import { useDataTable } from "@repo/ui/hooks/use-data-table";
import { useDataTableStore } from "@repo/ui/stores/data-table-store";
import { ShieldCheck, Eye, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useIncidentColumns, type IncidentRow } from "./incident-data-table-columns";
import { IncidentMobileCard } from "./incident-mobile-card";
import { useUpdateIncidentStatusMutation } from "@/api/mutations/incident-mutations";

interface IncidentTableProps {
  data: IncidentRow[];
  count: number;
  isPending?: boolean;
}

export function IncidentTable({ data, count, isPending }: IncidentTableProps) {
  const navigate = useNavigate();
  const { mutate: updateStatus } = useUpdateIncidentStatusMutation();
  const { rightClickedRowId } = useDataTableStore();
  
  const columns = useIncidentColumns();

  const { table } = useDataTable({
    columns,
    data,
    pageCount: count,
    getRowId: (row) => row.id,
    initialState: {
        pagination: { pageSize: 10, pageIndex: 0 },
    },
    enableRowSelection: true,
  });

  const handleAssignToMe = (selectedRows: IncidentRow[]) => {
    if (selectedRows.length === 0) return;
    toast.success(`${selectedRows.length} incident(s) assigned to you.`);
    table.resetRowSelection();
  };

  const renderActionButtons = ({
    selectedRows,
  }: DataTableActionButtonsProps<IncidentRow>) => (
    <>
      <Button
        className="h-8 gap-2"
        onClick={() => handleAssignToMe(selectedRows)}
        size="sm"
        variant="outline"
      >
        <ShieldCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Assign & Review</span>
      </Button>
    </>
  );

  return (
    <DataTable
      className="h-full"
      table={table}
      isPending={isPending}
      mobileCard={({ row, isSelected, isSelectionMode }) => (
        <IncidentMobileCard
          row={row}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          table={table}
        />
      )}
      actions={
         <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
                if (rightClickedRowId) {
                    navigate(`${rightClickedRowId}`);
                }
            }}
         >
            <Eye className="mr-2 h-4 w-4" />
            View Details
         </Button>
      }
    >
      <DataTableControls table={table} actionButtons={renderActionButtons}>
        <DataTableToolbar table={table} filterState={table.getState().columnFilters} />
      </DataTableControls>
    </DataTable>
  );
}

