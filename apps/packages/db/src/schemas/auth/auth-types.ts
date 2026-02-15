/**
 * Auth Types - Fully Inferred from Drizzle
 */

import type { db } from "../../index";
import type {
  session,
  user,
} from "./auth-schema";

// =============================================================================
// User Types
// =============================================================================

export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export type UserFindManyArgs = NonNullable<
  Parameters<typeof db.query.user.findMany>[0]
>;
export type UserFindFirstArgs = NonNullable<
  Parameters<typeof db.query.user.findFirst>[0]
>;
export type UserWithOptions = NonNullable<UserFindManyArgs["with"]>;
export type UserWhereOptions = NonNullable<UserFindManyArgs["where"]>;

export type UserQueryResult<
  TConfig extends UserWithOptions | undefined = undefined,
> = TConfig extends UserWithOptions
  ? NonNullable<
    Awaited<ReturnType<typeof db.query.user.findFirst<{ with: TConfig }>>>
  >
  : User;

export function defineUserWith<T extends UserWithOptions>(config: T): T {
  return config;
}

// User Select Relations
export const userSelectWith = defineUserWith({});

export type UserSelectWithConfig = typeof userSelectWith;
export type UserSelectData = UserQueryResult<UserSelectWithConfig>;

// =============================================================================
// Session Types
// =============================================================================

export type Session = typeof session.$inferSelect;
export type SessionInsert = typeof session.$inferInsert;
