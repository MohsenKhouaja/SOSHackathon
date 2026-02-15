import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

if (!env.DB_URL) {
  throw new Error("DB_URL environment variable is required");
}
export default defineConfig({
  schema: "./src/schemas/tables.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
  //   verbose: true,
  strict: true,
});
