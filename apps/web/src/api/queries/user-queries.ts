import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

export const useUsers = (input: { page: number; limit: number }) => {
  return trpc.users.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

