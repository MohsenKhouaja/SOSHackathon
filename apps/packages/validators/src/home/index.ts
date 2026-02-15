import { z } from "zod";

const createHomeInput = z.object({
  name: z.string().min(1),
  programId: z.string().uuid(),
  address: z.string().optional().nullable(),
  capacity: z.number().int().min(1).default(5),
  motherId: z.string().optional().nullable(),
  auntId: z.string().optional().nullable(),
});

const updateHomeInput = z.object({
  name: z.string().min(1).optional(),
  programId: z.string().uuid().optional(),
  address: z.string().optional().nullable(),
  capacity: z.number().int().min(1).optional(),
  motherId: z.string().optional().nullable(),
  auntId: z.string().optional().nullable(),
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

export const homeValidators = {
  createInput: createHomeInput,
  updateInput: z.object({ where: z.object({ id: z.string().uuid() }), data: updateHomeInput }),
  deleteInput: deleteByIdsSchema,
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
} as const;

export type CreateHomeInput = z.infer<typeof homeValidators.createInput>;
export type UpdateHomeInput = z.infer<typeof homeValidators.updateInput>;
export type DeleteHomesInput = z.infer<typeof homeValidators.deleteInput>;
export type HomeFindOneInput = z.infer<typeof homeValidators.findOneInput>;
export type HomesPaginatedInput = z.infer<
  typeof homeValidators.findManyPaginatedInput
>;
