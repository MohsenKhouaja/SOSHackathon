import type { notification } from "./notification";

export type NotificationRow = typeof notification.$inferSelect;
export type NotificationInsert = typeof notification.$inferInsert;

export type NotificationDetail = NotificationRow;
