import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export const useMarkAsRead = () => {
  const utils = trpc.useUtils();
  return trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as read");
    },
  });
};

export const useDeleteNotification = () => {
  const utils = trpc.useUtils();
  return trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      toast.success("Notification deleted");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete notification");
    },
  });
};

