import { z } from "zod";

// =============================================================================
// Shared Query Schemas
// =============================================================================

/**
 * Schema for finding a single record by ID
 */
export const findOneQuerySchema = z.object({
  where: z.object({ id: z.string().uuid() }),
  with: z.record(z.any()).optional(),
});

/**
 * Schema for paginated queries
 */
export const paginatedQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  where: z.record(z.any()).optional(),
  with: z.record(z.any()).optional(),
  sortBy: z
    .array(z.object({ id: z.string(), desc: z.boolean().optional() }))
    .optional(),
});

/**
 * Schema for cursor-based pagination
 */
export const cursorQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(10),
  where: z.record(z.any()).optional(),
  with: z.record(z.any()).optional(),
  sortBy: z
    .array(z.object({ id: z.string(), desc: z.boolean().optional() }))
    .optional(),
});

/**
 * Schema for deleting records by IDs
 */
export const deleteByIdsSchema = z.union([
  z.array(z.string().uuid()),
  z.object({ deletedIds: z.array(z.string().uuid()) }),
]);

// =============================================================================
// Schema Factories
// =============================================================================

/**
 * Creates an update schema that wraps a partial input schema with where clause
 */
export function createUpdateSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    where: z.object({ id: z.string().uuid() }),
    data: dataSchema,
  });
}

// =============================================================================
// Types
// =============================================================================

export type FindOneQueryInput = z.infer<typeof findOneQuerySchema>;
export type PaginatedQueryInput = z.infer<typeof paginatedQuerySchema>;
export type CursorQueryInput = z.infer<typeof cursorQuerySchema>;
export type DeleteByIdsInput = z.infer<typeof deleteByIdsSchema>;
