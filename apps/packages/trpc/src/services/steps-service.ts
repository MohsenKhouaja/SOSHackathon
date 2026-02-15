import type { DBContext } from "@repo/db";
import {
    stepActionPlan,
    stepEvaluation,
    stepFollowUp,
    stepFormalDecision,
    incidentReport,
} from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
    CreateActionPlanInput,
    CreateEvaluationInput,
    CreateFollowUpInput,
    CreateFormalDecisionInput,
    FindStepByReportIdInput,
    UpdateActionPlanInput,
    UpdateEvaluationInput,
    UpdateFollowUpInput,
    UpdateFormalDecisionInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";

const verifyReportAccess = async (db: DBContext, user: AuthenticatedUser, reportId: string) => {
    const report = await db.query.incidentReport.findFirst({
        where: { id: { eq: reportId } },
        columns: { programId: true }
    });
    if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });

    // Global check
    if (user.role === "NATIONAL_DIRECTOR") return true;

    // Program check
    if (user.programId && report.programId === user.programId) return true;

    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this report" });
};

// ===================== Evaluation =====================

export const createEvaluation = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateEvaluationInput
) => {
    await verifyReportAccess(db, user, input.reportId);

    // Who can evaluate? Psychologists, Program Directors.
    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Psychologists or Directors can create evaluations" });
    }

    const [created] = await db.insert(stepEvaluation).values({
        reportId: input.reportId,
        completedBy: user.id,
        evaluationDetails: input.evaluationDetails ?? null,
    }).returning();

    return created;
};

export const updateEvaluation = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UpdateEvaluationInput
) => {
    // Ideally verify access to the evaluation via reportId, but we only have evaluation ID here.
    // Need to fetch evaluation first.
    const existing = await db.query.stepEvaluation.findFirst({
        where: { id: { eq: input.id } },
        with: { report: true } // Assuming relation exists or fetch manually
    });

    // If relation not set up in Types yet, fetch manually.
    // Let's assume standard lookup for now.
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Evaluation not found" });

    await verifyReportAccess(db, user, existing.reportId);

    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    const [updated] = await db.update(stepEvaluation).set({
        evaluationDetails: input.evaluationDetails ?? existing.evaluationDetails,
        updatedAt: new Date(),
    }).where(eq(stepEvaluation.id, input.id)).returning();

    return updated;
};

export const getEvaluations = async (db: DBContext, user: AuthenticatedUser, input: FindStepByReportIdInput) => {
    await verifyReportAccess(db, user, input.reportId);
    return db.query.stepEvaluation.findMany({
        where: { reportId: { eq: input.reportId } },
        orderBy: desc(stepEvaluation.createdAt)
    });
};

// ===================== Action Plan =====================

export const createActionPlan = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateActionPlanInput
) => {
    await verifyReportAccess(db, user, input.reportId);

    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Psychologists or Directors can create action plans" });
    }

    const [created] = await db.insert(stepActionPlan).values({
        reportId: input.reportId,
        completedBy: user.id,
        proposedActions: input.proposedActions,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
    }).returning();

    return created;
};

export const updateActionPlan = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UpdateActionPlanInput
) => {
    const existing = await db.query.stepActionPlan.findFirst({ where: { id: { eq: input.id } } });
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Action Plan not found" });
    await verifyReportAccess(db, user, existing.reportId);

    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    const [updated] = await db.update(stepActionPlan).set({
        proposedActions: input.proposedActions ?? existing.proposedActions,
        targetDate: input.targetDate ? new Date(input.targetDate) : existing.targetDate,
        updatedAt: new Date(),
    }).where(eq(stepActionPlan.id, input.id)).returning();

    return updated;
};

export const getActionPlans = async (db: DBContext, user: AuthenticatedUser, input: FindStepByReportIdInput) => {
    await verifyReportAccess(db, user, input.reportId);
    return db.query.stepActionPlan.findMany({
        where: { reportId: { eq: input.reportId } },
        orderBy: desc(stepActionPlan.createdAt)
    });
};

// ===================== Follow Up =====================

export const createFollowUp = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateFollowUpInput
) => {
    await verifyReportAccess(db, user, input.reportId);

    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    const [created] = await db.insert(stepFollowUp).values({
        reportId: input.reportId,
        completedBy: user.id,
        followUpNotes: input.followUpNotes ?? null,
        isResolved: input.isResolved,
    }).returning();

    return created;
};

export const updateFollowUp = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UpdateFollowUpInput
) => {
    const existing = await db.query.stepFollowUp.findFirst({ where: { id: { eq: input.id } } });
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Follow Up not found" });
    await verifyReportAccess(db, user, existing.reportId);

    if (user.role !== "PSYCHOLOGIST" && user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    const [updated] = await db.update(stepFollowUp).set({
        followUpNotes: input.followUpNotes ?? existing.followUpNotes,
        isResolved: input.isResolved ?? existing.isResolved,
        updatedAt: new Date(),
    }).where(eq(stepFollowUp.id, input.id)).returning();

    return updated;
};

export const getFollowUps = async (db: DBContext, user: AuthenticatedUser, input: FindStepByReportIdInput) => {
    await verifyReportAccess(db, user, input.reportId);
    return db.query.stepFollowUp.findMany({
        where: { reportId: { eq: input.reportId } },
        orderBy: desc(stepFollowUp.createdAt)
    });
};

// ===================== Formal Decision =====================

export const createFormalDecision = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateFormalDecisionInput
) => {
    await verifyReportAccess(db, user, input.reportId);

    // Strict: Only Directors
    if (user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Directors can make formal decisions" });
    }

    const [created] = await db.insert(stepFormalDecision).values({
        reportId: input.reportId,
        directorId: user.id,
        decisionDetails: input.decisionDetails,
        actionsTaken: input.actionsTaken ?? null,
        finalStatus: input.finalStatus as any,
    }).returning();

    // Also update Report Status
    await db.update(incidentReport)
        .set({ status: input.finalStatus as any, updatedAt: new Date() })
        .where(eq(incidentReport.id, input.reportId));

    return created;
};

export const updateFormalDecision = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UpdateFormalDecisionInput
) => {
    const existing = await db.query.stepFormalDecision.findFirst({ where: { id: { eq: input.id } } });
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Format Decision not found" });
    await verifyReportAccess(db, user, existing.reportId);

    if (user.role !== "PROGRAM_DIRECTOR" && user.role !== "NATIONAL_DIRECTOR") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only Directors can update formal decisions" });
    }

    const [updated] = await db.update(stepFormalDecision).set({
        decisionDetails: input.decisionDetails ?? existing.decisionDetails,
        actionsTaken: input.actionsTaken ?? existing.actionsTaken,
        finalStatus: input.finalStatus ? (input.finalStatus as any) : existing.finalStatus,
        updatedAt: new Date(),
    }).where(eq(stepFormalDecision.id, input.id)).returning();

    if (input.finalStatus) {
        await db.update(incidentReport)
            .set({ status: input.finalStatus as any, updatedAt: new Date() })
            .where(eq(incidentReport.id, existing.reportId));
    }

    return updated;
};

export const getFormalDecisions = async (db: DBContext, user: AuthenticatedUser, input: FindStepByReportIdInput) => {
    await verifyReportAccess(db, user, input.reportId);
    return db.query.stepFormalDecision.findMany({
        where: { reportId: { eq: input.reportId } },
        orderBy: desc(stepFormalDecision.createdAt)
    });
};
