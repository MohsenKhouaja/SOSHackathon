import type { DBContext } from "@repo/db";
import { programs } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
  CreateProgramInput,
  ProgramFindOneInput,
  ProgramsPaginatedInput,
  UpdateProgramInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, desc, eq, inArray } from "drizzle-orm";

export const findMany = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: ProgramsPaginatedInput
) => {
  const { limit, page, sortBy, where, with: withRelations } = input;
  const offset = (page - 1) * limit;

  try {
    const role = user.role;
    if (
      !["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR", "PSYCHOLOGIST", "SOS_MEMBER", "SOS_AUNT", "EDUCATOR"].includes(
        role ?? ""
      )
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view programs",
      });
    }

    const data = await db.query.programs.findMany({
      where,
      with: withRelations as Record<string, boolean | object> | undefined,
      limit,
      offset,
      orderBy: desc(programs.createdAt),
    });

    const [totalResult] = await db
      .select({ count: count() })
      .from(programs);

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
      message: `Failed to fetch programs: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const findOne = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: ProgramFindOneInput
) => {
  const { where, with: withRelations } = input;

  try {
    const role = user.role;
    if (
      !["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR", "PSYCHOLOGIST", "SOS_MEMBER", "SOS_AUNT", "EDUCATOR"].includes(
        role ?? ""
      )
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view programs",
      });
    }

    const result = await db.query.programs.findFirst({
      where: { id: { eq: where.id } },
      with: withRelations as Record<string, boolean | object> | undefined,
    });

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program not found",
      });
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch program: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const create = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: CreateProgramInput
) => {
  try {
    if (user.role !== "NATIONAL_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only NATIONAL_DIRECTOR can create programs",
      });
    }

    const [program] = await db
      .insert(programs)
      .values({
        name: input.name,
        region: input.region ?? null,
        address: input.address ?? null,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
        directorId: input.directorId,
      })
      .returning();

    if (!program) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create program",
      });
    }

    return findOne(db, user, { where: { id: program.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create program: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const update = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: UpdateProgramInput
) => {
  const { where, data } = input;

  try {
    if (user.role !== "NATIONAL_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only NATIONAL_DIRECTOR can update programs",
      });
    }

    const [updated] = await db
      .update(programs)
      .set({
        ...data,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.directorId !== undefined && { directorId: data.directorId }),
      })
      .where(eq(programs.id, where.id))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Program not found",
      });
    }

    return findOne(db, user, { where: { id: updated.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update program: ${error instanceof Error ? error.message : String(error)}`,
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
    if (user.role !== "NATIONAL_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only NATIONAL_DIRECTOR can delete programs",
      });
    }

    if (ids.length === 0) return { deletedIds: [] as string[], count: 0 };

    const result = await db
      .delete(programs)
      .where(inArray(programs.id, ids))
      .returning({ id: programs.id });

    return { deletedIds: result.map((r) => r.id), count: result.length };
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to delete programs: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
