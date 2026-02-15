# SOS Incident Report Platform

A comprehensive incident report and child protection management platform built for SOS Children's Villages.

## Tech Stack

- **Runtime**: Bun v1.3.6
- **Monorepo**: Turborepo
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Shadcn/ui
- **Backend**: Express.js 5 + tRPC + Better Auth
- **Database**: PostgreSQL + Drizzle ORM
- **Cache**: Redis (ioredis)

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) v1.3.5+
- Docker & Docker Compose (for PostgreSQL and Redis)

### 1. Install Dependencies
```bash
bun install
```

### 2. Start Infrastructure
```bash
bun docker:up
```

### 3. Push Database Schema
```bash
bun db:push
```

If you want to auto-approve destructive changes (fresh local DB only):
```bash
bun run --cwd apps/packages/db db:push -- --force
```

### 4. Seed the Database
```bash
bun db:seed
```

### 5. Start Development
```bash
bun dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **tRPC**: http://localhost:5000/api/trpc
- **Health Check**: http://localhost:5000/health

## Project Structure

```
├── apps/
│   ├── api/          # Express.js backend (Bun runtime)
│   ├── web/          # React 19 frontend (Vite)
│   └── packages/
│       ├── auth/     # Better Auth configuration
│       ├── db/       # Drizzle schemas & migrations
│       ├── trpc/     # tRPC routers & services
│       ├── ui/       # Shadcn/ui component library
│       ├── validators/ # Zod validation schemas
│       ├── shared/   # Common utilities
│       └── logger/   # Logging utilities
```

## Key Features

- **Incident Reporting**: Full workflow from report → evaluation → action plan → follow-up → formal decision
- **Programs & Homes**: Manage organizational hierarchy
- **Children**: Track children across homes with medical notes
- **Users & Roles**: NATIONAL_DIRECTOR, PROGRAM_DIRECTOR, PSYCHOLOGIST, EDUCATOR, SOS_AUNT, SOS_MEMBER, EXTERNAL
- **Dashboard**: Real-time statistics with incident breakdowns
- **File Uploads**: Attach documents/images to incident reports (multer + local disk)
- **Role-Based Access Control**: Route protection based on user roles

## Common Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start all apps in dev mode |
| `bun build` | Build all packages and apps |
| `bun db:push` | Push schema changes to DB |
| `bun db:seed` | Seed database with test data |
| `bun db:studio` | Open Drizzle Studio |
| `bun docker:up` | Start PostgreSQL & Redis |
| `bun docker:down` | Stop Docker services |
| `bun check-types` | Type check all packages |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DB_URL=postgres://hackathon:hackathon@localhost:5434/hackathon
REDIS_URL=redis://localhost:6380
FRONTEND_URL=http://localhost:3000
```
