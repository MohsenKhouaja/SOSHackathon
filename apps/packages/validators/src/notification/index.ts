import { z } from "zod";

const notificationTypeEnum = z.enum([
    "NEW_REPORT",
    "STATUS_UPDATE",
    "ASSIGNMENT",
    "DEADLINE_WARNING",
    "SYSTEM_ALERT",
]);

export const createNotificationInput = z.object({
    userId: z.string(),
    type: notificationTypeEnum,
    message: z.string().min(1),
    referenceId: z.string().uuid().optional().nullable(),
});

export const updateNotificationInput = z.object({
    id: z.string().uuid(),
    isRead: z.boolean().optional(),
});

export const markAsReadInput = z.object({
    ids: z.array(z.string().uuid()),
});

export const findNotificationsInput = z.object({
    userId: z.string().optional(),
    isRead: z.boolean().optional(),
    type: notificationTypeEnum.optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});

export const deleteNotificationInput = z.object({
    id: z.string().uuid(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationInput>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationInput>;
export type MarkAsReadInput = z.infer<typeof markAsReadInput>;
export type FindNotificationsInput = z.infer<typeof findNotificationsInput>;
export type DeleteNotificationInput = z.infer<typeof deleteNotificationInput>;

export const notificationValidators = {
    createInput: createNotificationInput,
    updateInput: updateNotificationInput,
    markAsReadInput,
    findInput: findNotificationsInput,
    deleteInput: deleteNotificationInput,
};
