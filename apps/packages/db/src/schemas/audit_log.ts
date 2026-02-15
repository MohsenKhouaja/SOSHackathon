import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth/auth-schema";

export const auditLog = pgTable("audit_log", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id),
    action: text("action").notNull(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    ipAddress: text("ip_address"),
    oldValues: text("old_values"),
    newValues: text("new_values"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
