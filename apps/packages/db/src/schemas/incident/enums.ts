import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "EXTERNAL",
  "SOS_MEMBER",
  "SOS_AUNT",
  "EDUCATOR",
  "PSYCHOLOGIST",
  "PROGRAM_DIRECTOR",
  "NATIONAL_DIRECTOR",
]);

export const incidentTypeEnum = pgEnum("incident_type", [
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

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const incidentStatusEnum = pgEnum("incident_status", [
  "PENDING",
  "IN_PROGRESS",
  "CLOSED",
]);

export const attachmentTypeEnum = pgEnum("attachment_type", [
  "PHOTO",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_REPORT",
  "STATUS_UPDATE",
  "ASSIGNMENT",
  "DEADLINE_WARNING",
  "SYSTEM_ALERT",
]);
