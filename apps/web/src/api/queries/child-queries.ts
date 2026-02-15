import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";
import type { ChildrenPaginatedInput } from "@repo/validators";

export const useChildren = (input: ChildrenPaginatedInput) => {
  return trpc.children.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

export const useChild = (id: string) => {
    return trpc.children.findOne.useQuery({ where: { id } });
}

