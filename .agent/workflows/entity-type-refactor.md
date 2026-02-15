---
description: Complete guide for refactoring entity types with Row/Detail/Select patterns and simplified validators
---

# Entity Type Refactoring Guide

This document outlines the complete pattern for refactoring entities to use:
1. Proper type-safe `with` configurations for Row, Detail, and Select use cases
2. Simplified validators that don't conflict with Drizzle types

**Reference Implementation:** Order entity (`packages/validators/src/order/index.ts`)

---

## Architecture Overview

### Type Safety Flow

```
Frontend Query Hook          →  tRPC Router           →  Backend Service
─────────────────────────────────────────────────────────────────────────
<Entity>WhereOptions (Drizzle) →  z.record() (flexible) →  Drizzle query
Full autocomplete ✅           →  Basic validation ✅   →  Full type safety ✅
```

### Key Principles

1. **Validators define API input shape**, not DB schema shape
2. **Drizzle provides type safety** for `where`/`with` clauses
3. **Shared query schemas** for find operations (no entity-specific generation)
4. **Entity-specific create/update schemas** defined manually

---

## Step 1: Update DB Types File

**File:** `packages/db/src/schemas/<entity>/<entity>-types.ts`

### 1.1 Add the define helper function (if not exists)

```typescript
export function define<Entity>With<T extends <Entity>WithOptions>(config: T): T {
  return config;
}
```

### 1.2 Define the three `with` configurations

```typescript
// =============================================================================
// Row Relations - For data tables and list views
// =============================================================================

export const <entity>RowWith = define<Entity>With({
  // Include relations needed for table columns
  organization: true,
  member: {
    with: {
      user: {
        columns: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
});

export type <Entity>RowWithConfig = typeof <entity>RowWith;
export type <Entity>Row = <Entity>QueryResult<<Entity>RowWithConfig>;

// =============================================================================
// Detail Page Relations - More complete data for detail views
// =============================================================================

export const <entity>DetailWith = define<Entity>With({
  organization: true,
  member: {
    with: {
      user: true, // Full user object for details
    },
  },
  orders: true,
  statusHistory: {
    with: {
      status: true,
      member: { with: { user: true } },
    },
  },
});

export type <Entity>DetailWithConfig = typeof <entity>DetailWith;
export type <Entity>Detail = <Entity>QueryResult<<Entity>DetailWithConfig>;

// =============================================================================
// Select Component Relations - Minimal data for dropdowns
// =============================================================================

export const <entity>SelectWith = define<Entity>With({
  // ONLY include what's needed to display in dropdown
  member: {
    with: {
      user: {
        columns: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
});

export type <Entity>SelectWithConfig = typeof <entity>SelectWith;
export type <Entity>Select = <Entity>QueryResult<<Entity>SelectWithConfig>;
```

---

## Step 2: Create Entity Validators (Simplified Pattern)

**File:** `packages/validators/src/<entity>/index.ts`

### 2.1 Structure

