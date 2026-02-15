/**
 * Secure Filter Merger Utility
 *
 * Intelligently merges base security filters with user-provided where filters.
 * Ensures that security constraints from base filters cannot be bypassed or overridden
 * by user input, while allowing user filters to add additional filtering within those boundaries.
 *
 * Priority Strategy:
 * - Base filters define security boundaries (organization scope, soft deletes, etc.)
 * - User where filters add additional constraints within those boundaries
 * - User filters CANNOT override or bypass base security filters
 * - Conflicts are resolved in favor of the more restrictive filter
 */

import { isOperatorObject } from "@repo/db/filter-operators";
import type { QueryFilters } from "@repo/db/query-builder";

/**
 * Type guard to check if a value is a QueryFilters object
 */
function isQueryFilters(value: unknown): value is QueryFilters {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Merges two operator objects, preferring the more restrictive constraint.
 * For conflicts, base filter takes precedence to maintain security.
 *
 * @param baseOperator - The security constraint operator
 * @param userOperator - The user-provided operator
 * @returns Merged operator object
 */
function mergeOperators(
  baseOperator: Record<string, unknown>,
  userOperator: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...baseOperator };

  for (const [key, value] of Object.entries(userOperator)) {
    // If base already has this operator, keep base (security first)
    if (key in merged) {
      // Special case: for 'in' operators, we can intersect the arrays
      if (key === "in" && Array.isArray(merged[key]) && Array.isArray(value)) {
        const baseArray = merged[key] as unknown[];
        const userArray = value as unknown[];
        // Only keep values that exist in both arrays (intersection)
        const intersection = userArray.filter((item) =>
          baseArray.some((baseItem) => baseItem === item)
        );
        if (intersection.length > 0) {
          merged[key] = intersection;
        }
        // If intersection is empty, keep base array (more restrictive)
      }
      // For other operators, base takes precedence
      continue;
    }

    // If base doesn't have this operator, add it (user is adding additional constraints)
    merged[key] = value;
  }

  return merged;
}

/**
 * Deep merges two filter objects, ensuring base security filters cannot be overridden.
 *
 * Rules:
 * 1. Base filters are always preserved
 * 2. User filters can add additional constraints
 * 3. When both define the same path, the more restrictive wins (usually base)
 * 4. Logical operators (AND, OR, NOT) are combined appropriately
 *
 * @param baseFilter - Security constraints that must be preserved
 * @param userFilter - User-provided filters to add within security boundaries
 * @returns Securely merged filter object
 */
function deepMergeFilters(
  baseFilter: QueryFilters,
  userFilter: QueryFilters
): QueryFilters {
  const merged: QueryFilters = {};

  // First, add all base filter keys (security constraints)
  for (const [key, baseValue] of Object.entries(baseFilter)) {
    if (baseValue === undefined || baseValue === null) continue;

    const userValue = userFilter[key];

    // Handle logical operators (AND, OR, NOT)
    if (key === "AND" || key === "OR") {
      const baseArray = Array.isArray(baseValue) ? baseValue : [baseValue];
      const userArray =
        userValue && Array.isArray(userValue) ? userValue : userValue ? [userValue] : [];

      // Filter to ensure all items are valid QueryFilters objects
      const validBaseArray = baseArray.filter(
        (item): item is QueryFilters =>
          item !== null && item !== undefined && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date)
      );
      const validUserArray = userArray.filter(
        (item): item is QueryFilters =>
          item !== null && item !== undefined && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date)
      );

      // For AND: combine both arrays (all conditions must be met)
      if (key === "AND") {
        const combined = [...validBaseArray, ...validUserArray];
        if (combined.length > 0) {
          merged[key] = combined;
        }
      }
      // For OR: base OR defines allowed alternatives, user OR adds more alternatives
      // Wrap both in AND to ensure security: must match (base_OR) AND (user_OR)
      else if (key === "OR") {
        if (validUserArray.length > 0) {
          // Both base and user have OR - wrap in AND to enforce both
          const andConditions: QueryFilters[] = [];
          
          if (validBaseArray.length > 0) {
            andConditions.push({ OR: validBaseArray } as QueryFilters);
          }
          if (validUserArray.length > 0) {
            andConditions.push({ OR: validUserArray } as QueryFilters);
          }
          
          // Add to existing AND array if present
          if (Array.isArray(merged.AND)) {
            merged.AND = [...(merged.AND as QueryFilters[]), ...andConditions] as QueryFilters[];
          } else {
            merged.AND = andConditions as QueryFilters[];
          }
          // Don't set merged[key] since we moved it to AND
        } else {
          // Only base has OR
          if (validBaseArray.length > 0) {
            merged[key] = validBaseArray;
          }
        }
      }
      continue;
    }

    if (key === "NOT") {
      // NOT is preserved from base (security constraint)
      merged[key] = baseValue;
      // User NOT is ignored to prevent bypassing security
      continue;
    }

    // If user doesn't have this key, just use base
    if (userValue === undefined || userValue === null) {
      merged[key] = baseValue;
      continue;
    }

    // Both base and user have this key - need to merge intelligently
    if (isQueryFilters(baseValue) && isQueryFilters(userValue)) {
      // Check if they're operator objects
      const baseIsOperator = isOperatorObject(baseValue);
      const userIsOperator = isOperatorObject(userValue);

      if (baseIsOperator && userIsOperator) {
        // Both are operator objects - merge operators
        merged[key] = mergeOperators(baseValue, userValue);
      } else if (baseIsOperator && !userIsOperator) {
        // Base is operator, user is nested filter - base wins (security)
        merged[key] = baseValue;
      } else if (!baseIsOperator && userIsOperator) {
        // Base is nested filter, user is operator - base wins (security)
        merged[key] = baseValue;
      } else {
        // Both are nested filters - recurse
        merged[key] = deepMergeFilters(baseValue, userValue);
      }
    } else {
      // One or both are primitive values - base wins (security)
      merged[key] = baseValue;
    }
  }

  // Second, add user filter keys that don't exist in base (additional constraints)
  for (const [key, userValue] of Object.entries(userFilter)) {
    if (userValue === undefined || userValue === null) continue;

    // Skip if already processed from base
    if (key in merged) continue;

    // Skip NOT from user input (could bypass security)
    if (key === "NOT") continue;

    // Add new user constraints
    if (key === "AND") {
      const userArray = Array.isArray(userValue) ? userValue : [userValue];
      const validUserArray = userArray.filter(
        (item): item is QueryFilters =>
          item !== null && item !== undefined && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date)
      );
      
      if (validUserArray.length > 0) {
        merged.AND = [
          ...(Array.isArray(merged.AND) ? (merged.AND as QueryFilters[]) : []),
          ...validUserArray,
        ] as QueryFilters[];
      }
    } else if (key === "OR") {
      // User OR without base OR - only allow if it doesn't conflict with existing constraints
      const userArray = Array.isArray(userValue) ? userValue : [userValue];
      const validUserArray = userArray.filter(
        (item): item is QueryFilters =>
          item !== null && item !== undefined && typeof item === "object" && !Array.isArray(item) && !(item instanceof Date)
      );
      
      if (validUserArray.length > 0) {
        // Check if we have any constraints other than AND
        const hasOtherConstraints = Object.keys(merged).some(k => k !== "AND");
        
        if (hasOtherConstraints || Array.isArray(merged.AND)) {
          // We have existing constraints - user OR must be combined with them
          // Add user OR as an AND condition to ensure all base constraints are met
          if (Array.isArray(merged.AND)) {
            merged.AND = [...(merged.AND as QueryFilters[]), { OR: validUserArray } as QueryFilters] as QueryFilters[];
          } else {
            merged.AND = [{ OR: validUserArray } as QueryFilters] as QueryFilters[];
          }
        } else {
          // No existing constraints, user OR can be used directly (unusual but valid)
          merged.OR = validUserArray;
        }
      }
    } else {
      // Regular field - add as-is
      merged[key] = userValue;
    }
  }

  // Clean up empty AND/OR arrays
  if (Array.isArray(merged.AND) && merged.AND.length === 0) {
    delete merged.AND;
  }
  if (Array.isArray(merged.OR) && merged.OR.length === 0) {
    delete merged.OR;
  }

  return merged;
}

