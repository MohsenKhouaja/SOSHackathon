import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { programValidators } from "@repo/validators";
import * as programService from "../services/program-service";

export const programsRouter = router({
  findMany: protectedProcedure()
    .use(loggingMiddleware("Fetching programs"))
    .input(programValidators.findManyPaginatedInput)
    .query(({ input, ctx }) => programService.findMany(db, ctx.user!, input)),

  findOne: protectedProcedure()
    .use(loggingMiddleware("Fetching program"))
    .input(programValidators.findOneInput)
    .query(({ input, ctx }) => programService.findOne(db, ctx.user!, input)),

  create: protectedProcedure()
    .use(loggingMiddleware("Creating program"))
    .input(programValidators.createInput)
    .mutation(({ input, ctx }) => programService.create(db, ctx.user!, input)),

  update: protectedProcedure()
    .use(loggingMiddleware("Updating program"))
    .input(programValidators.updateInput)
    .mutation(({ input, ctx }) => programService.update(db, ctx.user!, input)),

  remove: protectedProcedure("NATIONAL_DIRECTOR")
    .use(loggingMiddleware("Deleting programs"))
    .input(programValidators.deleteInput)
    .mutation(({ input, ctx }) => programService.remove(db, ctx.user!, input)),
});
