import type { UserRole } from "./user-role";

export type AuthenticatedUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
  twoFactorEnabled: boolean | null | undefined;
  banned: boolean | null | undefined;
  role?: UserRole | string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
  programId?: string | null | undefined;
  homeId?: string | null | undefined;
};

export type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  impersonatedBy?: string | null | undefined;
  activeOrganizationId?: string;
};

export type AuthenticatedUserWithSession = {
  user: AuthenticatedUser;
  session: Session;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null | undefined;
  priceCents?: number | null | undefined;
  billingInterval?: string | null | undefined;
  membershipLimit?: number | null | undefined;
  maximumTeams?: number | null | undefined;
  maximumMembersPerTeam?: number | null | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null | undefined;
};

export type Subscription = {
  id: string;
  userId?: string | null | undefined;
  organizationId?: string | null | undefined;
  provider?: string | null | undefined;
  providerSubscriptionId?: string | null | undefined;
  planId?: string | null | undefined;
  plan?: Plan | null | undefined;
  status?: string | null | undefined;
  startsAt?: Date | null | undefined;
  endsAt?: Date | null | undefined;
  canceledAt?: Date | null | undefined;
  metadata?: Record<string, unknown> | unknown | null | undefined;
  deletedAt?: Date | null | undefined;
  createdAt?: Date | null | undefined;
  updatedAt?: Date | null | undefined;
};
