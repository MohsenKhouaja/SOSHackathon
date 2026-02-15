---
trigger: always_on
---

# Project Structure

## Monorepo Layout

```
lanci/
├── apps/                    # Application layer
│   ├── admin/              # React admin dashboard (Vite)
│   └── api/                # Express.js backend (Bun)
├── packages/               # Shared packages
│   ├── auth/              # Better Auth configuration
│   ├── db/                # Drizzle schemas, migrations, seeds
│   ├── trpc/              # tRPC routers and procedures
│   ├── ui/                # Shadcn/ui components
│   ├── validators/        # Zod validation schemas
│   ├── shared/            # Common utilities and types
│   ├── logger/            # Logging utilities
│   ├── typescript-config/ # Shared TS configs
│   └── jest-presets/      # Jest configurations
├── docs/                   # Documentation
├── scripts/                # Development scripts
├── init/                   # Initialization scripts
│   ├── backend/           # Backend setup
│   └── postgres/          # Database setup
└── data/                   # Local data (gitignored)
    └── postgres/          # PostgreSQL data
```

## Apps Structure

### Admin App (`apps/admin/`)
- React 19 + Vite frontend
- Uses workspace packages via `@repo/*` imports
- Connects to API via tRPC client
- Runs on port 3000 (dev), 3001 (dev:new)

### API App (`apps/api/`)
- Express.js backend with Bun runtime
- Exposes tRPC routers from `@repo/trpc`
- Handles authentication via `@repo/auth`
- Database access via `@repo/db`
- Runs on port 5000

## Package Organization

### Database Package (`packages/db/`)
```
db/
├── src/
│   ├── schemas/           # Drizzle schema definitions
│   │   ├── process/       # Process entities
│   │   ├── workflow/      # Workflow definitions
│   │   ├── status/        # Status entities
│   │   └── ...           # Other domain schemas
│   ├── migrations/        # SQL migrations
│   ├── seeds/             # Seed data
│   └── scripts/           # Database scripts
```

### tRPC Package (`packages/trpc/`)
```
trpc/
├── src/
│   ├── entity/          # entity domain
│   │   ├── routers/       # tRPC routers
│   │   └── services/      # Business logic services
│   └── ...               # Other domains
```

### UI Package (`packages/ui/`)
- Shadcn/ui components
- Shared React components
- Tailwind CSS styling

## Key Conventions

### Import Patterns
- Apps import packages via workspace protocol: `@repo/package-name`
- Packages import from built `dist` folders in production
- Use TypeScript path aliases defined in `tsconfig.json`

### File Naming
- React components: PascalCase (e.g., `Button.tsx`)
- Utilities/services: kebab-case (e.g., `process-service.ts`)
- Types/interfaces: PascalCase (e.g., `ProcessType.ts`)

### Code Organization
- Services contain business logic (in `packages/trpc/src/*/services/`)
- Routers expose tRPC endpoints (in `packages/trpc/src/*/routers/`)
- Schemas define database tables (in `packages/db/src/schemas/`)
- Validators define Zod schemas (in `packages/validators/`)

### Workflow Architecture
The system uses a generic workflow engine:
- **Processes**: Generic entities (entity, pickup, return, payment, sort)
- **Workflows**: Define status graphs with transitions
- **Statuses**: States within a workflow
- **Status Transitions**: Valid paths between statuses
- **Status History**: Audit trail of all status changes

All workflow-related schemas are in `packages/db/src/schemas/` and services in `packages/trpc/src/entity/services/`.
