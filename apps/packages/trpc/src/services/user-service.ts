import type { DBContext } from "@repo/db";
import { user as userTable } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
    CreateUserInput,
    UpdateUserInput,
    UserFindOneInput,
    UsersPaginatedInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, desc, eq, inArray } from "drizzle-orm";

const ALLOWED_MANAGE_ROLES = ["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR"];

export const findMany = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UsersPaginatedInput
) => {
    const { limit, page, sortBy, where, with: withRelations } = input;
    const offset = (page - 1) * limit;

    try {
        // Only directors and psychologists might need to see user lists
        if (!ALLOWED_MANAGE_ROLES.includes(user.role ?? "") && user.role !== "PSYCHOLOGIST") {
            // Psychologists might need to see children/families, but maybe not raw user list?
            // Let's restrict to Directors for now.
            // Actually, users table contains both staff and beneficiaries (if they have accounts). 
            // For now, let's keep it restricted.
            if (user.role !== "PSYCHOLOGIST") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Insufficient role to view users",
                });
            }
        }

        // Program Directors can only see users in their program
        const baseWhere =
            user.role === "PROGRAM_DIRECTOR" && user.programId
                ? { ...where, programId: { eq: user.programId } }
                : where;

        const data = await db.query.user.findMany({
            where: baseWhere,
            with: withRelations as Record<string, boolean | object> | undefined,
            limit,
            offset,
            orderBy: desc(userTable.createdAt),
        });

        const [totalResult] = await db.select({ count: count() }).from(userTable);
        const total = totalResult?.count ?? 0;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const findOne = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UserFindOneInput
) => {
    const { where, with: withRelations } = input;

    try {
        // Allow users to read their own profile
        if (where.id === user.id) {
            // Proceed
        } else if (!ALLOWED_MANAGE_ROLES.includes(user.role ?? "") && user.role !== "PSYCHOLOGIST") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient role to view other users",
            });
        }

        const result = await db.query.user.findFirst({
            where: { id: { eq: where.id } },
            with: withRelations as Record<string, boolean | object> | undefined,
        });

        if (!result) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        if (
            user.role === "PROGRAM_DIRECTOR" &&
            user.programId &&
            result.programId !== user.programId
        ) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Access denied",
            });
        }

        return result;
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const create = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: CreateUserInput
) => {
    try {
        if (!ALLOWED_MANAGE_ROLES.includes(user.role ?? "")) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Only Directors can create users",
            });
        }

        if (
            user.role === "PROGRAM_DIRECTOR" &&
            user.programId &&
            input.programId &&
            input.programId !== user.programId
        ) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Can only create users in your program",
            });
        }

        // TODO: Create auth account logic (Better Auth) is usually handled separately.
        // However, if we are just inserting into user table, that's fine for now, 
        // but Better Auth manages the user table heavily.
        // Ideally we should use Better Auth Admin API to create users if it supports it, 
        // or just insert if we handle auth separately.
        // For now, let's assume we insert directly.

        const [newUser] = await db
            .insert(userTable)
            .values({
                id: crypto.randomUUID(), // Better Auth usually handles ID gen but we can too
                name: input.name,
                email: input.email,
                emailVerified: false, // Pending verification
                role: input.role as any, // Cast to enum
                programId: input.programId ?? (user.role === "PROGRAM_DIRECTOR" ? user.programId : null),
                homeId: input.homeId ?? null,
                phone: input.phone ?? null,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        if (!newUser) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create user",
            });
        }

        return findOne(db, user, { where: { id: newUser.id } });
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create user: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const update = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: UpdateUserInput
) => {
    const { where, data } = input;

    try {
        if (!ALLOWED_MANAGE_ROLES.includes(user.role ?? "") && where.id !== user.id) {
            // Users can update their own profile (limited fields ideally, but for now strict check)
            // Let's assume ONLY directors update other users.
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient permissions to update user",
            });
        }

        // If user is updating themselves, restrict role changes etc in the router or validator,
        // or checks here.
        if (where.id === user.id) {
            if (data.role || data.programId || data.isActive !== undefined || data.banned !== undefined) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot update your own role/status/placement",
                });
            }
        }

        // Program Director check
        if (user.role === "PROGRAM_DIRECTOR") {
            // Check if target user is in same program
            const target = await db.query.user.findFirst({
                where: { id: { eq: where.id } },
                columns: { programId: true }
            });
            if (target && target.programId !== user.programId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot update user from another program",
                });
            }
        }

        const [updated] = await db
            .update(userTable)
            .set({
                ...(data.name !== undefined && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.role !== undefined && { role: data.role as any }),
                ...(data.programId !== undefined && { programId: data.programId }),
                ...(data.homeId !== undefined && { homeId: data.homeId }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.banned !== undefined && { banned: data.banned }),
                ...(data.banReason !== undefined && { banReason: data.banReason }),
                updatedAt: new Date(),
            })
            .where(eq(userTable.id, where.id))
            .returning();

        if (!updated) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        return findOne(db, user, { where: { id: updated.id } });
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update user: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};

export const remove = async (
    db: DBContext,
    user: AuthenticatedUser,
    input: string[] | { deletedIds: string[] }
) => {
    const ids = Array.isArray(input) ? input : input.deletedIds ?? [];

    try {
        if (!ALLOWED_MANAGE_ROLES.includes(user.role ?? "")) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Insufficient permissions to delete users",
            });
        }

        if (ids.length === 0) return { deletedIds: [] as string[], count: 0 };

        const result = await db
            .delete(userTable)
            .where(inArray(userTable.id, ids))
            .returning({ id: userTable.id });

        return { deletedIds: result.map((r) => r.id), count: result.length };
    } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete users: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
