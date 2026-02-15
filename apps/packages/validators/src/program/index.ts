import { z } from "zod";

const createProgramInput = z.object({
  name: z.string().min(1),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactPhone: z.string().optional().nullable(),
  directorId: z.string().min(1),
});

const updateProgramInput = z.object({
  name: z.string().min(1).optional(),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactPhone: z.string().optional().nullable(),
  directorId: z.string().min(1).optional(),
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

export const programValidators = {
  createInput: createProgramInput,
  updateInput: z.object({ where: z.object({ id: z.string().uuid() }), data: updateProgramInput }),
  deleteInput: deleteByIdsSchema,
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
} as const;

export type CreateProgramInput = z.infer<typeof programValidators.createInput>;
export type UpdateProgramInput = z.infer<typeof programValidators.updateInput>;
export type DeleteProgramsInput = z.infer<typeof programValidators.deleteInput>;
export type ProgramFindOneInput = z.infer<typeof programValidators.findOneInput>;
export type ProgramsPaginatedInput = z.infer<
  typeof programValidators.findManyPaginatedInput
>;
