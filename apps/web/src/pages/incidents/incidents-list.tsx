import { Button } from "@repo/ui/components/ui/button";
import { useDataTableFilters } from "@repo/ui/hooks/use-data-table-filters";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { incidentValidators } from "@repo/validators";
import { Plus, ShieldAlert } from "lucide-react";
import { parseAsInteger, parseAsJson, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useIncidentsQuery } from "@/api/queries/incident-queries";
import { IncidentTable } from "@/components/data-tables/incidents/incident-data-table";
import { useIncidentColumns, type IncidentRow } from "@/components/data-tables/incidents/incident-data-table-columns";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer } from "@/components/layouts/page-container";

const IncidentsList = () => {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [sort] = useQueryState(
    "sort",
    parseAsJson(
      incidentValidators.findManyPaginatedInput.pick({
        sortBy: true,
      }).shape.sortBy
    )
  );

  const columns = useIncidentColumns();
  const where = useDataTableFilters<IncidentRow>(columns);
  const { setHeader } = useAppHeaderStore();

  useEffect(() => {
    setHeader({
      variant: "main",
      title: "Protection",
      subtitle: "Manage and track incident reports",
    });
  }, [setHeader]);

  const { data, isPending, isError, error } = useIncidentsQuery({
    limit: perPage,
    page,
    sortBy: sort ?? [{ id: "createdAt", desc: true }],
    where,
  });

  if (isError) toast.error(error.message || "Error fetching incidents");

  const navigate = useNavigate();

  const headerActions = (
    <>
      <Button
        className="hidden md:inline-flex"
        onClick={() => navigate("create")}
        variant="destructive"
      >
        <Plus className="mr-2 h-4 w-4" />
        Report Incident
      </Button>
      <Button
        className="inline-flex rounded-xl md:hidden"
        onClick={() => navigate("create")}
        size="icon-lg"
        variant="destructive"
      >
        <Plus />
      </Button>
    </>
  );

  return (
    <TablePageContainer>
      <GenericHeader
        actions={headerActions}
        className="sticky top-0 z-40 bg-background"
        icon={<ShieldAlert className="h-5 w-5 text-destructive" />}
        subtitle="Chronological registry of child protection alerts"
        title="Incidents"
        variant="create"
      />
      <div className="min-h-0 flex-1">
        <IncidentTable
          count={data?.pagination?.totalPages ?? 0}
          data={data?.data || []}
          isPending={isPending}
        />
      </div>
    </TablePageContainer>
  );
};

export default IncidentsList;
