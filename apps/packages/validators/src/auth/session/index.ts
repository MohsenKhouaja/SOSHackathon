import { z } from "zod";
import {
  createUpdateSchema,
  cursorQuerySchema,
  deleteByIdsSchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";

// =============================================================================
// Session-Specific Input Schemas
// =============================================================================

/**
 * Create session input
 */
const createSessionInput = z.object({
  expiresAt: z.date(),
  token: z.string(),
  userId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  impersonatedBy: z.string().optional(),
  activeOrganizationId: z.string().optional(),
  activeTeamId: z.string().optional(),
});

/**
 * Update session input
 */
const updateSessionInput = createUpdateSchema(createSessionInput.partial());

// =============================================================================
// Session Validators Export
// =============================================================================

/**
 * Session validators using simplified architecture.
 */
export const sessionValidators = {
  // CRUD operations - entity-specific
  createInput: createSessionInput,
  updateInput: updateSessionInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateSessionInput = z.infer<typeof sessionValidators.createInput>;
export type UpdateSessionInput = z.infer<typeof sessionValidators.updateInput>;
export type DeleteSessionsInput = z.infer<typeof sessionValidators.deleteInput>;
export type SessionsPaginatedInput = z.infer<
  typeof sessionValidators.findManyPaginatedInput
>;
export type SessionsCursorInput = z.infer<
  typeof sessionValidators.findManyCursorInput
>;
export type SessionFindOneInput = z.infer<
  typeof sessionValidators.findOneInput
>;

// =============================================================================
// Re-exports
// =============================================================================

export {
  createUpdateSchema,
  cursorQuerySchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";
