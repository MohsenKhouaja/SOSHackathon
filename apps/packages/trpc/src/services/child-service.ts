import type { DBContext } from "@repo/db";
import { children } from "@repo/db/tables";
import type { AuthenticatedUser } from "@repo/shared";
import type {
  CreateChildInput,
  ChildFindOneInput,
  ChildrenPaginatedInput,
  UpdateChildInput,
} from "@repo/validators";
import { TRPCError } from "@trpc/server";
import { count, desc, eq, inArray } from "drizzle-orm";

const ALLOWED_READ_ROLES = [
  "NATIONAL_DIRECTOR",
  "PROGRAM_DIRECTOR",
  "PSYCHOLOGIST",
];

export const findMany = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: ChildrenPaginatedInput
) => {
  const { limit, page, where, with: withRelations } = input;
  const offset = (page - 1) * limit;

  try {
    if (!ALLOWED_READ_ROLES.includes(user.role ?? "")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view children",
      });
    }

    const data = await db.query.children.findMany({
      where,
      with: withRelations as Record<string, boolean | object> | undefined,
      limit,
      offset,
      orderBy: desc(children.createdAt),
    });

    const [totalResult] = await db.select({ count: count() }).from(children);
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
      message: `Failed to fetch children: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const findOne = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: ChildFindOneInput
) => {
  const { where, with: withRelations } = input;

  try {
    if (!ALLOWED_READ_ROLES.includes(user.role ?? "")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to view children",
      });
    }

    const result = await db.query.children.findFirst({
      where: { id: { eq: where.id } },
      with: withRelations as Record<string, boolean | object> | undefined,
    });

    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Child not found",
      });
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch child: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const create = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: CreateChildInput
) => {
  try {
    if (user.role !== "NATIONAL_DIRECTOR" && user.role !== "PROGRAM_DIRECTOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only PROGRAM_DIRECTOR or NATIONAL_DIRECTOR can create children",
      });
    }

    const dateOfBirth =
      typeof input.dateOfBirth === "string"
        ? new Date(input.dateOfBirth)
        : input.dateOfBirth;
    const admissionDate = input.admissionDate
      ? typeof input.admissionDate === "string"
        ? new Date(input.admissionDate)
        : input.admissionDate
      : null;

    const [child] = await db
      .insert(children)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth,
        homeId: input.homeId,
        gender: input.gender ?? null,
        admissionDate,
        medicalNotes: input.medicalNotes ?? null,
      })
      .returning();

    if (!child) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create child",
      });
    }

    return findOne(db, user, { where: { id: child.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create child: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export const update = async (
  db: DBContext,
  user: AuthenticatedUser,
  input: UpdateChildInput
) => {
  const { where, data } = input;

  try {
    const allowedRoles = ["NATIONAL_DIRECTOR", "PROGRAM_DIRECTOR", "PSYCHOLOGIST"];
    if (!allowedRoles.includes(user.role ?? "")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role to update children",
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.dateOfBirth !== undefined)
      updateData.dateOfBirth =
        typeof data.dateOfBirth === "string"
          ? new Date(data.dateOfBirth)
          : data.dateOfBirth;
    if (data.homeId !== undefined) updateData.homeId = data.homeId;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.admissionDate !== undefined)
      updateData.admissionDate = data.admissionDate
        ? typeof data.admissionDate === "string"
          ? new Date(data.admissionDate)
          : data.admissionDate
        : null;
    if (data.medicalNotes !== undefined) updateData.medicalNotes = data.medicalNotes;

    const [updated] = await db
      .update(children)
      .set(updateData as Record<string, unknown>)
      .where(eq(children.id, where.id))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Child not found",
      });
    }

    return findOne(db, user, { where: { id: updated.id } });
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to update child: ${error instanceof Error ? error.message : String(error)}`,
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
        message: "Only PROGRAM_DIRECTOR or NATIONAL_DIRECTOR can delete children",
      });
    }

    if (ids.length === 0) return { deletedIds: [] as string[], count: 0 };

    const result = await db
      .delete(children)
      .where(inArray(children.id, ids))
      .returning({ id: children.id });

    return { deletedIds: result.map((r) => r.id), count: result.length };
  } catch (error: unknown) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to delete children: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};
