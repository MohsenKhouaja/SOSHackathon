import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth/auth-schema";
import { incidentStatus } from "./enums";
import { incidentReport } from "./incident";

export const stepEvaluation = pgTable("step_evaluation", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => incidentReport.id),
    completedBy: uuid("completed_by").references(() => user.id),
    evaluationDetails: text("evaluation_details"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const stepActionPlan = pgTable("step_action_plan", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => incidentReport.id),
    completedBy: uuid("completed_by")
        .notNull()
        .references(() => user.id),
    proposedActions: text("proposed_actions").notNull(),
    targetDate: timestamp("target_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const stepFollowUp = pgTable("step_follow_up", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => incidentReport.id),
    completedBy: uuid("completed_by")
        .notNull()
        .references(() => user.id),
    followUpNotes: text("follow_up_notes"),
    isResolved: boolean("is_resolved").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const stepFormalDecision = pgTable("step_formal_decision", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => incidentReport.id),
    directorId: uuid("director_id")
        .notNull()
        .references(() => user.id),
    decisionDetails: text("decision_details").notNull(),
    actionsTaken: text("actions_taken"),
    finalStatus: incidentStatus("final_status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
