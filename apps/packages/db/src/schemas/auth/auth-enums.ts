export type OrganizationType = "delivery" | "debriefing" | "business";

export const organizationTypes: OrganizationType[] = [
  "delivery",
  "business",
] as const;

// export const organizationTypeEnum = pgEnum(
//   'organization_type',
//   organizationTypes
// );

// export type OrganizationTypes =
//   (typeof organizationTypeEnum.enumValues)[number];

export type TeamType = "dispatching" | "storage";

export const teamTypes: TeamType[] = ["dispatching", "storage"] as const;

// export const teamTypeEnum = pgEnum('team_type', teamTypes);

// export type TeamTypes = (typeof teamTypeEnum.enumValues)[number];
