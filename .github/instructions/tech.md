---
trigger: always_on
---

# Technology Stack

## Build System & Tooling

- **Monorepo**: Turborepo for orchestration and caching
- **Package Manager**: Bun (v1.3.5)
- **Runtime**: Bun (v1.3.5)
- **Code Quality**: Ultracite (Biome) for linting and formatting
- **Version Control**: Git with Husky pre-commit hooks

## Frontend (Admin App)

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **UI Library**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query) with tRPC client
- **Internationalization**: i18next

## Backend (API App)

- **Framework**: Express.js 5
- **Runtime**: Bun
- **API Layer**: tRPC for type-safe APIs
- **Authentication**: Better Auth
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **File Upload**: Multer with Sharp for image processing
- **Testing**: Jest with Supertest

## Shared Packages

- `@repo/ui` - Shared UI components (Shadcn/ui)
- `@repo/auth` - Authentication logic (Better Auth)
- `@repo/db` - Database schemas and migrations (Drizzle)
- `@repo/trpc` - tRPC routers and procedures
- `@repo/validators` - Shared Zod validation schemas
- `@repo/shared` - Common utilities and types
- `@repo/logger` - Logging utilities
- `@repo/typescript-config` - Shared TypeScript configurations
- `@repo/jest-presets` - Jest test configurations

## Common Commands

### Development
```bash
bun dev              # Start all apps with package watching
bun dev --filter=admin   # Start frontend only
bun dev --filter=api     # Start backend only
```

### Database
```bash
bun db:generate      # Generate Drizzle migrations
bun db:migrate       # Run migrations
bun db:push          # Push schema changes
bun db:studio        # Open Drizzle Studio
bun db:seed          # Seed database
bun db:reset         # Reset database
```

### Infrastructure
```bash
bun docker:up        # Start PostgreSQL
bun docker:down      # Stop Docker services
```

### Code Quality
```bash
bun format           # Format code with Ultracite
bun lint             # Lint code with Ultracite
bun check-types      # Type check all packages
bun test             # Run all tests
```

### Build & Deploy
```bash
bun build            # Build all packages and apps
bun clean            # Clean build artifacts
```

## Development Notes

- We use Drizzle ORM Relation Query Builder v2 (rqb-v2) in Drizzle ORM v1 (beta)
- Apps import from package `dist` folders (not `src`) for optimal performance
- Packages use `bunchee` or `tsup` for builds
- The main `bun dev` command pre-builds packages, then watches for changes
- Admin app uses Vite HMR (non-interruptible)
- API server restarts on package changes (interruptible)
- TypeScript project references are used for monorepo type checking