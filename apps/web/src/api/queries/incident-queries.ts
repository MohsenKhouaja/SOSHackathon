import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";
import type { IncidentsPaginatedInput } from "@repo/validators";

export const useIncidentsQuery = (input: IncidentsPaginatedInput) => {
  return trpc.incidents.findMany.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

export const useIncidentQuery = (id: string) => {
  return trpc.incidents.findOne.useQuery({ where: { id } });
};

