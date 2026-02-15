import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import GenericHeader from "@/components/headers/generic-header";
import { TablePageContainer } from "@/components/layouts/page-container";
import { ScrollText } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/hooks/api/audit-logs";

const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-500 hover:bg-green-600",
    UPDATE: "bg-blue-500 hover:bg-blue-600",
    DELETE: "bg-red-500 hover:bg-red-600",
    LOGIN: "bg-purple-500 hover:bg-purple-600",
    STATUS_CHANGE: "bg-yellow-500 hover:bg-yellow-600",
};

export default function AuditLogsList() {
    const { setHeader } = useAppHeaderStore();
    const [tableFilter, setTableFilter] = useState<string | undefined>(undefined);
    const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);

    const { data, isLoading, isError, error } = useAuditLogs({
        page: 1,
        limit: 50,
        tableName: tableFilter,
        action: actionFilter,
    });

    useEffect(() => {
        setHeader({
            variant: "main",
            title: "Audit Logs",
            subtitle: "Track all system activity",
        });
    }, [setHeader]);

    if (isLoading) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">Loading audit logs...</p>
                </div>
            </TablePageContainer>
        );
    }

    if (isError) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-destructive">
                        Error: {error?.message ?? "Failed to load audit logs"}
                    </p>
                </div>
            </TablePageContainer>
        );
    }

    const logs = data?.items ?? [];

    const TABLE_NAMES = ["incident_report", "child", "program", "home", "user", "notification"];
    const ACTIONS = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN"];

    return (
        <TablePageContainer>
            <GenericHeader
                className="sticky top-0 z-40 bg-background"
                icon={<ScrollText className="h-5 w-5 text-muted-foreground" />}
                subtitle={`${data?.pagination.total ?? 0} entries`}
                title="Audit Logs"
                variant="main"
            />
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    type="button"
                    variant={tableFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTableFilter(undefined)}
                    onKeyDown={(e) => { if (e.key === "Enter") setTableFilter(undefined); }}
                >
                    All Tables
                </Button>
                {TABLE_NAMES.map((t) => (
                    <Button
                        key={t}
                        type="button"
                        variant={tableFilter === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTableFilter(t)}
                        onKeyDown={(e) => { if (e.key === "Enter") setTableFilter(t); }}
                    >
                        {t.replaceAll("_", " ")}
                    </Button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    type="button"
                    variant={actionFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActionFilter(undefined)}
                    onKeyDown={(e) => { if (e.key === "Enter") setActionFilter(undefined); }}
                >
                    All Actions
                </Button>
                {ACTIONS.map((a) => (
                    <Button
                        key={a}
                        type="button"
                        variant={actionFilter === a ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActionFilter(a)}
                        onKeyDown={(e) => { if (e.key === "Enter") setActionFilter(a); }}
                    >
                        {a.replaceAll("_", " ")}
                    </Button>
                ))}
            </div>
            <div className="grid gap-3">
                {logs.map((log) => (
                    <Card key={log.id} className="transition-colors hover:bg-muted/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">
                                    {log.action}
                                </CardTitle>
                                <Badge variant="outline">{log.tableName}</Badge>
                            </div>
                            <Badge className={ACTION_COLORS[log.action] ?? "bg-gray-500"}>
                                {log.action}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Record: {log.recordId.slice(0, 8)}...</span>
                                {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                <span>{format(new Date(log.createdAt), "PPpp")}</span>
                            </div>
                            {(log.oldValues || log.newValues) && (
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    {log.oldValues && (
                                        <div>
                                            <p className="font-medium text-muted-foreground">Old Values:</p>
                                            <pre className="mt-1 rounded bg-muted p-2 overflow-auto max-h-24">
                                                {log.oldValues}
                                            </pre>
                                        </div>
                                    )}
                                    {log.newValues && (
                                        <div>
                                            <p className="font-medium text-muted-foreground">New Values:</p>
                                            <pre className="mt-1 rounded bg-muted p-2 overflow-auto max-h-24">
                                                {log.newValues}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            {logs.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                    <ScrollText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No audit logs found</p>
                </div>
            )}
        </TablePageContainer>
    );
}
