import { defineRelationsPart } from "drizzle-orm";
import * as schema from "./tables";

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    program: r.one.program({
      from: r.user.programId,
      to: r.program.id,
    }),
    home: r.one.home({
      from: r.user.homeId,
      to: r.home.id,
    }),
    // Reverse relations
    directedPrograms: r.many.program({
      from: r.user.id,
      to: r.program.directorId,
      alias: "director",
    }),
    motherHomes: r.many.home({
      from: r.user.id,
      to: r.home.motherId,
      alias: "mother",
    }),
    auntHomes: r.many.home({
      from: r.user.id,
      to: r.home.auntId,
      alias: "aunt",
    }),
    reportedIncidents: r.many.incidentReport({
      from: r.user.id,
      to: r.incidentReport.reporterId,
      alias: "reporter",
    }),
    abusedIncidents: r.many.incidentReport({
      from: r.user.id,
      to: r.incidentReport.abuserId,
      alias: "abuser",
    }),
    assignedIncidents: r.many.incidentReport({
      from: r.user.id,
      to: r.incidentReport.assignedTo,
      alias: "assignee",
    }),
    // Steps
    completedEvaluations: r.many.stepEvaluation({
      from: r.user.id,
      to: r.stepEvaluation.completedBy,
      alias: "completer",
    }),
    completedActionPlans: r.many.stepActionPlan({
      from: r.user.id,
      to: r.stepActionPlan.completedBy,
      alias: "completer",
    }),
    completedFollowUps: r.many.stepFollowUp({
      from: r.user.id,
      to: r.stepFollowUp.completedBy,
      alias: "completer",
    }),
    formalDecisions: r.many.stepFormalDecision({
      from: r.user.id,
      to: r.stepFormalDecision.directorId,
      alias: "director",
    }),
    // Other
    notifications: r.many.notification({
      from: r.user.id,
      to: r.notification.userId,
    }),
    auditLogs: r.many.auditLog({
      from: r.user.id,
      to: r.auditLog.userId,
    }),
  },
  program: {
    director: r.one.user({
      from: r.program.directorId,
      to: r.user.id,
      alias: "director",
    }),
    homes: r.many.home({
      from: r.program.id,
      to: r.home.programId,
    }),
    incidentReports: r.many.incidentReport({
      from: r.program.id,
      to: r.incidentReport.programId,
    }),
  },
  home: {
    program: r.one.program({
      from: r.home.programId,
      to: r.program.id,
    }),
    mother: r.one.user({
      from: r.home.motherId,
      to: r.user.id,
      alias: "mother",
    }),
    aunt: r.one.user({
      from: r.home.auntId,
      to: r.user.id,
      alias: "aunt",
    }),
    children: r.many.child({
      from: r.home.id,
      to: r.child.homeId,
    }),
    incidentReports: r.many.incidentReport({
      from: r.home.id,
      to: r.incidentReport.homeId,
    }),
  },
  child: {
    home: r.one.home({
      from: r.child.homeId,
      to: r.home.id,
    }),
    incidentReports: r.many.incidentReport({
      from: r.child.id,
      to: r.incidentReport.childId,
    }),
  },
  incidentReport: {
    reporter: r.one.user({
      from: r.incidentReport.reporterId,
      to: r.user.id,
      alias: "reporter",
    }),
    program: r.one.program({
      from: r.incidentReport.programId,
      to: r.program.id,
    }),
    home: r.one.home({
      from: r.incidentReport.homeId,
      to: r.home.id,
    }),
    child: r.one.child({
      from: r.incidentReport.childId,
      to: r.child.id,
    }),
    abuser: r.one.user({
      from: r.incidentReport.abuserId,
      to: r.user.id,
      alias: "abuser",
    }),
    assignee: r.one.user({
      from: r.incidentReport.assignedTo,
      to: r.user.id,
      alias: "assignee",
    }),
    attachments: r.many.reportAttachment({
      from: r.incidentReport.id,
      to: r.reportAttachment.reportId,
    }),
    evaluations: r.many.stepEvaluation({
      from: r.incidentReport.id,
      to: r.stepEvaluation.reportId,
    }),
    actionPlans: r.many.stepActionPlan({
      from: r.incidentReport.id,
      to: r.stepActionPlan.reportId,
    }),
    followUps: r.many.stepFollowUp({
      from: r.incidentReport.id,
      to: r.stepFollowUp.reportId,
    }),
    formalDecisions: r.many.stepFormalDecision({
      from: r.incidentReport.id,
      to: r.stepFormalDecision.reportId,
    }),
  },
  reportAttachment: {
    report: r.one.incidentReport({
      from: r.reportAttachment.reportId,
      to: r.incidentReport.id,
    }),
  },
  stepEvaluation: {
    report: r.one.incidentReport({
      from: r.stepEvaluation.reportId,
      to: r.incidentReport.id,
    }),
    completer: r.one.user({
      from: r.stepEvaluation.completedBy,
      to: r.user.id,
      alias: "completer",
    }),
  },
  stepActionPlan: {
    report: r.one.incidentReport({
      from: r.stepActionPlan.reportId,
      to: r.incidentReport.id,
    }),
    completer: r.one.user({
      from: r.stepActionPlan.completedBy,
      to: r.user.id,
      alias: "completer",
    }),
  },
  stepFollowUp: {
    report: r.one.incidentReport({
      from: r.stepFollowUp.reportId,
      to: r.incidentReport.id,
    }),
    completer: r.one.user({
      from: r.stepFollowUp.completedBy,
      to: r.user.id,
      alias: "completer",
    }),
  },
  stepFormalDecision: {
    report: r.one.incidentReport({
      from: r.stepFormalDecision.reportId,
      to: r.incidentReport.id,
    }),
    director: r.one.user({
      from: r.stepFormalDecision.directorId,
      to: r.user.id,
      alias: "director",
    }),
  },
  notification: {
    user: r.one.user({
      from: r.notification.userId,
      to: r.user.id,
    }),
  },
  auditLog: {
    user: r.one.user({
      from: r.auditLog.userId,
      to: r.user.id,
    }),
  },
  locations: {},
}));

export * from "./tables";
