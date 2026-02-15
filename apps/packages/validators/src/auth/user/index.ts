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

/**
 * Shared schema for user authentication and onboarding
 */
export const userAuthSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string().min(8),
  organizationId: z.string(),
});

// =============================================================================
// User-Specific Input Schemas
// =============================================================================

/**
 * Create user input
 */
const createUserInput = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().optional().nullable(),
  emailVerified: z.boolean().optional(),
  image: z.string().optional().nullable(),
  twoFactorEnabled: z.boolean().optional(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional().nullable(),
  banExpires: z.date().optional().nullable(),
  lastLoginMethod: z.string().optional().nullable(),
});

/**
 * Update user input
 */
const updateUserInput = createUpdateSchema(createUserInput.partial());

// =============================================================================
// User Validators Export
// =============================================================================

/**
 * User validators using simplified architecture.
 */
export const userValidators = {
  // CRUD operations - entity-specific
  createInput: createUserInput,
  updateInput: updateUserInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateUserInput = z.infer<typeof userValidators.createInput>;
export type UpdateUserInput = z.infer<typeof userValidators.updateInput>;
export type DeleteUsersInput = z.infer<typeof userValidators.deleteInput>;
export type UsersPaginatedInput = PaginatedQueryInput<
  UserWhereOptions,
  UserWithOptions
>;
export type UsersCursorInput = CursorQueryInput<
  UserWhereOptions,
  UserWithOptions
>;
export type UserFindOneInput = FindOneQueryInput<
  UserWhereOptions,
  UserWithOptions
>;

// =============================================================================
// Re-exports
// =============================================================================

// Entity and query types from @repo/db/schema
export type {
  User,
  UserInsert,
  UserQueryResult,
  UserSelectData,
  UserSelectWithConfig,
  UserWhereOptions,
  UserWithOptions,
} from "@repo/db/schema";

import type { UserWhereOptions, UserWithOptions } from "@repo/db/schema";

// Relations consts for use in frontend queries
export { defineUserWith, userSelectWith } from "@repo/db/schema";

export {
  createUpdateSchema,
  cursorQuerySchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";
