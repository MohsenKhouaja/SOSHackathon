import {
    boolean,
    date,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { home } from "./home";

export const child = pgTable("child", {
    id: uuid("id").primaryKey().defaultRandom(),
    homeId: uuid("home_id")
        .notNull()
        .references(() => home.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    gender: text("gender"),
    admissionDate: date("admission_date"),
    medicalNotes: text("medical_notes"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