/**
 * Merges base security filters with user-provided where filters.
 *
 * This function ensures that:
 * 1. Security constraints from baseFilter are always preserved
 * 2. User whereFilter can add additional filtering within those boundaries
 * 3. User whereFilter cannot override or bypass base security constraints
 * 4. When conflicts arise, the more restrictive filter (usually base) wins
 *
 * @param baseFilter - Security constraints (organization scope, soft deletes, etc.)
 * @param whereFilter - User-provided filters from input
 * @returns Securely merged QueryFilters
 *
 * @example
 * ```typescript
 * const baseFilter = {
 *   deletedAt: { isNull: true },
 *   businesses: { id: { eq: "user-business-id" } }
 * };
 *
 * const whereFilter = {
 *   status: { eq: "active" },
 *   businesses: { id: { eq: "different-business-id" } } // This will be intersected
 * };
 *
 * const merged = mergeSecureFilters(baseFilter, whereFilter);
 * // Result: Only allows "active" status within user's business scope
 * // Prevents accessing different-business-id
 * ```
 */
export function mergeSecureFilters(
  baseFilter: QueryFilters,
  whereFilter?: QueryFilters | null
): QueryFilters {
  // If no user filter, just return base (security constraints only)
  if (!whereFilter || typeof whereFilter !== "object") {
    return baseFilter;
  }

  // Deep merge with security-first priority
  return deepMergeFilters(baseFilter, whereFilter);
}

/**
 * Convenience function to prepare query filters for use with buildDrizzleQuery.
 * Combines base security filters with RBAC filters.
 *
 * @param baseFilter - Security constraints
 * @param rbacWhere - RBAC-filtered where (optional)
 * @returns Combined query filters ready for buildDrizzleQuery
 *
 * @example
 * ```typescript
 * const queryFilters = prepareQueryFilters(
 *   { programId: { eq: user.programId } },
 *   rbac.where
 * );
 * ```
 */
export function prepareQueryFilters(
  baseFilter: QueryFilters,
  rbacWhere?: QueryFilters | null
): QueryFilters {
  // Validate base filter
  if (!baseFilter || typeof baseFilter !== "object" || Array.isArray(baseFilter)) {
    throw new Error("baseFilter must be a valid QueryFilters object");
  }

  // Start with base filter (security constraints)
  let merged = { ...baseFilter };

  // Apply RBAC filters (they may restrict what user can access)
  if (rbacWhere && typeof rbacWhere === "object" && !Array.isArray(rbacWhere)) {
    merged = mergeSecureFilters(merged, rbacWhere);
  }

  return merged;
}
