import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

export const useHomes = (input: { page: number; limit: number }) => {
  return trpc.homes.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

