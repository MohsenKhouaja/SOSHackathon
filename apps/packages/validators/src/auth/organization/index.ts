import { z } from "zod";
import {
  createUpdateSchema,
  cursorQuerySchema,
  deleteByIdsSchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";

// Organization type enum
const organizationTypeEnum = z.enum(["delivery", "business"]);

// Backward-compatible base schema for other validators
export const organizationBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  locationId: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  createdAt: z.date(),
  metadata: z.string().nullable(),
  type: organizationTypeEnum,
});

// =============================================================================
// Organization-Specific Input Schemas
// =============================================================================

/**
 * Create organization input
 */
const createOrganizationInput = z.object({
  name: z.string(),
  slug: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  metadata: z.string().optional().nullable(),
  type: organizationTypeEnum,
});

/**
 * Update organization input
 */
const updateOrganizationInput = createUpdateSchema(
  createOrganizationInput.partial()
);

// =============================================================================
// Organization Validators Export
// =============================================================================

/**
 * Organization validators using simplified architecture.
 */
export const organizationValidators = {
  // CRUD operations - entity-specific
  createInput: createOrganizationInput,
  updateInput: updateOrganizationInput,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types
// =============================================================================

export type CreateOrganizationInput = z.infer<
  typeof organizationValidators.createInput
>;
export type UpdateOrganizationInput = z.infer<
  typeof organizationValidators.updateInput
>;
export type DeleteOrganizationsInput = z.infer<
  typeof organizationValidators.deleteInput
>;
export type OrganizationsPaginatedInput = z.infer<
  typeof organizationValidators.findManyPaginatedInput
>;
export type OrganizationsCursorInput = z.infer<
  typeof organizationValidators.findManyCursorInput
>;
export type OrganizationFindOneInput = z.infer<
  typeof organizationValidators.findOneInput
>;

// Export the type enum
export { organizationTypeEnum };

// =============================================================================
// Re-exports
// =============================================================================

export {
  createUpdateSchema,
  cursorQuerySchema,
  findOneQuerySchema,
  paginatedQuerySchema,
} from "../../utils/simplified-validator-factory";
