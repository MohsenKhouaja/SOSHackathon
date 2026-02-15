import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/ui/card";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer as PageContainer } from "@/components/layouts/page-container";
import { Users as UsersIcon, Mail, Phone, Building2, Home } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { useUsers } from "@/api/queries/user-queries";
import { CreateUserDialog } from "@/components/dialogs/create-user-dialog";
import { Badge } from "@repo/ui/components/ui/badge";

export default function UsersList() {
    const { setHeader } = useAppHeaderStore();

    const { data: usersData, isLoading, isError, error } = useUsers({
        page: 1,
        limit: 50,
    });

    useEffect(() => {
        setHeader({
            variant: "main",
            title: "Users",
            subtitle: "Manage users and roles",
        });
    }, [setHeader]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">Loading users...</p>
                </div>
            </PageContainer>
        );
    }

    if (isError) {
        return (
            <PageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-destructive">
                        Error: {error?.message ?? "Failed to load users"}
                    </p>
                </div>
            </PageContainer>
        );
    }

    const users = usersData?.items ?? [];

    return (
        <PageContainer>
            <GenericHeader
                className="sticky top-0 z-40 bg-background"
                icon={<UsersIcon className="h-5 w-5 text-primary" />}
                subtitle="Manage platform users"
                title="Users"
                variant="create"
                actions={<CreateUserDialog />}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                    <Card key={user.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">{user.name}</CardTitle>
                            <Badge variant="outline">{user.role.replace(/_/g, " ")}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm mt-3">
                            <div className="flex items-center text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" />
                                {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center text-muted-foreground">
                                    <Phone className="mr-2 h-4 w-4" />
                                    {user.phone}
                                </div>
                            )}
                            {user.programId && (
                                <div className="flex items-center text-muted-foreground">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Program: {user.programId}
                                </div>
                            )}
                            {user.homeId && (
                                <div className="flex items-center text-muted-foreground">
                                    <Home className="mr-2 h-4 w-4" />
                                    Home: {user.homeId}
                                </div>
                            )}
                            {/* Status indicator */}
                            <div className="flex items-center justify-end mt-2">
                                <Badge variant={user.banned ? "destructive" : "secondary"} className="text-xs">
                                    {user.banned ? "Banned" : (user.isActive ? "Active" : "Inactive")}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {users.length === 0 && (
                    <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                        <UsersIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p>No users found.</p>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
