/**
 * Filter Operators
 * Centralized definition of query filter operators used across the query builder and filter merger.
 */

/**
 * Supported filter operators for query building
 */
export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "like"
  | "ilike"
  | "between"
  | "contains" // mapped to ilike %val%
  | "startsWith" // mapped to ilike val%
  | "endsWith" // mapped to ilike %val
  | "isNull" // null check
  | "isNotNull" // not null check
  | "notIlike"; // NOT ILIKE

/**
 * Array of all valid operator keys
 * Used for runtime validation of operator objects
 */
export const FILTER_OPERATORS: readonly FilterOperator[] = [
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "notIn",
  "like",
  "ilike",
  "notIlike",
  "between",
  "contains",
  "startsWith",
  "endsWith",
  "isNull",
  "isNotNull",
] as const;

/**
 * Type guard to check if a string is a valid FilterOperator
 */
export function isFilterOperator(key: string): key is FilterOperator {
  return (FILTER_OPERATORS as readonly string[]).includes(key);
}

/**
 * Type guard to check if an object is an operator object
 * (e.g., { eq: "value" }, { in: [...] }, { gt: 5 })
 */
export function isOperatorObject(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.some((k) => isFilterOperator(k));
}
