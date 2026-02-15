/** biome-ignore-all lint/suspicious/noExplicitAny: good use of any */
import type { ColumnDef } from "@tanstack/react-table";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

/**
 * Hook that parses filter values from URL query params and transforms them
 * into the operator-based format expected by the backend query builder.
 *
 * Transformation examples:
 * - dateRange: [Date, Date] -> { between: ["ISO", "ISO"] }
 * - text: "value" -> { ilike: "%value%" }
 * - multiSelect: ["a", "b"] -> { in: ["a", "b"] }
 */
export const useDataTableFilters = <T>(columns: ColumnDef<T>[]) => {
  const filterableColumns = useMemo(
    () =>
      columns
        .filter((column) => column.enableColumnFilter)
        .map((column) => ({
          id: column.id as string,
          variant: column.meta?.variant,
        })) || [],
    [columns]
  );

  const queryStates = filterableColumns.reduce(
    (acc: Record<string, any>, col) => {
      let parser: any;
      switch (col.variant) {
        case "text":
          parser = parseAsString;
          break;
        case "select":
        case "multiSelect":
          parser = parseAsArrayOf(parseAsString);
          break;
        case "number":
          parser = parseAsInteger;
          break;
        case "boolean":
          parser = parseAsBoolean;
          break;
        case "date":
          parser = parseAsIsoDateTime;
          break;
        case "dateRange":
          parser = parseAsArrayOf(parseAsIsoDateTime);
          break;
        case "range":
          // Date ranges and numeric ranges stored as string arrays
          parser = parseAsArrayOf(parseAsString);
          break;
        default:
          parser = parseAsString;
          break;
      }
      if (parser) {
        acc[col.id] = parser;
      }
      return acc;
    },
    {}
  );

  const rawFilters = useQueryStates(queryStates)[0];

  // Transform raw values to operator-wrapped format for backend
  const transformedFilters = useMemo(() => {
    const result: Record<string, any> = {};

    for (const col of filterableColumns) {
      const value = rawFilters[col.id];
      if (value === null || value === undefined) continue;

      switch (col.variant) {
        case "dateRange":
          // Convert [Date, Date] to { between: [ISO, ISO] }
          if (Array.isArray(value) && value.length === 2) {
            const [from, to] = value;
            result[col.id] = {
              between: [
                from instanceof Date ? from.toISOString() : from,
                to instanceof Date ? to.toISOString() : to,
              ],
            };
          }
          break;

        case "date":
          // Convert Date to { gte: ISO, lte: ISO } for same-day range
          if (value instanceof Date) {
            const startOfDay = new Date(value);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(value);
            endOfDay.setHours(23, 59, 59, 999);
            result[col.id] = {
              between: [startOfDay.toISOString(), endOfDay.toISOString()],
            };
          }
          break;

        case "text":
          // Convert to { ilike: "%value%" }
          if (typeof value === "string" && value.trim()) {
            result[col.id] = { ilike: `%${value}%` };
          }
          break;

        case "multiSelect":
          // Convert to { in: [...] }
          if (Array.isArray(value) && value.length > 0) {
            result[col.id] = { in: value };
          }
          break;

        case "select":
          // Convert to { eq: value }
          if (Array.isArray(value) && value.length > 0) {
            result[col.id] = { in: value };
          } else if (typeof value === "string") {
            result[col.id] = { eq: value };
          }
          break;

        case "boolean":
          // Convert to { eq: boolean }
          result[col.id] = { eq: value };
          break;

        case "number":
          // Convert to { eq: number }
          result[col.id] = { eq: value };
          break;

        case "range":
          // Convert to { between: [min, max] }
          if (Array.isArray(value) && value.length === 2) {
            result[col.id] = { between: value };
          }
          break;

        default:
          // Pass through as-is for unknown variants
          result[col.id] = value;
          break;
      }
    }

    return result;
  }, [rawFilters, filterableColumns]);

  return transformedFilters;
};
