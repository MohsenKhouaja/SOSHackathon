import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { childValidators } from "@repo/validators";
import * as childService from "../services/child-service";

export const childrenRouter = router({
  findMany: protectedProcedure()
    .use(loggingMiddleware("Fetching children"))
    .input(childValidators.findManyPaginatedInput)
    .query(({ input, ctx }) => childService.findMany(db, ctx.user!, input)),

  findOne: protectedProcedure()
    .use(loggingMiddleware("Fetching child"))
    .input(childValidators.findOneInput)
    .query(({ input, ctx }) => childService.findOne(db, ctx.user!, input)),

  create: protectedProcedure()
    .use(loggingMiddleware("Creating child"))
    .input(childValidators.createInput)
    .mutation(({ input, ctx }) => childService.create(db, ctx.user!, input)),

  update: protectedProcedure()
    .use(loggingMiddleware("Updating child"))
    .input(childValidators.updateInput)
    .mutation(({ input, ctx }) => childService.update(db, ctx.user!, input)),

  remove: protectedProcedure()
    .use(loggingMiddleware("Deleting children"))
    .input(childValidators.deleteInput)
    .mutation(({ input, ctx }) => childService.remove(db, ctx.user!, input)),
});
