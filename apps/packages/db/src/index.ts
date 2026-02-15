import { logger } from "@repo/logger";
import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "./env";
import { relations } from "./schemas/relations";

// Use type inference from drizzle function return
const db = drizzle(env.DB_URL, { relations });

// Export DBContext type for use in other packages
export type DBContext = typeof db;

logger.info("Express is connected to Postgres!");

// Export for better-auth adapter
export { db };

// Export filter operators
export * from "./filter-operators";
// Export type utilities
export * from "./types";
