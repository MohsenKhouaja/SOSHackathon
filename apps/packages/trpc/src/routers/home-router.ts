import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { homeValidators } from "@repo/validators";
import * as homeService from "../services/home-service";

export const homesRouter = router({
  findMany: protectedProcedure()
    .use(loggingMiddleware("Fetching homes"))
    .input(homeValidators.findManyPaginatedInput)
    .query(({ input, ctx }) => homeService.findMany(db, ctx.user!, input)),

  findOne: protectedProcedure()
    .use(loggingMiddleware("Fetching home"))
    .input(homeValidators.findOneInput)
    .query(({ input, ctx }) => homeService.findOne(db, ctx.user!, input)),

  create: protectedProcedure()
    .use(loggingMiddleware("Creating home"))
    .input(homeValidators.createInput)
    .mutation(({ input, ctx }) => homeService.create(db, ctx.user!, input)),

  update: protectedProcedure()
    .use(loggingMiddleware("Updating home"))
    .input(homeValidators.updateInput)
    .mutation(({ input, ctx }) => homeService.update(db, ctx.user!, input)),

  remove: protectedProcedure()
    .use(loggingMiddleware("Deleting homes"))
    .input(homeValidators.deleteInput)
    .mutation(({ input, ctx }) => homeService.remove(db, ctx.user!, input)),
});
