import type { DBContext } from "@repo/db";
import { homes } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
  CreateHomeInput,
  HomeFindOneInput,
  HomesPaginatedInput,
  UpdateHomeInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, eq, inArray } from "drizzle-orm";

const ALLOWED_READ_ROLES = [
  "NATIONAL_DIRECTOR",
  "PROGRAM_DIRECTOR",
  "PSYCHOLOGIST",
  "SOS_MEMBER",
  "SOS_AUNT",
  "EDUCATOR",
];

export const findMany = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: HomesPaginatedInput
) => {
  const { limit, page, sortBy, where, with: withRelations } = input;
  const offset = (page - 1) * limit;

  try {
    if (!ALLOWED_READ_ROLES.includes(user.role ?? "")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view homes",
      });
    }

    const baseWhere =
      user.role === "PROGRAM_DIRECTOR" && user.programId
        ? { ...where, programId: user.programId }
        : where;

    const data = await db.query.home.findMany({
      where: baseWhere,
      with: withRelations,
      limit,
      offset,
      orderBy: { createdAt: "desc" },
    });

    const [totalResult] = await db.select({ count: count() }).from(homes);
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
      message: `Failed to fetch homes: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const findOne = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: HomeFindOneInput
) => {
  const { where, with: withRelations } = input;

  try {
    if (!ALLOWED_READ_ROLES.includes(user.role ?? "")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view homes",
      });
    }

    const result = await db.query.home.findFirst({
      where: { id: where.id },
      with: withRelations,
    });

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Home not found",
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
      message: `Failed to fetch home: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const create = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: CreateHomeInput
) => {
  try {
    if (user.role !== "NATIONAL_DIRECTOR" && user.role !== "PROGRAM_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only PROGRAM_DIRECTOR or NATIONAL_DIRECTOR can create homes",
      });
    }

    if (
      user.role === "PROGRAM_DIRECTOR" &&
      user.programId &&
      input.programId !== user.programId
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Can only create homes in your program",
      });
    }

    const [home] = await db
      .insert(homes)
      .values({
        name: input.name,
        programId: input.programId,
        address: input.address ?? null,
        capacity: input.capacity ?? 5,
        motherId: input.motherId ?? null,
        auntId: input.auntId ?? null,
      })
      .returning();

    if (!home) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create home",
      });
    }

    return findOne(db, user, { where: { id: home.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create home: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const update = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: UpdateHomeInput
) => {
  const { where, data } = input;

  try {
    if (user.role !== "NATIONAL_DIRECTOR" && user.role !== "PROGRAM_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only PROGRAM_DIRECTOR or NATIONAL_DIRECTOR can update homes",
      });
    }

    const [updated] = await db
      .update(homes)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.programId !== undefined && { programId: data.programId }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.motherId !== undefined && { motherId: data.motherId }),
        ...(data.auntId !== undefined && { auntId: data.auntId }),
      })
      .where(eq(homes.id, where.id))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Home not found",
      });
    }

    return findOne(db, user, { where: { id: updated.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update home: ${error instanceof Error ? error.message : String(error)}`,
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
    if (user.role !== "NATIONAL_DIRECTOR" && user.role !== "PROGRAM_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only PROGRAM_DIRECTOR or NATIONAL_DIRECTOR can delete homes",
      });
    }

    if (ids.length === 0) return { deletedIds: [] as string[], count: 0 };

    const result = await db
      .delete(homes)
      .where(inArray(homes.id, ids))
      .returning({ id: homes.id });

    return { deletedIds: result.map((r) => r.id), count: result.length };
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to delete homes: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
