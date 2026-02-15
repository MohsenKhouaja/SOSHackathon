import type { DBContext } from "@repo/db";
import { auditLog as auditLogTable } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type { FindAuditLogsInput, CreateAuditLogInput } from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, eq, and } from "drizzle-orm";

const ALLOWED_VIEWER_ROLES = ["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR"];

export const findMany = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: FindAuditLogsInput
) => {
    const { limit, page, userId, action, tableName, recordId } = input;
    const offset = (page - 1) * limit;

    try {
        if (!ALLOWED_VIEWER_ROLES.includes(user.role ?? "")) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient permissions to view audit logs",
            });
        }

        const whereObj: Record<string, any> = {};
        if (userId) whereObj.userId = userId;
        if (action) whereObj.action = action;
        if (tableName) whereObj.tableName = tableName;
        if (recordId) whereObj.recordId = recordId;

        const data = await db.query.auditLog.findMany({
            where: whereObj,
            limit,
            offset,
            orderBy: { createdAt: "desc" },
        });

        const whereConditions = [];
        if (userId) whereConditions.push(eq(auditLogTable.userId, userId));
        if (action) whereConditions.push(eq(auditLogTable.action, action));
        if (tableName) whereConditions.push(eq(auditLogTable.tableName, tableName));
        if (recordId) whereConditions.push(eq(auditLogTable.recordId, recordId));
        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        const countQuery = whereClause
            ? db.select({ count: count() }).from(auditLogTable).where(whereClause)
            : db.select({ count: count() }).from(auditLogTable);

        const [totalResult] = await countQuery;
        const total = totalResult?.count ?? 0;

        return {
            items: data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch audit logs: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

// System-only: create an audit log entry (called by other services)
export const createSystemLog = async (
    db: DBContext,
    input: CreateAuditLogInput
) => {
    try {
        const [entry] = await db
            .insert(auditLogTable)
            .values({
                userId: input.userId,
                action: input.action,
                tableName: input.tableName,
                recordId: input.recordId,
                ipAddress: input.ipAddress ?? null,
                oldValues: input.oldValues ?? null,
                newValues: input.newValues ?? null,
            })
            .returning();

        return entry;
    } catch (error: unknown) {
        // Non-critical: log error but don't throw
        console.error("Failed to create audit log entry:", error);
        return null;
    }
};
