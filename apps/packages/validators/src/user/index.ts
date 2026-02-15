import { z } from "zod";
import { userRole } from "@repo/shared";

// We use the enum values for validation
const roleEnum = z.enum([
    "EXTERNAL",
    "SOS_MEMBER",
    "SOS_AUNT",
    "EDUCATOR",
    "PSYCHOLOGIST",
    "PROGRAM_DIRECTOR",
    "NATIONAL_DIRECTOR",
]);

const createUserInput = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8).optional(), // Optional if we invite via email
    role: roleEnum,
    programId: z.string().uuid().optional().nullable(),
    homeId: z.string().uuid().optional().nullable(),
    phone: z.string().optional().nullable(),
});

const updateUserInput = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: roleEnum.optional(),
    programId: z.string().uuid().optional().nullable(),
    homeId: z.string().uuid().optional().nullable(),
    phone: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    banned: z.boolean().optional(),
    banReason: z.string().optional().nullable(),
});

const deleteByIdsSchema = z.union([
    z.array(z.string()),
    z.object({ deletedIds: z.array(z.string()) }),
]);

const findOneQuerySchema = z.object({
    where: z.object({ id: z.string() }),
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

export const userValidators = {
    createInput: createUserInput,
    updateInput: z.object({ where: z.object({ id: z.string() }), data: updateUserInput }),
    deleteInput: deleteByIdsSchema,
    findOneInput: findOneQuerySchema,
    findManyPaginatedInput: paginatedQuerySchema,
} as const;

export type CreateUserInput = z.infer<typeof userValidators.createInput>;
export type UpdateUserInput = z.infer<typeof userValidators.updateInput>;
export type DeleteUsersInput = z.infer<typeof userValidators.deleteInput>;
export type UserFindOneInput = z.infer<typeof userValidators.findOneInput>;
export type UsersPaginatedInput = z.infer<
    typeof userValidators.findManyPaginatedInput
>;
