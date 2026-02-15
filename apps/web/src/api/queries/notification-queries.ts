import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

interface NotificationsInput {
  page: number;
  limit: number;
  isRead?: boolean;
}

export const useNotifications = (input: NotificationsInput) => {
  return trpc.notifications.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

