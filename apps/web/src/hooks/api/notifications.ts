import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateNotificationInput,
    FindNotificationsInput,
    MarkAsReadInput,
} from "@repo/validators";
import { toast } from "sonner";

export const useNotifications = (input: FindNotificationsInput) => {
    return useQuery(trpc.notifications.findMany.queryOptions(input));
};

export const useUnreadNotifications = (userId?: string) => {
    return useQuery(
        trpc.notifications.findMany.queryOptions({
            userId,
            isRead: false,
            page: 1,
            limit: 50,
        })
    );
};

export const useCreateNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateNotificationInput) =>
            trpc.notifications.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: trpc.notifications.findMany.queryKey(),
            });
            toast.success("Notification created");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create notification: ${error.message}`);
        },
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: MarkAsReadInput) =>
            trpc.notifications.markAsRead.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: trpc.notifications.findMany.queryKey(),
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to mark as read: ${error.message}`);
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            trpc.notifications.remove.mutate({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: trpc.notifications.findMany.queryKey(),
            });
            toast.success("Notification deleted");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete notification: ${error.message}`);
        },
    });
};
