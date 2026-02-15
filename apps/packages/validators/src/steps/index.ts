import { z } from "zod";
import { incidentStatus } from "@repo/db/schemas/enums";

// Since drizzle enums are objects, redefine for Zod if needed or use string unions matching DB.
const IncidentStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

// Evaluation Validators
export const createEvaluationInput = z.object({
    reportId: z.string().uuid(),
    evaluationDetails: z.string().min(10).optional().nullable(),
    // completedBy is inferred from context user usually, but optional here
    completedBy: z.string().optional(),
});

export const updateEvaluationInput = z.object({
    reportId: z.string().uuid(), // To identify the step via relation or use ID if known. 
    // Ideally update via ID, but often UI works with Report ID "Get Evaluation for Report X".
    // Let's support both or stick to ID. Sticking to ID is safer REST/TRPC pattern unless 1:1.
    // The schema is 1:N (reportId not unique constraint in DB definition shown previously? 
    // Wait, steps tables usually 1:1 for a specific stage?
    // Previous schema logic implies 1 Evaluation per report or multiple?
    // Let's assume multiple is possible (history).
    id: z.string().uuid(),
    evaluationDetails: z.string().min(10).optional().nullable(),
});

// Action Plan Validators
export const createActionPlanInput = z.object({
    reportId: z.string().uuid(),
    proposedActions: z.string().min(10),
    targetDate: z.string().or(z.date()).optional().nullable(),
});

export const updateActionPlanInput = z.object({
    id: z.string().uuid(),
    proposedActions: z.string().min(10).optional(),
    targetDate: z.string().or(z.date()).optional().nullable(),
});

// Follow Up Validators
export const createFollowUpInput = z.object({
    reportId: z.string().uuid(),
    followUpNotes: z.string().optional().nullable(),
    isResolved: z.boolean(),
});

export const updateFollowUpInput = z.object({
    id: z.string().uuid(),
    followUpNotes: z.string().optional().nullable(),
    isResolved: z.boolean().optional(),
});

// Formal Decision Validators
export const createFormalDecisionInput = z.object({
    reportId: z.string().uuid(),
    decisionDetails: z.string().min(10),
    actionsTaken: z.string().optional().nullable(),
    finalStatus: IncidentStatusEnum,
});

export const updateFormalDecisionInput = z.object({
    id: z.string().uuid(),
    decisionDetails: z.string().min(10).optional(),
    actionsTaken: z.string().optional().nullable(),
    finalStatus: IncidentStatusEnum.optional(),
});

export const stepsValidators = {
    // Evaluation
    createEvaluation: createEvaluationInput,
    updateEvaluation: updateEvaluationInput,

    // Action Plan
    createActionPlan: createActionPlanInput,
    updateActionPlan: updateActionPlanInput,

    // Follow Up
    createFollowUp: createFollowUpInput,
    updateFollowUp: updateFollowUpInput,

    // Formal Decision
    createFormalDecision: createFormalDecisionInput,
    updateFormalDecision: updateFormalDecisionInput,

    // Generic Find Many by Report ID
    findByReportId: z.object({ reportId: z.string().uuid() }),
} as const;

export type CreateEvaluationInput = z.infer<typeof stepsValidators.createEvaluation>;
export type UpdateEvaluationInput = z.infer<typeof stepsValidators.updateEvaluation>;

export type CreateActionPlanInput = z.infer<typeof stepsValidators.createActionPlan>;
export type UpdateActionPlanInput = z.infer<typeof stepsValidators.updateActionPlan>;

export type CreateFollowUpInput = z.infer<typeof stepsValidators.createFollowUp>;
export type UpdateFollowUpInput = z.infer<typeof stepsValidators.updateFollowUp>;

export type CreateFormalDecisionInput = z.infer<typeof stepsValidators.createFormalDecision>;
export type UpdateFormalDecisionInput = z.infer<typeof stepsValidators.updateFormalDecision>;

export type FindStepByReportIdInput = z.infer<typeof stepsValidators.findByReportId>;
