import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
    "EXTERNAL",
    "SOS_MEMBER",
    "SOS_AUNT",
    "EDUCATOR",
    "PSYCHOLOGIST",
    "PROGRAM_DIRECTOR",
    "NATIONAL_DIRECTOR",
]);

export const incidentType = pgEnum("incident_type", [
    "NON_SPECIFIED",
    "VIOLENCE_PHYSICAL",
    "VIOLENCE_SEXUAL",
    "VIOLENCE_PSYCHOLOGICAL",
    "NEGLECT",
    "HEALTH_EMERGENCY",
    "BEHAVIORAL_ISSUE",
    "PEER_CONFLICT",
    "OTHER",
]);

export const urgencyLevel = pgEnum("urgency_level", [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
]);

export const incidentStatus = pgEnum("incident_status", [
    "PENDING",
    "IN_PROGRESS",
    "CLOSED",
]);

export const attachmentType = pgEnum("attachment_type", [
    "PHOTO",
    "VIDEO",
    "AUDIO",
    "DOCUMENT",
]);

export const notificationType = pgEnum("notification_type", [
    "NEW_REPORT",
    "STATUS_UPDATE",
    "ASSIGNMENT",
    "DEADLINE_WARNING",
    "SYSTEM_ALERT",
]);
