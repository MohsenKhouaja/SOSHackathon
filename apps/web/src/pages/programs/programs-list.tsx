import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer as PageContainer } from "@/components/layouts/page-container";
import { CreateProgramDialog } from "@/components/dialogs/create-program-dialog";
import { usePrograms } from "@/hooks/api/programs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Building2, User } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { format } from "date-fns";

export default function ProgramsList() {
  const { data: programsData, isLoading, isError } = usePrograms({ page: 1, limit: 100 });
  const programs = programsData?.items || [];
  const { setHeader } = useAppHeaderStore();

  useEffect(() => {
    setHeader({
      variant: "default",
      title: "",
      subtitle: "",
    });
  }, [setHeader]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-destructive">Failed to load programs.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <GenericHeader
        icon={<Building2 className="h-5 w-5" />}
        title="Programs"
        subtitle="Manage your organization's programs"
        actions={<CreateProgramDialog />}
      />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs?.map((program) => (
            <Card key={program.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {program.name}
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{program.region ?? "No Region"}</div>
                <p className="text-xs text-muted-foreground">
                  {program.address}
                </p>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <User className="mr-1 h-3 w-3" />
                  Director: {program.directorId}
                  {/* Ideally we would fetch director name, or have it included in relation */}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Created {format(new Date(program.createdAt), "PPP")}
                </div>
              </CardContent>
            </Card>
          ))}
          {programs?.length === 0 && (
            <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
              <Building2 className="h-8 w-8 mb-2 opacity-50" />
              <p>No programs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
