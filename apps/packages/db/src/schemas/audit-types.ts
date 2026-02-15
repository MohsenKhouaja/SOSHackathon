import type { auditLog } from "./audit_log";

export type AuditLogRow = typeof auditLog.$inferSelect;
export type AuditLogInsert = typeof auditLog.$inferInsert;

export type AuditLogDetail = AuditLogRow;
