import type { db } from "../../index";
import type { program } from "./program";

export type Program = typeof program.$inferSelect;
export type ProgramInsert = typeof program.$inferInsert;

export type ProgramFindManyArgs = NonNullable<
    Parameters<typeof db.query.program.findMany>[0]
>;
export type ProgramFindFirstArgs = NonNullable<
    Parameters<typeof db.query.program.findFirst>[0]
>;
export type ProgramWithOptions = NonNullable<ProgramFindManyArgs["with"]>;
export type ProgramWhereOptions = NonNullable<ProgramFindManyArgs["where"]>;

export type ProgramQueryResult<
    TConfig extends ProgramWithOptions | undefined = undefined,
> = TConfig extends ProgramWithOptions
    ? NonNullable<
        Awaited<ReturnType<typeof db.query.program.findFirst<{ with: TConfig }>>>
    >
    : Program;
