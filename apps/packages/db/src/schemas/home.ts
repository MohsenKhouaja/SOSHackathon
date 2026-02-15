import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth/auth-schema";
import { program } from "./program";

export const home = pgTable("home", {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
        .notNull()
        .references(() => program.id),
    name: text("name").notNull(),
    address: text("address"),
    capacity: integer("capacity").notNull().default(5),
    motherId: uuid("mother_id").references(() => user.id),
    auntId: uuid("aunt_id").references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});
