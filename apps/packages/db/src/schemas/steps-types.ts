import type { db } from "../../index";
import type {
    stepActionPlan,
    stepEvaluation,
    stepFollowUp,
    stepFormalDecision,
} from "./steps";

// Evaluation
export type StepEvaluation = typeof stepEvaluation.$inferSelect;
export type StepEvaluationInsert = typeof stepEvaluation.$inferInsert;

export type EvaluationFindManyArgs = NonNullable<
    Parameters<typeof db.query.stepEvaluation.findMany>[0]
>;
export type EvaluationFindFirstArgs = NonNullable<
    Parameters<typeof db.query.stepEvaluation.findFirst>[0]
>;
export type EvaluationWithOptions = NonNullable<EvaluationFindManyArgs["with"]>;
export type EvaluationWhereOptions = NonNullable<EvaluationFindManyArgs["where"]>;

// Action Plan
export type StepActionPlan = typeof stepActionPlan.$inferSelect;
export type StepActionPlanInsert = typeof stepActionPlan.$inferInsert;

export type ActionPlanFindManyArgs = NonNullable<
    Parameters<typeof db.query.stepActionPlan.findMany>[0]
>;
export type ActionPlanFindFirstArgs = NonNullable<
    Parameters<typeof db.query.stepActionPlan.findFirst>[0]
>;
export type ActionPlanWithOptions = NonNullable<ActionPlanFindManyArgs["with"]>;
export type ActionPlanWhereOptions = NonNullable<ActionPlanFindManyArgs["where"]>;

// Follow Up
export type StepFollowUp = typeof stepFollowUp.$inferSelect;
export type StepFollowUpInsert = typeof stepFollowUp.$inferInsert;

export type FollowUpFindManyArgs = NonNullable<
    Parameters<typeof db.query.stepFollowUp.findMany>[0]
>;
export type FollowUpFindFirstArgs = NonNullable<
    Parameters<typeof db.query.stepFollowUp.findFirst>[0]
>;
export type FollowUpWithOptions = NonNullable<FollowUpFindManyArgs["with"]>;
export type FollowUpWhereOptions = NonNullable<FollowUpFindManyArgs["where"]>;

// Formal Decision
export type StepFormalDecision = typeof stepFormalDecision.$inferSelect;
export type StepFormalDecisionInsert = typeof stepFormalDecision.$inferInsert;

export type FormalDecisionFindManyArgs = NonNullable<
    Parameters<typeof db.query.stepFormalDecision.findMany>[0]
>;
export type FormalDecisionFindFirstArgs = NonNullable<
    Parameters<typeof db.query.stepFormalDecision.findFirst>[0]
>;
export type FormalDecisionWithOptions = NonNullable<
    FormalDecisionFindManyArgs["with"]
>;
export type FormalDecisionWhereOptions = NonNullable<
    FormalDecisionFindManyArgs["where"]
>;
