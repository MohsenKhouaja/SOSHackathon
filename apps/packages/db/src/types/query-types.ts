/**
 * Query Type Utilities
 * 
 * Generic filter and query types.
 * Entity-specific types are in each schema folder.
 */

// =============================================================================
// Filter Operators
// =============================================================================

/**
 * Filter operators for query conditions
 */
export type FilterOperators<T> = {
  eq?: T;
  ne?: T;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  in?: T[];
  notIn?: T[];
  like?: string;
  ilike?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  isNull?: boolean;
  isNotNull?: boolean;
};

/**
 * Filter value - can be direct value or operator object
 */
export type FilterValue<T> = T | FilterOperators<T>;

// =============================================================================
// Generic Query Types
// =============================================================================

/**
 * With options for including relations.
 * Can be `true` or nested with config.
 */
export type WithOptions = {
  [relation: string]: true | { with?: WithOptions; columns?: Record<string, boolean> } | undefined;
};

/**
 * Generic paginated query input
 */
export interface QueryInput<Filters = Record<string, unknown>> {
  filters?: Filters;
  with?: WithOptions;
  page?: number;
  limit?: number;
  sortBy?: Array<{ id: string; desc?: boolean }>;
}

/**
 * Generic find one input
 */
export interface FindOneInput {
  where: { id: string };
  with?: WithOptions;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