```typescript
import { z } from "zod";
import {
  paginatedQuerySchema,
  cursorQuerySchema,
  findOneQuerySchema,
  deleteByIdsSchema,
  createUpdateSchema,
} from "../utils/simplified-validator-factory";

// =============================================================================
// Nested Schemas (if needed)
// =============================================================================

// Define any nested object schemas needed for create input
// Example: For Order, we have clientSchema and locationInputSchema

const nestedObjectSchema = z.object({
  field1: z.string(),
  field2: z.number().optional(),
});

// =============================================================================
// Create Input Schema (API-Centric, NOT DB-Centric)
// =============================================================================

/**
 * Create <Entity> input - matches what the API actually expects.
 * 
 * IMPORTANT: This is NOT the same as the DB schema!
 * - Include only fields the client sends
 * - Exclude server-set fields (statusId, timestamps, etc.)
 * - Include special input fields (like products[] for Order)
 */
const create<Entity>Input = z.object({
  // Required fields - what the API must receive
  name: z.string(),
  organizationId: z.uuidv7("Required"),
  
  // Optional fields
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  
  // Nested objects
  details: nestedObjectSchema.optional(),
  
  // Special input fields (not in DB schema)
  relatedItemIds: z.array(z.uuidv7("Required")).optional(),
});

/**
 * Update input - partial create data with flexible where
 */
const update<Entity>Input = createUpdateSchema(create<Entity>Input.partial());

// =============================================================================
// Validators Export
// =============================================================================

export const <entity>Validators = {
  // CRUD operations - entity-specific
  createInput: create<Entity>Input,
  updateInput: update<Entity>Input,
  deleteInput: deleteByIdsSchema,

  // Query operations - use shared schemas (no entity-specific generation!)
  findOneInput: findOneQuerySchema,
  findManyPaginatedInput: paginatedQuerySchema,
  findManyCursorInput: cursorQuerySchema,
} as const;

// =============================================================================
// Input Types (from Zod validators)
// =============================================================================

export type Create<Entity>Input = z.infer<typeof <entity>Validators.createInput>;
export type Update<Entity>Input = z.infer<typeof <entity>Validators.updateInput>;
export type Delete<Entity>sInput = z.infer<typeof <entity>Validators.deleteInput>;
export type <Entity>sPaginatedInput = z.infer<typeof <entity>Validators.findManyPaginatedInput>;
export type <Entity>sCursorInput = z.infer<typeof <entity>Validators.findManyCursorInput>;
export type <Entity>FindOneInput = z.infer<typeof <entity>Validators.findOneInput>;

// =============================================================================
// Re-exports
// =============================================================================

// Shared query schemas (if other entities need to extend them)
export {
  paginatedQuerySchema,
  cursorQuerySchema,
  findOneQuerySchema,
  createUpdateSchema,
} from "../utils/simplified-validator-factory";

// Entity and query types from @repo/db/schema
export type {
  <Entity>,
  <Entity>Insert,
  <Entity>WithOptions,
  <Entity>WhereOptions,
  <Entity>QueryInput,
  <Entity>FindManyResult,
  <Entity>FindFirstResult,
  // Row types
  <Entity>Row,
  <Entity>RowWithConfig,
  // Detail types
  <Entity>Detail,
  <Entity>DetailWithConfig,
  // Select types
  <Entity>Select,
  <Entity>SelectWithConfig,
  <Entity>QueryResult,
  <Entity>RelationKey,
} from "@repo/db/schema";

// Relations consts for use in frontend queries
export { <entity>RowWith, <entity>DetailWith, <entity>SelectWith, define<Entity>With } from "@repo/db/schema";
```

### 2.2 Delete Old Factory Files

After creating the new validators, delete:
- `<entity>-factory-validator.ts` (old factory configuration)
- `<entity>-base-validator.ts` (if not used elsewhere)
- `<entity>-relationships-validator.ts` (if not needed)

---

## Step 3: Update Backend Router

**File:** `packages/trpc/src/entity/routers/<entity>-router.ts`

### 3.1 Remove output validation (optional)

Drizzle already provides type safety for outputs, so `.output()` is optional:

```typescript
import { <entity>Validators } from "@repo/validators";

export const <entities>Router = router({
  findMany: protectedProcedure()
    .input(<entity>Validators.findManyPaginatedInput)
    .query(({ input, ctx }) => <entity>Service.findMany(db, ctx.user!, input)),

  findOne: protectedProcedure()
    .input(<entity>Validators.findOneInput)
    .query(({ input, ctx }) => <entity>Service.findOne(db, ctx.user!, input)),

  findInfinite: protectedProcedure()
    .input(<entity>Validators.findManyCursorInput)
    .query(({ input, ctx }) => <entity>Service.findInfinite(db, ctx.user!, input)),

  create: protectedProcedure()
    .input(<entity>Validators.createInput)
    // No .output() needed - Drizzle types the return value
    .mutation(({ input, ctx }) => <entity>Service.create(db, ctx.user!, input)),

  update: protectedProcedure()
    .input(<entity>Validators.updateInput)
    .mutation(({ input, ctx }) => <entity>Service.update(db, ctx.user!, input)),

  remove: protectedProcedure()
    .input(<entity>Validators.deleteInput)
    .mutation(({ input, ctx }) => <entity>Service.remove(db, ctx.user!, input)),
});
```

