/**
 * Transform Data Table Filters for Backend
 *
 * Converts the frontend filter format [{id, value, variant, operator}]
 * to backend format { key: { operator: value } }
 */

import type { ColumnDef } from "@tanstack/react-table";
import type {
  ExtendedColumnFilter,
  FilterOperator,
  FilterVariant,
} from "../types/data-table";

// Regex pattern for relative date values - defined at top level for performance
const RELATIVE_DATE_REGEX = /^(-?\d+)_(\w+)$/;

// Regex pattern for ISO date strings (YYYY-MM-DD...) - defined at top level for performance
const ISO_DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}/;

/**
 * Maps frontend operators to backend operators
 */
const operatorMap: Record<string, string> = {
  // Text operators
  iLike: "ilike",
  notILike: "notIlike",
  startsWith: "startsWith",
  endsWith: "endsWith",

  // Array operators
  inArray: "in",
  notInArray: "notIn",

  // Between
  isBetween: "between",

  // Null checks
  isEmpty: "isNull",
  isNotEmpty: "isNotNull",

  // Pass-through: eq, ne, lt, lte, gt, gte
};

/**
 * Transform relative date value to date range for backend.
 * Value format: "[-]{number}_{unit}" e.g., "-7_days", "30_days"
 * Returns a [startDate, endDate] tuple as ISO strings for the backend's "between" operator.
 */
function transformRelativeDateValue(value: string): [string, string] {
  const match = value.match(RELATIVE_DATE_REGEX);
  if (!match) {
    // Fallback to today's range
    const now = new Date().toISOString();
    return [now, now];
  }

  const [, numStr, unit] = match;
  const num = Number.parseInt(numStr ?? "0", 10);
  const now = new Date();
  const target = new Date();

  switch (unit) {
    case "days":
      target.setDate(now.getDate() + num);
      break;
    case "weeks":
      target.setDate(now.getDate() + num * 7);
      break;
    case "months":
      target.setMonth(now.getMonth() + num);
      break;
    case "years":
      target.setFullYear(now.getFullYear() + num);
      break;
    default:
      // Unknown unit - no change
      break;
  }

  // Return range: [earlier, later] as ISO strings
  return num < 0
    ? [target.toISOString(), now.toISOString()]
    : [now.toISOString(), target.toISOString()];
}

/**
 * Transform value based on filter variant and operator
 */
function transformValue(
  variant: FilterVariant,
  operator: FilterOperator,
  value: string | string[]
): unknown {
  // Empty/NotEmpty don't need values
  if (operator === "isEmpty" || operator === "isNotEmpty") {
    return true;
  }

  switch (variant) {
    case "text":
      // iLike wraps with % for LIKE pattern
      if (operator === "iLike" || operator === "notILike") {
        return `%${value}%`;
      }
      // startsWith uses trailing %
      if (operator === "startsWith") {
        return `${value}%`;
      }
      // endsWith uses leading %
      if (operator === "endsWith") {
        return `%${value}`;
      }
      return value;

    case "number":
    case "range":
      if (Array.isArray(value)) {
        return value.map(Number); // [min, max] for between
      }
      return Number(value);

    case "date":
    case "dateRange":
      // Handle relative date filters (e.g., "last 7 days", "next 30 days")
      if (operator === "isRelativeToToday" && typeof value === "string") {
        return transformRelativeDateValue(value);
      }
      if (Array.isArray(value)) {
        // Values may be ISO strings (from parseAsIsoDateTime) or timestamps
        return value.map((v) => {
          // If already an ISO string, pass through
          if (typeof v === "string" && ISO_DATE_STRING_REGEX.test(v)) {
            return v;
          }
          // Legacy: convert numeric timestamp to ISO string
          return new Date(Number(v)).toISOString();
        });
      }
      // Single value - check if already ISO string
      if (typeof value === "string" && ISO_DATE_STRING_REGEX.test(value)) {
        return value;
      }
      // Legacy: timestamp string - convert to ISO string
      return new Date(Number(value)).toISOString();

    case "boolean":
      return value === "true";

    case "select":
      return value;

    case "multiSelect":
      // Already string[] - pass through
      return value;

    default:
      return value;
  }
}

/**
 * Get the backend operator name from frontend operator
 */
function mapOperator(operator: FilterOperator): string {
  return operatorMap[operator] ?? operator;
}

/**
 * Transform array of ExtendedColumnFilter to backend filter format.
 *
 * @param filters - Array of filters from data table filter menu
 * @param columns - Column definitions to get filterKey from meta
 * @returns Backend-compatible filter object
 *
 * @example
 * // Input:
 * [{ id: "sku", value: "ABC", variant: "text", operator: "iLike", filterId: "1" }]
 *
 * // Output:
 * { sku: { ilike: "%ABC%" } }
 */
export function transformFiltersForBackend<TData>(
  filters: ExtendedColumnFilter<TData>[],
  columns: ColumnDef<TData>[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const filter of filters) {
    // Skip empty values (except for isEmpty/isNotEmpty)
    if (
      filter.operator !== "isEmpty" &&
      filter.operator !== "isNotEmpty" &&
      (filter.value === "" ||
        filter.value === null ||
        filter.value === undefined ||
        (Array.isArray(filter.value) && filter.value.length === 0))
    ) {
      continue;
    }

    // Find column to get filterKey from meta
    const column = columns.find((c) => c.id === filter.id);

    // Use filterKey from column meta if available (for dot notation like "business.organization.name")
    // Otherwise fall back to column id
    const key = column?.meta?.filterKey ?? filter.id;

    // Transform operator and value
    const backendOp = mapOperator(filter.operator);
    const transformedValue = transformValue(
      filter.variant,
      filter.operator,
      filter.value
    );

    result[key] = { [backendOp]: transformedValue };
  }

  return result;
}

/**
 * Transform simple column filter value (from DataTableControls search) to backend format.
 *
 * @param columnId - The column ID or filterKey
 * @param value - The filter value (string for text search)
 * @returns Backend-compatible filter object
 *
 * @example
 * // Input: transformSimpleFilter("sku", "ABC")
 * // Output: { sku: { ilike: "%ABC%" } }
 */
export function transformSimpleFilter(
  columnId: string,
  value: string
): Record<string, unknown> {
  if (!value || value.trim() === "") {
    return {};
  }

  return {
    [columnId]: { ilike: `%${value.trim()}%` },
  };
}

/**
 * Combine multiple filter objects into one with AND logic
 */
export function combineFilters(
  ...filterObjects: Record<string, unknown>[]
): Record<string, unknown> {
  const nonEmpty = filterObjects.filter((f) => Object.keys(f).length > 0);

  if (nonEmpty.length === 0) {
    return {};
  }

  if (nonEmpty.length === 1) {
    return nonEmpty[0]!;
  }

  return {
    AND: nonEmpty,
  };
}
