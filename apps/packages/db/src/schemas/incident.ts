import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth/auth-schema";
import { child } from "./child";
import {
    attachmentType,
    incidentStatus,
    incidentType,
    urgencyLevel,
} from "./enums";
import { home } from "./home";
import { program } from "./program";

export const incidentReport = pgTable("incident_report", {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
        .notNull()
        .references(() => user.id),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    programId: uuid("program_id")
        .notNull()
        .references(() => program.id),
    homeId: uuid("home_id").references(() => home.id),
    childId: uuid("child_id").references(() => child.id),
    childNameFallback: text("child_name_fallback"),
    abuserId: uuid("abuser_id").references(() => user.id),
    abuserName: text("abuser_name"),
    abuserRelation: text("abuser_relation"),
    type: incidentType("type").notNull(),
    urgencyLevel: urgencyLevel("urgency_level").notNull(),
    dateOfIncident: timestamp("date_of_incident"),
    description: text("description").notNull(),
    status: incidentStatus("status").notNull().default("PENDING"),
    inProgressAt: timestamp("in_progress_at"),
    assignedTo: uuid("assigned_to").references(() => user.id),
    aiSeverityScore: integer("ai_severity_score"),
    aiKeywordsDetected: text("ai_keywords_detected"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const reportAttachment = pgTable("report_attachment", {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
        .notNull()
        .references(() => incidentReport.id),
    fileUrl: text("file_url").notNull(),
    fileType: attachmentType("file_type").notNull(),
    originalFileName: text("original_file_name"),
    fileSizeBytes: integer("file_size_bytes"),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
