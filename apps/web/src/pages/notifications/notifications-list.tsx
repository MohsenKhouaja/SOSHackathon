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
import { Bell, Check, Trash2 } from "lucide-react";
import { useAppHeaderStore } from "@repo/ui/stores/app-header-store";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    useNotifications,
    useMarkAsRead,
    useDeleteNotification,
} from "@/hooks/api/notifications";

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
    NEW_REPORT: "New Report",
    STATUS_UPDATE: "Status Update",
    ASSIGNMENT: "Assignment",
    DEADLINE_WARNING: "Deadline",
    SYSTEM_ALERT: "System Alert",
};

const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
    NEW_REPORT: "bg-blue-500 hover:bg-blue-600",
    STATUS_UPDATE: "bg-green-500 hover:bg-green-600",
    ASSIGNMENT: "bg-purple-500 hover:bg-purple-600",
    DEADLINE_WARNING: "bg-yellow-500 hover:bg-yellow-600",
    SYSTEM_ALERT: "bg-red-500 hover:bg-red-600",
};

export default function NotificationsList() {
    const { setHeader } = useAppHeaderStore();
    const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);

    const { data, isLoading, isError, error } = useNotifications({
        page: 1,
        limit: 50,
        isRead: filterRead,
    });

    const markAsRead = useMarkAsRead();
    const deleteNotification = useDeleteNotification();

    useEffect(() => {
        setHeader({
            variant: "main",
            title: "Notifications",
            subtitle: "Stay up to date with activity",
        });
    }, [setHeader]);

    const handleMarkAsRead = (ids: string[]) => {
        markAsRead.mutate({ ids });
    };

    const handleDelete = (id: string) => {
        deleteNotification.mutate(id);
    };

    if (isLoading) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">Loading notifications...</p>
                </div>
            </TablePageContainer>
        );
    }

    if (isError) {
        return (
            <TablePageContainer>
                <div className="flex h-40 items-center justify-center">
                    <p className="text-destructive">
                        Error: {error?.message ?? "Failed to load notifications"}
                    </p>
                </div>
            </TablePageContainer>
        );
    }

    const notifications = data?.items ?? [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <TablePageContainer>
            <GenericHeader
                className="sticky top-0 z-40 bg-background"
                icon={<Bell className="h-5 w-5 text-primary" />}
                subtitle={`${unreadCount} unread`}
                title="Notifications"
                variant="main"
                actions={
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={filterRead === undefined ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterRead(undefined)}
                            onKeyDown={(e) => { if (e.key === "Enter") setFilterRead(undefined); }}
                        >
                            All
                        </Button>
                        <Button
                            type="button"
                            variant={filterRead === false ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterRead(false)}
                            onKeyDown={(e) => { if (e.key === "Enter") setFilterRead(false); }}
                        >
                            Unread
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsRead(notifications.filter((n) => !n.isRead).map((n) => n.id))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleMarkAsRead(notifications.filter((n) => !n.isRead).map((n) => n.id));
                                }}
                            >
                                <Check className="mr-1 h-4 w-4" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                }
            />
            <div className="grid gap-3">
                {notifications.map((notification) => (
                    <Card
                        key={notification.id}
                        className={`transition-colors ${!notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : "opacity-75"}`}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">
                                    {notification.message}
                                </CardTitle>
                                {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={NOTIFICATION_TYPE_COLORS[notification.type] ?? "default"}>
                                    {NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type}
                                </Badge>
                                <div className="flex gap-1">
                                    {!notification.isRead && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleMarkAsRead([notification.id])}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleMarkAsRead([notification.id]); }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => handleDelete(notification.id)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleDelete(notification.id); }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), "PPpp")}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {notifications.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center gap-2">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        {filterRead === false ? "No unread notifications" : "No notifications yet"}
                    </p>
                </div>
            )}
        </TablePageContainer>
    );
}
