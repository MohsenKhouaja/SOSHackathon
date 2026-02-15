import { z } from "zod";
import {
  createUpdateSchema,
  cursorQuerySchema,
  deleteByIdsSchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";

// =============================================================================
// Account-Specific Input Schemas
// =============================================================================

/**
 * Create account input
 */
const createAccountInput = z.object({
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
});

/**
 * Update account input
 */
const updateAccountInput = createUpdateSchema(createAccountInput.partial());

// =============================================================================
// Account Validators Export
// =============================================================================

/**
 * Account validators using simplified architecture.
 */
export const accountValidators = {
  // CRUD operations - entity-specific
  createInput: createAccountInput,
  updateInput: updateAccountInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateAccountInput = z.infer<typeof accountValidators.createInput>;
export type UpdateAccountInput = z.infer<typeof accountValidators.updateInput>;
export type DeleteAccountsInput = z.infer<typeof accountValidators.deleteInput>;
export type AccountsPaginatedInput = z.infer<
  typeof accountValidators.findManyPaginatedInput
>;
export type AccountsCursorInput = z.infer<
  typeof accountValidators.findManyCursorInput
>;
export type AccountFindOneInput = z.infer<
  typeof accountValidators.findOneInput
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
