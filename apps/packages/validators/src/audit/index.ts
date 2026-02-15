import { z } from "zod";

export const findAuditLogsInput = z.object({
    userId: z.string().optional(),
    action: z.string().optional(),
    tableName: z.string().optional(),
    recordId: z.string().uuid().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});

export const createAuditLogInput = z.object({
    userId: z.string(),
    action: z.string().min(1),
    tableName: z.string().min(1),
    recordId: z.string().uuid(),
    ipAddress: z.string().optional().nullable(),
    oldValues: z.string().optional().nullable(),
    newValues: z.string().optional().nullable(),
});

export type FindAuditLogsInput = z.infer<typeof findAuditLogsInput>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogInput>;

export const auditValidators = {
    findInput: findAuditLogsInput,
    createInput: createAuditLogInput,
};