---

## Step 4: Update Frontend Query Hooks

**File:** `apps/admin/src/api/queries/<entity>-queries.tsx`

### 4.1 Query hooks WITHOUT `as any` casts

```typescript
import type { 
  <Entity>WithOptions,
  <Entity>WhereOptions,
  <Entity>QueryResult,
} from "@repo/validators";
import { useQuery, useInfiniteQuery, type QueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

// =============================================================================
// Input Types with Drizzle Autocomplete
// =============================================================================

interface <Entity>sQueryInput {
  where?: <Entity>WhereOptions;  // Optional for list queries
  with?: <Entity>WithOptions;
  page?: number;
  limit?: number;
  sortBy?: Array<{ id: string; desc?: boolean }>;
}

interface <Entity>QueryInput {
  where: <Entity>WhereOptions;  // REQUIRED for single entity queries
  with?: <Entity>WithOptions;
}

interface <Entity>sInfiniteQueryInput {
  where?: <Entity>WhereOptions;
  with?: <Entity>WithOptions;
  limit?: number;
  cursor?: string;
  sortBy?: Array<{ id: string; desc?: boolean }>;
}

// =============================================================================
// Type-Safe Query Hooks
// =============================================================================

export function use<Entity>sQuery<TWith extends <Entity>WithOptions | undefined = undefined>(
  input: <Entity>sQueryInput & { with?: TWith },
  options?: { enabled?: boolean }
) {
  const queryOptions = trpc.entity.<entities>.findMany.queryOptions(
    {
      page: input.page ?? 1,
      limit: input.limit ?? 10,
      where: input.where,
      sortBy: input.sortBy,
      with: input.with,
    },
    options
  );

  return useQuery(queryOptions) as ReturnType<typeof useQuery<{
    data: <Entity>QueryResult<TWith extends <Entity>WithOptions ? TWith : undefined>[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>>;
}

export function use<Entity>Query<TWith extends <Entity>WithOptions | undefined = undefined>(
  input: <Entity>QueryInput & { with?: TWith },
  options?: { enabled?: boolean }
) {
  const queryOptions = trpc.entity.<entities>.findOne.queryOptions(
    {
      where: input.where,
      with: input.with,
    },
    options
  );

  return useQuery(queryOptions) as ReturnType<typeof useQuery<
    <Entity>QueryResult<TWith extends <Entity>WithOptions ? TWith : undefined>
  >>;
}

export function use<Entity>sInfiniteQuery<TWith extends <Entity>WithOptions | undefined = undefined>(
  input: <Entity>sInfiniteQueryInput & { with?: TWith }
) {
  return useInfiniteQuery(
    trpc.Entity.<entities>.findInfinite.infiniteQueryOptions(
      {
        limit: input.limit ?? 20,
        cursor: input.cursor,
        where: input.where,
        sortBy: input.sortBy,
        with: input.with,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    )
  );
}
```

---

## Step 5: Update Frontend Pages

### 5.1 Main List Page

```typescript
import { <entity>RowWith, type <Entity>Row } from "@repo/validators";

export default function <Entity>sPage() {
  const { data, isLoading } = use<Entity>sQuery({
    page,
    limit,
    where,
    sortBy,
    with: <entity>RowWith,
  });
  
  return <DataTable data={data?.data ?? []} columns={columns} />;
}
```

### 5.2 Detail Page

```typescript
import { <entity>DetailWith, type <Entity>Detail } from "@repo/validators";

export default function <Entity>DetailsPage({ id }: { id: string }) {
  const { data } = use<Entity>Query({
    where: { id },
    with: <entity>DetailWith,
  });
  
  return <div>{data?.name}</div>;
}
```

---

## Step 6: Update Select Components

