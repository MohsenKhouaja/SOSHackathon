import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { incidentValidators } from "@repo/validators";
import * as incidentService from "../services/incident-service";

export const incidentsRouter = router({
    findMany: protectedProcedure()
        .use(loggingMiddleware("Fetching incidents"))
        .input(incidentValidators.findManyPaginatedInput)
        .query(({ input, ctx }) => incidentService.findMany(db, ctx.user!, input)),

    findOne: protectedProcedure()
        .use(loggingMiddleware("Fetching incident"))
        .input(incidentValidators.findOneInput)
        .query(({ input, ctx }) => incidentService.findOne(db, ctx.user!, input)),

    create: protectedProcedure()
        .use(loggingMiddleware("Creating incident"))
        .input(incidentValidators.createInput)
        .mutation(({ input, ctx }) => incidentService.create(db, ctx.user!, input)),

    update: protectedProcedure()
        .use(loggingMiddleware("Updating incident"))
        .input(incidentValidators.updateInput)
        .mutation(({ input, ctx }) => incidentService.update(db, ctx.user!, input)),

    remove: protectedProcedure()
        .use(loggingMiddleware("Deleting incidents"))
        .input(incidentValidators.deleteInput)
        .mutation(({ input, ctx }) => incidentService.remove(db, ctx.user!, input)),
});
