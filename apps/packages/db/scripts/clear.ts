import { logger } from "@repo/logger";
import { sql } from "drizzle-orm";
import { db } from "../src";

export async function clear() {
  logger.info("🗑️  Emptying the entire database");

  await db.transaction(async (tx) => {
    // Drop all tables
    const tableQuery = sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    const tables = await tx.execute(tableQuery);

    for (const row of tables) {
      if (typeof row.tablename === "string") {
        const tableName = row.tablename;
        logger.info(`🧨 Dropping table: ${tableName}`);
        await tx.execute(
          sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`)
        );
      }
    }

    // Drop all custom types (enums)
    logger.info("🔧 Dropping custom types (enums)...");
    const typesResult = await tx.execute(sql`
      SELECT typname 
      FROM pg_type t 
      JOIN pg_namespace n ON n.oid = t.typnamespace 
      WHERE n.nspname = 'public' 
      AND t.typtype = 'e'
    `);

    for (const row of typesResult) {
      const typeName = row.typname;
      logger.info(`🧨 Dropping type: ${typeName}`);
      await tx.execute(sql.raw(`DROP TYPE IF EXISTS "${typeName}" CASCADE;`));
    }

    // Drop drizzle schema
    await tx.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE;"));
    // await tx.execute(sql.raw(`CREATE SCHEMA drizzle;`));
  });

  logger.info("✅ Database emptied (tables and types)");
}

clear();
