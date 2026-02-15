import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer } from "@/components/layouts/page-container";
import { AlertTriangle } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useIncidents } from "@/hooks/api/incidents";
import { CreateIncidentDialog } from "@/components/dialogs/create-incident-dialog";

export default function IncidentsList() {
    const { setHeader } = useAppHeaderStore();

    const { data, isLoading, isError, error } = useIncidents({
        page: 1, limit: 50,
    });

    useEffect(() => {
        setHeader({
            variant: "main",
            title: "Incidents",
            subtitle: "Track and resolve incidents",
        });
    }, [setHeader]);

    if (isLoading) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">Loading incidents...</p>
                </div>
            </TablePageContainer>
        );
    }

    if (isError) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-destructive">
                        Error: {error?.message ?? "Failed to load incidents"}
                    </p>
                </div>
            </TablePageContainer>
        );
    }

    const incidents = data?.data ?? [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500 hover:bg-yellow-600";
            case "IN_PROGRESS": return "bg-blue-500 hover:bg-blue-600";
            case "RESOLVED": return "bg-green-500 hover:bg-green-600";
            case "CLOSED": return "bg-gray-500 hover:bg-gray-600";
            default: return "default";
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "CRITICAL": return "text-red-600 font-bold";
            case "HIGH": return "text-orange-600 font-bold";
            case "MEDIUM": return "text-yellow-600";
            case "LOW": return "text-green-600";
            default: return "";
        }
    };

    return (
        <TablePageContainer>
            <GenericHeader
                className="sticky top-0 z-40 bg-background"
                icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
                subtitle="Manage incident reports"
                title="Incidents"
                variant="create"
                actions={<CreateIncidentDialog />}
            />
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {incidents.map((incident) => (
                    <Link key={incident.id} to={`/incidents/${incident.id}`}>
                        <Card className="transition-colors hover:bg-muted/50 border-l-4" style={{
                            borderLeftColor: incident.urgencyLevel === "CRITICAL" ? "red" : incident.urgencyLevel === "HIGH" ? "orange" : "transparent"
                        }}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {incident.type}
                                </CardTitle>
                                <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Reported on {format(new Date(incident.createdAt), "PPP")}
                                </div>
                                <div className="text-sm line-clamp-2">
                                    {incident.description}
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs">
                                    <span className={getUrgencyColor(incident.urgencyLevel)}>
                                        {incident.urgencyLevel} URGENCY
                                    </span>
                                    <span>{incident.childNameFallback}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {incidents.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">No incidents reported</p>
                </div>
            )}
        </TablePageContainer>
    );
}
