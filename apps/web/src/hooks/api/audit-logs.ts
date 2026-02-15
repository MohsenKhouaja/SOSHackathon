import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import type { FindAuditLogsInput } from "@repo/validators";

export const useAuditLogs = (input: FindAuditLogsInput) => {
    return useQuery(trpc.audit.findMany.queryOptions(input));
};
