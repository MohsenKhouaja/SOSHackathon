import type { DBContext } from "@repo/db";
import { notification as notificationTable } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
    CreateNotificationInput,
    FindNotificationsInput,
    MarkAsReadInput,
    UpdateNotificationInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, eq, inArray, and } from "drizzle-orm";

export const findMany = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: FindNotificationsInput
) => {
    const { limit, page, userId, isRead, type } = input;
    const offset = (page - 1) * limit;

    try {
        // Users can only see their own notifications
        const targetUserId = userId || user.id;
        if (targetUserId !== user.id && user.role !== "NATIONAL_DIRECTOR") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Cannot view other users' notifications",
            });
        }

        const whereObj: Record<string, any> = { userId: targetUserId };
        if (isRead !== undefined) whereObj.isRead = isRead;
        if (type) whereObj.type = type;

        const data = await db.query.notification.findMany({
            where: whereObj,
            limit,
            offset,
            orderBy: { createdAt: "desc" },
        });

        const coreWhere = [eq(notificationTable.userId, targetUserId)];
        if (isRead !== undefined) coreWhere.push(eq(notificationTable.isRead, isRead));
        if (type) coreWhere.push(eq(notificationTable.type, type));

        const [totalResult] = await db
            .select({ count: count() })
            .from(notificationTable)
            .where(and(...coreWhere));

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
            message: `Failed to fetch notifications: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const create = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateNotificationInput
) => {
    try {
        // Only system/directors can create notifications
        // In practice, this would be called internally by other services
        if (user.role !== "NATIONAL_DIRECTOR" && user.role !== "PROGRAM_DIRECTOR") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient permissions to create notifications",
            });
        }

        const [newNotification] = await db
            .insert(notificationTable)
            .values({
                userId: input.userId,
                type: input.type as any,
                message: input.message,
                referenceId: input.referenceId ?? null,
                isRead: false,
            })
            .returning();

        if (!newNotification) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create notification",
            });
        }

        return newNotification;
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const markAsRead = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: MarkAsReadInput
) => {
    try {
        if (input.ids.length === 0) {
            return { updatedIds: [], count: 0 };
        }

        // Verify all notifications belong to the user
        const notifications = await db.query.notification.findMany({
            where: { id: { in: input.ids } },
            columns: { id: true, userId: true },
        });

        const unauthorized = notifications.some((n) => n.userId !== user.id);
        if (unauthorized) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Cannot mark other users' notifications as read",
            });
        }

        const result = await db
            .update(notificationTable)
            .set({ isRead: true, updatedAt: new Date() })
            .where(inArray(notificationTable.id, input.ids))
            .returning({ id: notificationTable.id });

        return {
            updatedIds: result.map((r) => r.id),
            count: result.length,
        };
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to mark notifications as read: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const remove = async (
    db: DBContext,
    user: AuthenticatedUser,
    id: string
) => {
    try {
        // Verify notification belongs to user
        const notification = await db.query.notification.findFirst({
            where: { id: id },
            columns: { userId: true },
        });

        if (!notification) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Notification not found",
            });
        }

        if (notification.userId !== user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Cannot delete other users' notifications",
            });
        }

        await db.delete(notificationTable).where(eq(notificationTable.id, id));

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete notification: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

// Helper function to create notifications (can be called by other services)
export const createSystemNotification = async (
    db: DBContext,
    input: CreateNotificationInput
) => {
    try {
        const [newNotification] = await db
            .insert(notificationTable)
            .values({
                userId: input.userId,
                type: input.type as any,
                message: input.message,
                referenceId: input.referenceId ?? null,
                isRead: false,
            })
            .returning();

        return newNotification;
    } catch (error: unknown) {
        // Log error but don't throw - notifications are non-critical
        console.error("Failed to create system notification:", error);
        return null;
    }
};
