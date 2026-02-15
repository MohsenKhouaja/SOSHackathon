### `schema.md` (Agent Prompt)

````markdown
# Role and Objective

You are an expert TypeScript and Drizzle ORM developer. Your objective is to generate standardized database module files for a given domain entity.

When I provide a domain entity and its fields, you must generate exactly 4 files:

1. `[entity]-schema.ts`
2. `[entity]-relations.ts`
3. `[entity]-types.ts`
4. `index.ts`

# Architecture & Style Guidelines

- **Primary Keys:** Always use `uuid("id").primaryKey().default(sql\`uuidv7()\`)`.
- **Timestamps:** Every table must include `createdAt`, `updatedAt` (with `$onUpdate`), and `deletedAt` for soft deletes.
- **Relations:** Use `defineRelationsPart`. Always include soft delete filters (`where: { deletedAt: { isNull: true } }`). Use `alias` if there are multiple relations to the same table.
- **Typing System:** The types file must strictly follow Drizzle's type inference pattern, extracting `findMany` parameters to create dynamic `TWith` configs, autocomplete helpers, and nested row/detail configurations.

# File Templates

Below are the complete, generic code examples you must follow. Substitute the generic `entity` / `entities` / `Entity` placeholders with the specific domain model requested.

### 1. Schema File (`[entity]-schema.ts`)

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { relatedEntities } from "../related-entity/related-entity-schema";

export const entities = pgTable("entities", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  name: text("name").notNull(),

  // Foreign keys
  relatedEntityId: uuid("related_entity_id").references(
    () => relatedEntities.id,
  ),

  // Standard timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at"),
});
```
````

### 2. Relations File (`[entity]-relations.ts`)

```typescript
import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../tables";

export const entityRelations = defineRelationsPart(schema, (r) => ({
  entities: {
    // Standard one-to-one or many-to-one relation
    relatedEntity: r.one.relatedEntities({
      from: r.entities.relatedEntityId,
      to: r.relatedEntities.id,
      where: { deletedAt: { isNull: true } },
    }),

    // Example of aliased relation (use when pointing to the same table multiple times)
    alternateRelatedEntity: r.one.relatedEntities({
      from: r.entities.alternateRelatedEntityId,
      to: r.relatedEntities.id,
      where: { deletedAt: { isNull: true } },
      alias: "alternateRelatedEntity",
    }),
  },
}));
```

### 3. Types File (`[entity]-types.ts`)

```typescript
/**
 * Entity Types - Fully Inferred from Drizzle
 *
 * Uses Drizzle's internal type system to provide:
 * - Full autocomplete for filters including nested relations
 * - Dynamic return types based on 'with' config
 * - Type-safe relation access
 *
 * Pattern: Use defineRowWith helper for AUTOCOMPLETE when defining relations
 */

import type { db } from "../../index";
import type { entities } from "./[entity]-schema";

// =============================================================================
// Entity Types - From Drizzle $inferSelect
// =============================================================================

export type Entity = typeof entities.$inferSelect;
export type EntityInsert = typeof entities.$inferInsert;

// =============================================================================
// Query Config Types - Extracted from Drizzle's Query Builder
// =============================================================================

export type EntityFindManyArgs = NonNullable<
  Parameters<typeof db.query.entities.findMany>[0]
>;
export type EntityFindFirstArgs = NonNullable<
  Parameters<typeof db.query.entities.findFirst>[0]
>;

export type EntityWithOptions = NonNullable<EntityFindManyArgs["with"]>;
export type EntityWhereOptions = NonNullable<EntityFindManyArgs["where"]>;
export type EntityOrderByOptions = EntityFindManyArgs["orderBy"];
export type EntityRelationKey = keyof EntityWithOptions;

// =============================================================================
// Query Input Types - For API
// =============================================================================

export type EntityQueryInput<
  TWith extends EntityWithOptions | undefined = undefined,
> = {
  where?: EntityWhereOptions;
  with?: TWith;
  page?: number;
  limit?: number;
  sortBy?: Array<{ id: string; desc?: boolean }>;
};

export type EntityFindOneInput<
  TWith extends EntityWithOptions | undefined = undefined,
> = {
  where: { id: string };
  with?: TWith;
};

// =============================================================================
// Result Types - Dynamic Based on Config
// =============================================================================

type EntityFindFirstWithConfig<TWith extends EntityWithOptions> = Awaited<
  ReturnType<typeof db.query.entities.findFirst<{ with: TWith }>>
>;

export type EntityQueryResult<
  TConfig extends EntityWithOptions | undefined = undefined,
> = TConfig extends EntityWithOptions
  ? NonNullable<EntityFindFirstWithConfig<TConfig>>
  : Entity;

// =============================================================================
// Row Relations - With AUTOCOMPLETE Helper
// =============================================================================

export function defineEntityWith<T extends EntityWithOptions>(config: T): T {
  return config;
}

/**
 * DEFAULT RELATIONS for data tables.
 */
export const entityRowWith = defineEntityWith({
  // Populate relevant standard row relations here
  relatedEntity: {
    columns: {
      id: true,
      name: true,
    },
  },
});

export type EntityRowWithConfig = typeof entityRowWith;
export type EntityRow = EntityQueryResult<EntityRowWithConfig>;

// =============================================================================
// Detail Page Relations - With AUTOCOMPLETE Helper
// =============================================================================

/**
 * DEFAULT RELATIONS for detail pages. Includes deeper nested relations.
 */
export const entityDetailWith = defineEntityWith({
  // Populate deeper detail relations here
  relatedEntity: {
    with: {
      nestedEntity: true,
    },
  },
});

export type EntityDetailWithConfig = typeof entityDetailWith;
export type EntityDetail = EntityQueryResult<EntityDetailWithConfig>;
```

### 4. Index File (`index.ts`)

```typescript
export * from "./[entity]-schema";
export * from "./[entity]-relations";
export * from "./[entity]-types";
```

# Instructions for Execution

When I ask you to generate a new domain entity module:

1. Apply the entity name correctly (singular and plural, PascalCase, camelCase, kebab-case for files).
2. Follow the schemas, relations, types, and index patterns identically.
3. Infer logical relations for `entityRowWith` and `entityDetailWith` based on the fields provided.

```

```
