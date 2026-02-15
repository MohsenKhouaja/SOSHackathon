import type { db } from "../../index";
import type { homes } from "./tables";

export type Home = typeof homes.$inferSelect;
export type HomeInsert = typeof homes.$inferInsert;

export type HomeFindManyArgs = NonNullable<
  Parameters<typeof db.query.homes.findMany>[0]
>;
export type HomeFindFirstArgs = NonNullable<
  Parameters<typeof db.query.homes.findFirst>[0]
>;
export type HomeWithOptions = NonNullable<HomeFindManyArgs["with"]>;
export type HomeWhereOptions = NonNullable<HomeFindManyArgs["where"]>;

export type HomeQueryResult<
  TConfig extends HomeWithOptions | undefined = undefined,
> = TConfig extends HomeWithOptions
  ? NonNullable<
      Awaited<ReturnType<typeof db.query.homes.findFirst<{ with: TConfig }>>>
    >
  : Home;

export function defineHomeWith<T extends HomeWithOptions>(config: T): T {
  return config;
}

export const homeRowWith = defineHomeWith({
  program: { columns: { id: true, name: true } },
});

export const homeDetailWith = defineHomeWith({
  program: true,
  mother: { columns: { id: true, name: true, email: true } },
  aunt: { columns: { id: true, name: true, email: true } },
  children: true,
});

export type HomeRowWithConfig = typeof homeRowWith;
export type HomeDetailWithConfig = typeof homeDetailWith;
export type HomeRow = HomeQueryResult<HomeRowWithConfig>;
export type HomeDetail = HomeQueryResult<HomeDetailWithConfig>;
