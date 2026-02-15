import { db } from "@repo/db";
import { notificationValidators } from "@repo/validators";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import * as notificationService from "../services/notification-service";

export const notificationsRouter = router({
    findMany: protectedProcedure()
        .use(loggingMiddleware("Fetching notifications"))
        .input(notificationValidators.findInput)
        .query(({ input, ctx }) =>
            notificationService.findMany(db, ctx.user!, input)
        ),

    create: protectedProcedure()
        .use(loggingMiddleware("Creating notification"))
        .input(notificationValidators.createInput)
        .mutation(({ input, ctx }) =>
            notificationService.create(db, ctx.user!, input)
        ),

    markAsRead: protectedProcedure()
        .use(loggingMiddleware("Marking notifications as read"))
        .input(notificationValidators.markAsReadInput)
        .mutation(({ input, ctx }) =>
            notificationService.markAsRead(db, ctx.user!, input)
        ),

    remove: protectedProcedure()
        .use(loggingMiddleware("Deleting notification"))
        .input(notificationValidators.deleteInput)
        .mutation(({ input, ctx }) =>
            notificationService.remove(db, ctx.user!, input.id)
        ),
});
