import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

export const usePrograms = (input: { page: number; limit: number }) => {
  return trpc.programs.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

