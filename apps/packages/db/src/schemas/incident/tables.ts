import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  attachmentTypeEnum,
  incidentStatusEnum,
  incidentTypeEnum,
  notificationTypeEnum,
  urgencyLevelEnum,
} from "./enums";
import { user } from "../auth/auth-schema";

export const programs = pgTable("program", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  region: text("region"),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  directorId: text("director_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const homes = pgTable("home", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  capacity: integer("capacity").notNull().default(5),
  motherId: text("mother_id").references(() => user.id, { onDelete: "set null" }),
  auntId: text("aunt_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const children = pgTable("child", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeId: uuid("home_id").notNull().references(() => homes.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender"),
  admissionDate: date("admission_date"),
  medicalNotes: text("medical_notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const incidentReports = pgTable("incident_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: text("reporter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  programId: uuid("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
  homeId: uuid("home_id").references(() => homes.id, { onDelete: "set null" }),
  childId: uuid("child_id").references(() => children.id, { onDelete: "set null" }),
  childNameFallback: text("child_name_fallback"),
  abuserId: text("abuser_id").references(() => user.id, { onDelete: "set null" }),
  abuserName: text("abuser_name"),
  abuserRelation: text("abuser_relation"),
  type: incidentTypeEnum("type").notNull(),
  urgencyLevel: urgencyLevelEnum("urgency_level").notNull(),
  dateOfIncident: timestamp("date_of_incident"),
  description: text("description").notNull(),
  status: incidentStatusEnum("status").notNull().default("PENDING"),
  inProgressAt: timestamp("in_progress_at"),
  assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
  aiSeverityScore: integer("ai_severity_score"),
  aiKeywordsDetected: text("ai_keywords_detected"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const reportAttachments = pgTable("report_attachment", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => incidentReports.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileType: attachmentTypeEnum("file_type").notNull(),
  originalFileName: text("original_file_name"),
  fileSizeBytes: integer("file_size_bytes"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const stepEvaluations = pgTable("step_evaluation", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => incidentReports.id, { onDelete: "cascade" }),
  completedBy: text("completed_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stepActionPlans = pgTable("step_action_plan", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => incidentReports.id, { onDelete: "cascade" }),
  completedBy: text("completed_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  proposedActions: text("proposed_actions").notNull(),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stepFollowUps = pgTable("step_follow_up", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => incidentReports.id, { onDelete: "cascade" }),
  completedBy: text("completed_by").notNull().references(() => user.id, { onDelete: "cascade" }),
  followUpNotes: text("follow_up_notes"),
  isResolved: boolean("is_resolved").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stepFormalDecisions = pgTable("step_formal_decision", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => incidentReports.id, { onDelete: "cascade" }),
  directorId: text("director_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  decisionDetails: text("decision_details").notNull(),
  actionsTaken: text("actions_taken"),
  finalStatus: incidentStatusEnum("final_status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  ipAddress: text("ip_address"),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
