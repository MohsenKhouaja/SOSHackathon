import { z } from "zod";

export const createChildInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().or(z.date()),
  homeId: z.string().uuid(),
  gender: z.string().optional().nullable(),
  admissionDate: z.string().or(z.date()).optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
});

const updateChildInput = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
  homeId: z.string().uuid().optional(),
  gender: z.string().optional().nullable(),
  admissionDate: z.string().or(z.date()).optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
});

const deleteByIdsSchema = z.union([
  z.array(z.string().uuid()),
  z.object({ deletedIds: z.array(z.string().uuid()) }),
]);

const findOneQuerySchema = z.object({
  where: z.object({ id: z.string().uuid() }),
  with: z.record(z.any()).optional(),
});

const paginatedQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  where: z.record(z.any()).optional(),
  with: z.record(z.any()).optional(),
  sortBy: z
    .array(z.object({ id: z.string(), desc: z.boolean().optional() }))
    .optional(),
});

export const childValidators = {
  createInput: createChildInput,
  updateInput: z.object({
    where: z.object({ id: z.string().uuid() }),
    data: updateChildInput,
  }),
  deleteInput: deleteByIdsSchema,
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
} as const;

export type CreateChildInput = z.infer<typeof childValidators.createInput>;
export type UpdateChildInput = z.infer<typeof childValidators.updateInput>;
export type DeleteChildrenInput = z.infer<typeof childValidators.deleteInput>;
export type ChildFindOneInput = z.infer<typeof childValidators.findOneInput>;
export type ChildrenPaginatedInput = z.infer<
  typeof childValidators.findManyPaginatedInput
>;
