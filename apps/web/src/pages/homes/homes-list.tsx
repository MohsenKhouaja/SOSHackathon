import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer as PageContainer } from "@/components/layouts/page-container";
import { Home as HomeIcon } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { useHomes } from "@/api/queries/home-queries";
import { CreateHomeDialog } from "@/components/dialogs/create-home-dialog";

export default function HomesList() {
  const { setHeader } = useAppHeaderStore();

  const { data: homesData, isLoading, isError, error } = useHomes({
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    setHeader({
      variant: "main",
      title: "Homes",
      subtitle: "Manage homes",
    });
  }, [setHeader]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Loading homes...</p>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex h-40 items-center justify-center">
          <p className="text-destructive">
            Error: {error?.message ?? "Failed to load homes"}
          </p>
        </div>
      </PageContainer>
    );
  }

  const homes = homesData?.items ?? [];

  return (
    <PageContainer>
      <GenericHeader
        className="sticky top-0 z-40 bg-background"
        icon={<HomeIcon className="h-5 w-5 text-primary" />}
        subtitle="View and manage homes"
        title="Homes"
        variant="create"
        actions={<CreateHomeDialog />}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {homes.map((home) => (
          <Card key={home.id}>
            <CardHeader>
              <CardTitle className="text-base">{home.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Capacity:</span> {home.capacity}
              </p>
              {home.address && (
                <p className="text-muted-foreground">
                  <span className="font-medium">Address:</span> {home.address}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {homes.length === 0 && (
          <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <HomeIcon className="h-8 w-8 mb-2 opacity-50" />
            <p>No homes found.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
