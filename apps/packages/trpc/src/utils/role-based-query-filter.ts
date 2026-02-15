import type { UserRole } from "@repo/shared";
import type { QueryFilters, QueryWith } from "@repo/db/query-builder";
import type { AuthenticatedUser } from "@repo/shared";

const READABLE_BY_ROLE: Record<string, string[]> = {
  NATIONAL_DIRECTOR: [
    "user",
    "program",
    "home",
    "child",
    "incidentReport",
    "reportAttachment",
    "stepEvaluation",
    "stepActionPlan",
    "stepFollowUp",
    "stepFormalDecision",
    "notification",
    "auditLog",
  ],
  PROGRAM_DIRECTOR: [
    "user",
    "program",
    "home",
    "child",
    "incidentReport",
    "reportAttachment",
    "stepEvaluation",
    "stepActionPlan",
    "stepFollowUp",
    "stepFormalDecision",
    "notification",
    "auditLog",
  ],
  PSYCHOLOGIST: [
    "user",
    "program",
    "home",
    "child",
    "incidentReport",
    "reportAttachment",
    "stepEvaluation",
    "stepActionPlan",
    "stepFollowUp",
    "stepFormalDecision",
    "notification",
  ],
  SOS_MEMBER: ["incidentReport"],
  SOS_AUNT: ["incidentReport"],
  EDUCATOR: ["incidentReport"],
  EXTERNAL: ["incidentReport"],
};

export function getReadableResources(user: AuthenticatedUser): Set<string> {
  const role = user.role as UserRole | undefined;
  if (!role) return new Set();

  const resources = READABLE_BY_ROLE[role] ?? [];
  return new Set(resources);
}

function getNormalizedResourceNames(alias: string): string[] {
  const names = [alias];
  if (alias.endsWith("ies")) {
    names.push(`${alias.slice(0, -3)}y`);
  } else if (
    alias.endsWith("ses") ||
    alias.endsWith("xes") ||
    alias.endsWith("ches") ||
    alias.endsWith("shes")
  ) {
    names.push(alias.slice(0, -2));
  } else if (alias.endsWith("s") && !alias.endsWith("ss")) {
    names.push(alias.slice(0, -1));
  }
  return names;
}

function hasReadAccess(
  alias: string,
  readableResources: Set<string>
): boolean {
  const possibleNames = getNormalizedResourceNames(alias);
  return possibleNames.some((name) => readableResources.has(name));
}

export function filterWithByPermissions(
  withRelations: QueryWith | undefined,
  readableResources: Set<string>
): QueryWith | undefined {
  if (!withRelations || typeof withRelations !== "object") return undefined;

  const filtered: QueryWith = {};

  for (const [alias, value] of Object.entries(withRelations)) {
    if (!hasReadAccess(alias, readableResources)) continue;

    if (value === true) {
      filtered[alias] = true;
    } else if (typeof value === "object" && value !== null) {
      const nestedConfig = value as {
        with?: QueryWith;
        columns?: Record<string, boolean>;
        orderBy?: Record<string, unknown>;
        limit?: number;
        offset?: number;
      };
      const filteredConfig: Record<string, unknown> = {};

      if (nestedConfig.with) {
        const nestedFiltered = filterWithByPermissions(
          nestedConfig.with,
          readableResources
        );
        if (nestedFiltered && Object.keys(nestedFiltered).length > 0) {
          filteredConfig.with = nestedFiltered;
        }
      }
      if (nestedConfig.columns) filteredConfig.columns = nestedConfig.columns;
      if (nestedConfig.orderBy) filteredConfig.orderBy = nestedConfig.orderBy;
      if (nestedConfig.limit !== undefined) filteredConfig.limit = nestedConfig.limit;
      if (nestedConfig.offset !== undefined) filteredConfig.offset = nestedConfig.offset;

      if (Object.keys(filteredConfig).length > 0) {
        filtered[alias] = filteredConfig;
      } else {
        filtered[alias] = true;
      }
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : undefined;
}

export function filterWhereByPermissions(
  where: QueryFilters | undefined,
  readableResources: Set<string>
): QueryFilters | undefined {
  if (!where || typeof where !== "object") return undefined;

  const filtered: QueryFilters = {};

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined || value === null) continue;

    if (key === "AND" || key === "OR" || key === "NOT") {
      if (Array.isArray(value)) {
        const filteredArray = value
          .filter(
            (v): v is QueryFilters =>
              v !== null && v !== undefined && typeof v === "object"
          )
          .map((v) => filterWhereByPermissions(v, readableResources))
          .filter(
            (v): v is QueryFilters =>
              v !== undefined && Object.keys(v).length > 0
          );
        if (filteredArray.length > 0) filtered[key] = filteredArray;
      }
      continue;
    }

    if (key.includes(".")) {
      const alias = key.split(".")[0];
      if (alias && !hasReadAccess(alias, readableResources)) continue;
      filtered[key] = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      const keys = Object.keys(value);
      const operatorKeys = [
        "eq", "ne", "gt", "gte", "lt", "lte", "in", "notIn",
        "like", "ilike", "between", "contains", "startsWith", "endsWith",
        "isNull", "isNotNull",
      ];
      const isOperator = keys.some((k) => operatorKeys.includes(k));

      if (isOperator) {
        filtered[key] = value;
      } else {
        if (!hasReadAccess(key, readableResources)) continue;
        const nestedFiltered = filterWhereByPermissions(
          value as QueryFilters,
          readableResources
        );
        if (nestedFiltered && Object.keys(nestedFiltered).length > 0) {
          filtered[key] = nestedFiltered;
        }
      }
    } else {
      filtered[key] = value;
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : undefined;
}

export function applyRoleBasedAccessControl(
  user: AuthenticatedUser,
  query: { with?: QueryWith; where?: QueryFilters }
): { with: QueryWith | undefined; where: QueryFilters | undefined } {
  const readableResources = getReadableResources(user);
  return {
    with: filterWithByPermissions(query.with, readableResources),
    where: filterWhereByPermissions(query.where, readableResources),
  };
}
