import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { userValidators } from "@repo/validators";
import * as userService from "../services/user-service";

export const usersRouter = router({
    findMany: protectedProcedure()
        .use(loggingMiddleware("Fetching users"))
        .input(userValidators.findManyPaginatedInput)
        .query(({ input, ctx }) => userService.findMany(db, ctx.user!, input)),

    findOne: protectedProcedure()
        .use(loggingMiddleware("Fetching user"))
        .input(userValidators.findOneInput)
        .query(({ input, ctx }) => userService.findOne(db, ctx.user!, input)),

    create: protectedProcedure()
        .use(loggingMiddleware("Creating user"))
        .input(userValidators.createInput)
        .mutation(({ input, ctx }) => userService.create(db, ctx.user!, input)),

    update: protectedProcedure()
        .use(loggingMiddleware("Updating user"))
        .input(userValidators.updateInput)
        .mutation(({ input, ctx }) => userService.update(db, ctx.user!, input)),

    remove: protectedProcedure()
        .use(loggingMiddleware("Deleting users"))
        .input(userValidators.deleteInput)
        .mutation(({ input, ctx }) => userService.remove(db, ctx.user!, input)),
});
