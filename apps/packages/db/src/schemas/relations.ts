import { defineRelationsPart } from "drizzle-orm";
import * as schema from "./tables";

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    program: r.one.program({
      fields: [schema.user.programId],
      references: [schema.program.id],
    }),
    home: r.one.home({
      fields: [schema.user.homeId],
      references: [schema.home.id],
    }),
    // Reverse relations
    directedPrograms: r.many(schema.program, { relationName: "director" }),
    motherHomes: r.many(schema.home, { relationName: "mother" }),
    auntHomes: r.many(schema.home, { relationName: "aunt" }),
    reportedIncidents: r.many(schema.incidentReport, { relationName: "reporter" }),
    abusedIncidents: r.many(schema.incidentReport, { relationName: "abuser" }),
    assignedIncidents: r.many(schema.incidentReport, { relationName: "assignedTo" }),
    // Steps
    completedEvaluations: r.many(schema.stepEvaluation, { relationName: "completedBy" }),
    completedActionPlans: r.many(schema.stepActionPlan, { relationName: "completedBy" }),
    completedFollowUps: r.many(schema.stepFollowUp, { relationName: "completedBy" }),
    formalDecisions: r.many(schema.stepFormalDecision, { relationName: "director" }),
    // Other
    notifications: r.many(schema.notification),
    auditLogs: r.many(schema.auditLog),
  },
  program: {
    director: r.one.user({
      fields: [schema.program.directorId],
      references: [schema.user.id],
      relationName: "director",
    }),
    homes: r.many(schema.home),
    incidentReports: r.many(schema.incidentReport),
  },
  home: {
    program: r.one.program({
      fields: [schema.home.programId],
      references: [schema.program.id],
    }),
    mother: r.one.user({
      fields: [schema.home.motherId],
      references: [schema.user.id],
      relationName: "mother",
    }),
    aunt: r.one.user({
      fields: [schema.home.auntId],
      references: [schema.user.id],
      relationName: "aunt",
    }),
    children: r.many(schema.child),
    incidentReports: r.many(schema.incidentReport),
  },
  child: {
    home: r.one.home({
      fields: [schema.child.homeId],
      references: [schema.home.id],
    }),
    incidentReports: r.many(schema.incidentReport),
  },
  incidentReport: {
    reporter: r.one.user({
      fields: [schema.incidentReport.reporterId],
      references: [schema.user.id],
      relationName: "reporter",
    }),
    program: r.one.program({
      fields: [schema.incidentReport.programId],
      references: [schema.program.id],
    }),
    home: r.one.home({
      fields: [schema.incidentReport.homeId],
      references: [schema.home.id],
    }),
    child: r.one.child({
      fields: [schema.incidentReport.childId],
      references: [schema.child.id],
    }),
    abuser: r.one.user({
      fields: [schema.incidentReport.abuserId],
      references: [schema.user.id],
      relationName: "abuser",
    }),
    assignedTo: r.one.user({
      fields: [schema.incidentReport.assignedTo],
      references: [schema.user.id],
      relationName: "assignedTo",
    }),
    attachments: r.many(schema.reportAttachment),
    evaluations: r.many(schema.stepEvaluation),
    actionPlans: r.many(schema.stepActionPlan),
    followUps: r.many(schema.stepFollowUp),
    formalDecisions: r.many(schema.stepFormalDecision),
  },
  reportAttachment: {
    report: r.one.incidentReport({
      fields: [schema.reportAttachment.reportId],
      references: [schema.incidentReport.id],
    }),
  },
  stepEvaluation: {
    report: r.one.incidentReport({
      fields: [schema.stepEvaluation.reportId],
      references: [schema.incidentReport.id],
    }),
    completedBy: r.one.user({
      fields: [schema.stepEvaluation.completedBy],
      references: [schema.user.id],
      relationName: "completedBy",
    }),
  },
  stepActionPlan: {
    report: r.one.incidentReport({
      fields: [schema.stepActionPlan.reportId],
      references: [schema.incidentReport.id],
    }),
    completedBy: r.one.user({
      fields: [schema.stepActionPlan.completedBy],
      references: [schema.user.id],
      relationName: "completedBy",
    }),
  },
  stepFollowUp: {
    report: r.one.incidentReport({
      fields: [schema.stepFollowUp.reportId],
      references: [schema.incidentReport.id],
    }),
    completedBy: r.one.user({
      fields: [schema.stepFollowUp.completedBy],
      references: [schema.user.id],
      relationName: "completedBy",
    }),
  },
  stepFormalDecision: {
    report: r.one.incidentReport({
      fields: [schema.stepFormalDecision.reportId],
      references: [schema.incidentReport.id],
    }),
    director: r.one.user({
      fields: [schema.stepFormalDecision.directorId],
      references: [schema.user.id],
      relationName: "director",
    }),
  },
  notification: {
    user: r.one.user({
      fields: [schema.notification.userId],
      references: [schema.user.id],
    }),
  },
  auditLog: {
    user: r.one.user({
      fields: [schema.auditLog.userId],
      references: [schema.user.id],
    }),
  },
}));

export * from "./tables";
