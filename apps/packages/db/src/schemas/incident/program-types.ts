import type { db } from "../../index";
import type { programs } from "./tables";

export type Program = typeof programs.$inferSelect;
export type ProgramInsert = typeof programs.$inferInsert;

export type ProgramFindManyArgs = NonNullable<
  Parameters<typeof db.query.programs.findMany>[0]
>;
export type ProgramFindFirstArgs = NonNullable<
  Parameters<typeof db.query.programs.findFirst>[0]
>;
export type ProgramWithOptions = NonNullable<ProgramFindManyArgs["with"]>;
export type ProgramWhereOptions = NonNullable<ProgramFindManyArgs["where"]>;

export type ProgramQueryResult<
  TConfig extends ProgramWithOptions | undefined = undefined,
> = TConfig extends ProgramWithOptions
  ? NonNullable<
      Awaited<
        ReturnType<
          typeof db.query.programs.findFirst<{ with: TConfig }>
        >
      >
    >
  : Program;

export function defineProgramWith<T extends ProgramWithOptions>(config: T): T {
  return config;
}

export const programRowWith = defineProgramWith({
  director: {
    columns: { id: true, name: true, email: true },
  },
});

export const programDetailWith = defineProgramWith({
  director: {
    columns: { id: true, name: true, email: true, phone: true },
  },
  homes: true,
});

export type ProgramRowWithConfig = typeof programRowWith;
export type ProgramDetailWithConfig = typeof programDetailWith;
export type ProgramRow = ProgramQueryResult<ProgramRowWithConfig>;
export type ProgramDetail = ProgramQueryResult<ProgramDetailWithConfig>;
