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
// Member-Specific Input Schemas
// =============================================================================

/**
 * Create member input - includes user creation data
 */
const createMemberInput = z
  .object({
    organizationId: z.string(),
    userId: z.string().optional(), // Optional if creating new user
    role: z.string(),
    // User creation fields (when creating new user with member)
    name: z.string(),
    email: z.email(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Update member input - includes user update data
 */
const updateMemberData = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  role: z.string().optional(),
  // User update fields
  name: z.string().optional().nullable(),
  email: z.email().optional().nullable(),
  password: z.string().optional().nullable(),
  confirmPassword: z.string().optional().nullable(),
});

const updateMemberInput = createUpdateSchema(updateMemberData).refine(
  (data) =>
    !data.data.password || data.data.password === data.data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["data", "confirmPassword"],
  }
);

// Extended cursor query with role filter - just pass through since where is flexible
// Role filtering should be handled at the service level, not the validator level
const memberCursorQuerySchema = cursorQuerySchema;

// =============================================================================
// Member Validators Export
// =============================================================================

/**
 * Member validators using simplified architecture.
 */
export const memberValidators = {
  // CRUD operations - entity-specific
  createInput: createMemberInput,
  updateInput: updateMemberInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: memberCursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateMemberInput = z.infer<typeof memberValidators.createInput>;
export type UpdateMemberInput = z.infer<typeof memberValidators.updateInput>;
export type DeleteMembersInput = z.infer<typeof memberValidators.deleteInput>;
export type MembersPaginatedInput = PaginatedQueryInput<
  MemberWhereOptions,
  MemberWithOptions
>;
export type MembersCursorInput = CursorQueryInput<
  MemberWhereOptions,
  MemberWithOptions
>;
export type MemberFindOneInput = FindOneQueryInput<
  MemberWhereOptions,
  MemberWithOptions
>;

// =============================================================================
// Re-exports
// =============================================================================

// Entity and query types from @repo/db/schema
export type {
  Member,
  MemberDetail,
  MemberDetailWithConfig,
  MemberFindFirstResult,
  MemberFindManyResult,
  MemberInsert,
  MemberQueryInput,
  MemberQueryResult,
  MemberRelationKey,
  MemberRow,
  MemberRowWithConfig,
  // Select types - for dropdown selects
  MemberSelectData,
  MemberSelectWithConfig,
  MemberWhereOptions,
  MemberWithOptions,
} from "@repo/db/schema";

import type { MemberWhereOptions, MemberWithOptions } from "@repo/db/schema";

// Relations consts for use in frontend queries
export {
  defineMemberWith,
  memberDetailWith,
  memberRowWith,
  memberSelectWith,
} from "@repo/db/schema";
export {
  createUpdateSchema,
  cursorQuerySchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";