```typescript
import type { <Entity>WhereOptions, <Entity>Select as <Entity>SelectType } from "@repo/validators";
import { <entity>SelectWith } from "@repo/validators";

type <Entity>SelectProps = {
  onSelect?: (value: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
  defaultItems?: <Entity>SelectType[];
  where?: <Entity>WhereOptions;  // Use Drizzle type directly
  sortBy?: Array<{ id: string; desc?: boolean }>;
};

const <Entity>Select = ({ where, sortBy, ...props }: <Entity>SelectProps) => {
  const [search, setSearch] = useState("");

  const { data } = use<Entity>sInfiniteQuery({
    limit: 20,
    where: {
      ...where,
      ...(search ? { name: search } : {}),  // Use actual field names, not "search"
    },
    sortBy,
    with: <entity>SelectWith,
  });

  // ... rest of component
};
```

---

## Summary Checklist

### DB Package (`packages/db/src/schemas/<entity>/<entity>-types.ts`)
- [ ] Add `define<Entity>With` helper function
- [ ] Add `<entity>RowWith` const and types
- [ ] Add `<entity>DetailWith` const and types  
- [ ] Add `<entity>SelectWith` const and types

### Validators Package (`packages/validators/src/<entity>/index.ts`)
- [ ] Create entity-specific `create<Entity>Input` schema (API-centric!)
- [ ] Create `update<Entity>Input` using `createUpdateSchema()`
- [ ] Use shared query schemas (`paginatedQuerySchema`, etc.)
- [ ] Export all Drizzle types and With consts
- [ ] Delete old factory files (`*-factory-validator.ts`, `*-base-validator.ts`)

### Backend Router (`packages/trpc/src/entity/routers/<entity>-router.ts`)
- [ ] Remove `.output()` validation (optional)
- [ ] Ensure validators reference new `<entity>Validators`

### Frontend Queries (`apps/admin/src/api/queries/<entity>-queries.tsx`)
- [ ] Remove all `as any` casts
- [ ] Use `<Entity>WhereOptions` for where types (REQUIRED for findOne)
- [ ] Use `<Entity>WithOptions` for with types

### Frontend Pages
- [ ] Main list uses `<entity>RowWith`
- [ ] Detail page uses `<entity>DetailWith`
- [ ] Column definitions use `<Entity>Row` type

### Select Components
- [ ] Use `<entity>SelectWith`
- [ ] Use `<Entity>WhereOptions` for where prop
- [ ] Replace `{ search }` with actual field like `{ name: search }`

---

## Migration from Old Pattern

### Before (Old Pattern)
```typescript
// order-factory-validator.ts
export const orderValidatorFactory = createValidatorFactory<
  typeof orderBaseSchema.shape,
  typeof emptyRelationships
>({
  baseSchema: orderBaseSchema,
  relationships: emptyRelationships,
  searchableFields: ["statusId", "businessId", "sku"],
});

// order/index.ts
export const orderValidators = {
  createInput: orderValidatorFactory.createInput().extend({ products: ... }),
  findOneInput: orderValidatorFactory.findOneInput(),  // Generated - conflicts with Drizzle!
  // ...
};
```

### After (New Pattern)
```typescript
// order/index.ts - SELF-CONTAINED, NO FACTORY
const createOrderInput = z.object({
  businessId: z.uuidv7("Required"),
  client: clientSchema,
  products: z.array(orderProductInput).min(1),
  // ... only fields the API needs
});

export const orderValidators = {
  createInput: createOrderInput,
  updateInput: createUpdateSchema(createOrderInput.partial()),
  findOneInput: findOneQuerySchema,  // Shared schema - no conflicts!
  findManyPaginatedInput: paginatedQuerySchema,
  // ...
};
```

---

## Entities to Migrate

Use `/entity-migration-tracker` workflow to track progress:

- [x] Order (**Reference Implementation**)
- [ ] Dispatcher
- [ ] Driver  
- [ ] Member
- [ ] StorageTeamLeader
- [ ] StorageEmployee
- [ ] StorageManager
- [ ] DispatchingManager
- [ ] Business
- [ ] entityCompany
- [ ] Product
- [ ] Storage
- [ ] Vehicle
- [ ] Team
- [ ] DispatchingTeam
- [ ] StorageTeam
- [ ] User
- [ ] Dispatching
- [ ] Status
- [ ] Workflow
- [ ] ... (other entities)
