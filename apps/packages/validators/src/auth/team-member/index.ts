import { z } from "zod";
import {
  createUpdateSchema,
  cursorQuerySchema,
  deleteByIdsSchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";

// Backward-compatible base schema for other validators
export const teamMemberBaseSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  createdAt: z.date().optional(),
});

// =============================================================================
// TeamMember-Specific Input Schemas
// =============================================================================

/**
 * Create team member input
 */
const createTeamMemberInput = z.object({
  teamId: z.string(),
  userId: z.string(),
});

/**
 * Update team member input
 */
const updateTeamMemberInput = createUpdateSchema(
  createTeamMemberInput.partial()
);

// =============================================================================
// TeamMember Validators Export
// =============================================================================

/**
 * TeamMember validators using simplified architecture.
 */
export const teamMemberValidators = {
  // CRUD operations - entity-specific
  createInput: createTeamMemberInput,
  updateInput: updateTeamMemberInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateTeamMemberInput = z.infer<
  typeof teamMemberValidators.createInput
>;
export type UpdateTeamMemberInput = z.infer<
  typeof teamMemberValidators.updateInput
>;
export type DeleteTeamMembersInput = z.infer<
  typeof teamMemberValidators.deleteInput
>;
export type TeamMembersPaginatedInput = z.infer<
  typeof teamMemberValidators.findManyPaginatedInput
>;
export type TeamMembersCursorInput = z.infer<
  typeof teamMemberValidators.findManyCursorInput
>;
export type TeamMemberFindOneInput = z.infer<
  typeof teamMemberValidators.findOneInput
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
