import { z } from "zod";
import {
  type CursorQueryInput,
  createUpdateSchema,
  cursorQuerySchema,
  deleteByIdsSchema,
  type FindOneQueryInput,
  findOneQuerySchema,
  type PaginatedQueryInput,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";

// =============================================================================
// Team-Specific Input Schemas
// =============================================================================

/**
 * Create team input
 */
const createTeamInput = z.object({
  name: z.string(),
  organizationId: z.string(),
});

/**
 * Update team input
 */
const updateTeamInput = createUpdateSchema(createTeamInput.partial());

// =============================================================================
// Team Validators Export
// =============================================================================

/**
 * Team validators using simplified architecture.
 */
export const teamValidators = {
  // CRUD operations - entity-specific
  createInput: createTeamInput,
  updateInput: updateTeamInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateTeamInput = z.infer<typeof teamValidators.createInput>;
export type UpdateTeamInput = z.infer<typeof teamValidators.updateInput>;
export type DeleteTeamsInput = z.infer<typeof teamValidators.deleteInput>;
export type TeamsPaginatedInput = PaginatedQueryInput<
  TeamWhereOptions,
  TeamWithOptions
>;
export type TeamsCursorInput = CursorQueryInput<
  TeamWhereOptions,
  TeamWithOptions
>;
export type TeamFindOneInput = FindOneQueryInput<
  TeamWhereOptions,
  TeamWithOptions
>;

// =============================================================================
// Re-exports
// =============================================================================

// Entity and query types from @repo/db/schema
export type {
  Team,
  // Detail types - for detail pages
  TeamDetail,
  TeamDetailWithConfig,
  TeamFindFirstResult,
  TeamFindManyResult,
  TeamInsert,
  TeamQueryInput,
  TeamQueryResult,
  TeamRelationKey,
  // Row types - for data tables
  TeamRow,
  TeamRowWithConfig,
  // Select types - for dropdown selects
  TeamSelectData,
  TeamSelectWithConfig,
  TeamWhereOptions,
  TeamWithOptions,
} from "@repo/db/schema";

import type { TeamWhereOptions, TeamWithOptions } from "@repo/db/schema";

// Relations consts for use in frontend queries
export {
  defineTeamWith,
  teamDetailWith,
  teamRowWith,
  teamSelectWith,
} from "@repo/db/schema";

export {
  createUpdateSchema,
  cursorQuerySchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";
