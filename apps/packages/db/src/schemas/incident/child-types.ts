import type { db } from "../../index";
import type { children } from "./tables";

export type Child = typeof children.$inferSelect;
export type ChildInsert = typeof children.$inferInsert;

export type ChildFindManyArgs = NonNullable<
  Parameters<typeof db.query.children.findMany>[0]
>;
export type ChildFindFirstArgs = NonNullable<
  Parameters<typeof db.query.children.findFirst>[0]
>;
export type ChildWithOptions = NonNullable<ChildFindManyArgs["with"]>;
export type ChildWhereOptions = NonNullable<ChildFindManyArgs["where"]>;

export type ChildQueryResult<
  TConfig extends ChildWithOptions | undefined = undefined,
> = TConfig extends ChildWithOptions
  ? NonNullable<
      Awaited<ReturnType<typeof db.query.children.findFirst<{ with: TConfig }>>>
    >
  : Child;

export function defineChildWith<T extends ChildWithOptions>(config: T): T {
  return config;
}

export const childRowWith = defineChildWith({
  home: { columns: { id: true, name: true } },
});

export const childDetailWith = defineChildWith({
  home: true,
  incidentReports: true,
});

export type ChildRowWithConfig = typeof childRowWith;
export type ChildDetailWithConfig = typeof childDetailWith;
export type ChildRow = ChildQueryResult<ChildRowWithConfig>;
export type ChildDetail = ChildQueryResult<ChildDetailWithConfig>;
