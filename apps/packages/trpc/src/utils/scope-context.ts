import type { DBContext } from "@repo/db";
import type { QueryFilters } from "@repo/db/query-builder";
import type { AuthenticatedUser } from "@repo/shared";
import { TRPCError } from "@trpc/server";

export type ScopeType = "program" | "national";

export type ScopeContext = {
  type: ScopeType;
  programId?: string;

  getProgramScope: () => QueryFilters;
  getIncidentReportScope: () => QueryFilters;
  getChildScope: () => QueryFilters;
  getHomeScope: () => QueryFilters;
};

export async function createScopeContext(
  _db: DBContext,
  user: AuthenticatedUser
): Promise<ScopeContext> {
  const programId = user.programId;
  const role = user.role;

  if (role === "NATIONAL_DIRECTOR") {
    return {
      type: "national",
      getProgramScope: () => ({}),
      getIncidentReportScope: () => ({}),
      getChildScope: () => ({}),
      getHomeScope: () => ({}),
    };
  }

  // Program Level Users
  if (
    programId &&
    (role === "PROGRAM_DIRECTOR" ||
      role === "PSYCHOLOGIST" ||
      role === "SOS_MEMBER" ||
      role === "SOS_AUNT" ||
      role === "EDUCATOR")
  ) {
    return {
      type: "program",
      programId,
      getProgramScope: () => ({ id: { eq: programId } }),
      getIncidentReportScope: () => ({ programId: { eq: programId } }),
      getChildScope: () => ({ home: { programId: { eq: programId } } }),
      getHomeScope: () => ({ programId: { eq: programId } }),
    };
  }

  // External or other (restricted)
  if (role === "EXTERNAL") {
    // External users might only see their own reports, but here we define scope for "reading resources".
    // If they can't read anything general, we might want to throw or return narrow scope.
    // For now, let's assume they have no broad scope access.
    return {
      type: "program", // Defaulting to restricted
      getProgramScope: () => ({ id: { eq: "never_match" } }),
      getIncidentReportScope: () => ({ reporterId: { eq: user.id } }), // Only their own
      getChildScope: () => ({ id: { eq: "never_match" } }),
      getHomeScope: () => ({ id: { eq: "never_match" } }),
    };
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "No valid scope context found for user role",
  });
}
