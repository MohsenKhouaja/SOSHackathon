import { trpc } from "@/lib/trpc";
import { keepPreviousData } from "@tanstack/react-query";

interface AuditLogsInput {
  page: number;
  limit: number;
  tableName?: string;
  action?: string;
}

export const useAuditLogs = (input: AuditLogsInput) => {
  return trpc.audit.findManyPaginated.useQuery(input, {
    placeholderData: keepPreviousData,
  });
};

