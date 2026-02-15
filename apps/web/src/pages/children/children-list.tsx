import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer } from "@/components/layouts/page-container";
import { Baby } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useChildren } from "@/api/queries/child-queries";
import { CreateChildDialog } from "@/components/dialogs/create-child-dialog";

export default function ChildrenList() {
  const { setHeader } = useAppHeaderStore();

  const { data, isLoading, isError, error } = useChildren({
    page: 1,
    limit: 50,
    with: { home: { columns: { name: true, programId: true } } }, // Fetch programId to help with creation if needed
  });

  useEffect(() => {
    setHeader({
      variant: "main",
      title: "Children",
      subtitle: "Manage children",
    });
  }, [setHeader]);

  if (isLoading) {
    return (
      <TablePageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading children...</p>
        </div>
      </TablePageContainer>
    );
  }

  if (isError) {
    return (
      <TablePageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-destructive">
            Error: {error?.message ?? "Failed to load children"}
          </p>
        </div>
      </TablePageContainer>
    );
  }

  const children = data?.data ?? [];

  return (
    <TablePageContainer>
      <GenericHeader
        className="sticky top-0 z-40 bg-background"
        icon={<Baby className="h-5 w-5 text-primary" />}
        subtitle="View and manage children"
        title="Children"
        variant="create"
        actions={<CreateChildDialog />}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <Link key={child.id} to={`/children/${child.id}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">
                  {child.firstName} {child.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">DOB:</span>{" "}
                  {child.dateOfBirth
                    ? format(new Date(child.dateOfBirth), "PP")
                    : "N/A"}
                </p>
                {child.gender && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Gender:</span> {child.gender}
                  </p>
                )}
                {child.home?.name && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Home:</span> {child.home.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {children.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <p className="text-muted-foreground">No children yet</p>
        </div>
      )}
    </TablePageContainer>
  );
}
