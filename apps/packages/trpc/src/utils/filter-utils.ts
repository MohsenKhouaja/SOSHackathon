/** biome-ignore-all lint/suspicious/noExplicitAny: Utility function with flexible types */
import { and, ilike, inArray, type SQL, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

type FilterValue =
  | string
  | number
  | boolean
  | object
  | any[]
  | null
  | undefined;

type TableSchema = Record<string, any>;

/**
 * Safely converts cursor values based on column type.
 * Handles timestamp columns (createdAt, updatedAt, deletedAt) and string columns.
 *
 * @param columnKey - The column key/name being used for cursor pagination
 * @param rawCursor - The raw cursor value as a string
 * @returns Parsed cursor value as Date for timestamp columns, or string for others
 * @throws TRPCError if the cursor value is invalid
 *
 * @example
 * const cursorValue = parseCursorValue("createdAt", "2024-01-01T00:00:00.000Z");
 * // Returns: Date object
 *
 * @example
 * const cursorValue = parseCursorValue("id", "some-id-value");
 * // Returns: "some-id-value"
 */

export function parseCursorValue(
  columnKey: string,
  rawCursor: string
): string | Date {
  const isTimestampColumn =
    columnKey === "createdAt" ||
    columnKey === "updatedAt" ||
    columnKey === "deletedAt";

  if (isTimestampColumn) {
    const parsedDate = new Date(rawCursor);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid cursor value for column "${columnKey}"`,
      });
    }
    return parsedDate;
  }

  return rawCursor;
}

/**
 * Builds a SQL WHERE condition from filter entries
 * This works with both db.select().where() and db.query.table.findMany() where clause
 *
 * @param filterEntries - Array of [key, value] tuples from the filters object
 * @param tableSchema - The table schema object (e.g., vehicles, products, etc.)
 * @returns Combined SQL condition or undefined
 *
 * @example
 * // Usage with db.select().where()
 * const whereCondition = buildWhereCondition(filterEntries, vehicles);
 * const _count = await db
 *   .select({ count: count() })
 *   .from(vehicles)
 *   .where(whereCondition);
 *
 * @example
 * // Usage with db.query.vehicles.findMany()
 * const result = await db.query.vehicles.findMany({
 *   where: (fields, operators) =>
 *     mapFiltersToWhere(filterEntries, fields, operators),
 * });
 */
export const buildWhereCondition = (
  filterEntries: [string, FilterValue][] | undefined,
  tableSchema: TableSchema
): SQL | undefined => {
  if (!filterEntries || filterEntries.length === 0) return;

  const conditions = filterEntries
    .map(([key, value]) => {
      const column = tableSchema[key];
      if (!column) return null;

      // Handle array values (e.g., multi-select filters)
      if (Array.isArray(value)) {
        return inArray(column, value as any);
      }

      // Handle JSONB fields
      if ((column as any).dataType === "json") {
        // Handle nested objects (e.g., { fullName: "John" })
        if (typeof value === "object" && value !== null) {
          const jsonConditions = Object.entries(value).map(
            ([nestedKey, nestedValue]) => {
              // Use ->> to extract the text value and ILIKE for pattern matching
              const pattern = `%${nestedValue}%`;
              return sql`${column}->>${nestedKey} ILIKE ${pattern}`;
            }
          );
          return and(...jsonConditions);
        }

        // Fallback: search entire JSON as text
        const pattern = `%${value}%`;
        return sql`${column}::text ILIKE ${pattern}`;
      }

      // Handle ID fields (UUIDs) with exact matching
      // Common ID field patterns: *Id, id
      if (key === "id" || key.endsWith("Id")) {
        return sql`${column} = ${value}`;
      }

      // Handle regular string/text fields with ILIKE (case-insensitive)
      return ilike(column, `%${value}%`);
    })
    .filter((condition): condition is SQL => condition !== null);

  if (conditions.length === 0) return;

  return and(...conditions);
};
