import type { db } from "../../index";
import type { home } from "./home";

export type Home = typeof home.$inferSelect;
export type HomeInsert = typeof home.$inferInsert;

export type HomeFindManyArgs = NonNullable<
    Parameters<typeof db.query.home.findMany>[0]
>;
export type HomeFindFirstArgs = NonNullable<
    Parameters<typeof db.query.home.findFirst>[0]
>;
export type HomeWithOptions = NonNullable<HomeFindManyArgs["with"]>;
export type HomeWhereOptions = NonNullable<HomeFindManyArgs["where"]>;

export type HomeQueryResult<
    TConfig extends HomeWithOptions | undefined = undefined,
> = TConfig extends HomeWithOptions
    ? NonNullable<
        Awaited<ReturnType<typeof db.query.home.findFirst<{ with: TConfig }>>>
    >
    : Home;
