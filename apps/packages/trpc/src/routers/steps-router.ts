import { db } from "@repo/db";
import { loggingMiddleware, protectedProcedure, router } from "../trpc";
import { stepsValidators } from "@repo/validators";
import * as stepsService from "../services/steps-service";

export const stepsRouter = router({
    // Evaluation
    createEvaluation: protectedProcedure()
        .use(loggingMiddleware("Creating evaluation"))
        .input(stepsValidators.createEvaluation)
        .mutation(({ input, ctx }) => stepsService.createEvaluation(db, ctx.user!, input)),

    updateEvaluation: protectedProcedure()
        .use(loggingMiddleware("Updating evaluation"))
        .input(stepsValidators.updateEvaluation)
        .mutation(({ input, ctx }) => stepsService.updateEvaluation(db, ctx.user!, input)),

    getEvaluations: protectedProcedure()
        .use(loggingMiddleware("Fetching evaluations"))
        .input(stepsValidators.findByReportId)
        .query(({ input, ctx }) => stepsService.getEvaluations(db, ctx.user!, input)),

    // Action Plan
    createActionPlan: protectedProcedure()
        .use(loggingMiddleware("Creating action plan"))
        .input(stepsValidators.createActionPlan)
        .mutation(({ input, ctx }) => stepsService.createActionPlan(db, ctx.user!, input)),

    updateActionPlan: protectedProcedure()
        .use(loggingMiddleware("Updating action plan"))
        .input(stepsValidators.updateActionPlan)
        .mutation(({ input, ctx }) => stepsService.updateActionPlan(db, ctx.user!, input)),

    getActionPlans: protectedProcedure()
        .use(loggingMiddleware("Fetching action plans"))
        .input(stepsValidators.findByReportId)
        .query(({ input, ctx }) => stepsService.getActionPlans(db, ctx.user!, input)),

    // Follow Up
    createFollowUp: protectedProcedure()
        .use(loggingMiddleware("Creating follow up"))
        .input(stepsValidators.createFollowUp)
        .mutation(({ input, ctx }) => stepsService.createFollowUp(db, ctx.user!, input)),

    updateFollowUp: protectedProcedure()
        .use(loggingMiddleware("Updating follow up"))
        .input(stepsValidators.updateFollowUp)
        .mutation(({ input, ctx }) => stepsService.updateFollowUp(db, ctx.user!, input)),

    getFollowUps: protectedProcedure()
        .use(loggingMiddleware("Fetching follow ups"))
        .input(stepsValidators.findByReportId)
        .query(({ input, ctx }) => stepsService.getFollowUps(db, ctx.user!, input)),

    // Formal Decision
    createFormalDecision: protectedProcedure()
        .use(loggingMiddleware("Creating formal decision"))
        .input(stepsValidators.createFormalDecision)
        .mutation(({ input, ctx }) => stepsService.createFormalDecision(db, ctx.user!, input)),

    updateFormalDecision: protectedProcedure()
        .use(loggingMiddleware("Updating formal decision"))
        .input(stepsValidators.updateFormalDecision)
        .mutation(({ input, ctx }) => stepsService.updateFormalDecision(db, ctx.user!, input)),

    getFormalDecisions: protectedProcedure()
        .use(loggingMiddleware("Fetching formal decisions"))
        .input(stepsValidators.findByReportId)
        .query(({ input, ctx }) => stepsService.getFormalDecisions(db, ctx.user!, input)),
});
