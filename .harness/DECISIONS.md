# Decisions Log

**Last Updated**: 2026-06-24  
**Format**: Per-decision tracking with status and impact

---

## Active Decisions

### D-0001: Task-Based Harness Framework

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | Harness Setup (2026-06-22) |
| **Context** | Need structured task management for multi-project coordination |
| **Decision** | Implement task-based workflow with phases: Created → Planning → Contracting → Generating → Evaluating → Fixing → Closing → Done |
| **Impacted Projects** | All (harness) |
| **Consequences** | <ul><li>All tasks must follow structured workflow</li><li>No code before plan & contract</li><li>API contracts must be documented</li><li>Prisma schema changes must be tracked</li></ul> |

### D-0002: Prisma Schema Conventions

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0002 (2026-06-23) |
| **Context** | Need consistent conventions for database schema design |
| **Decision** | PascalCase models, camelCase fields, uuid() @id, snake_case tables via @@map, Decimal for prices, cascade delete for dependent relations |
| **Impacted Projects** | nestjs_prisma |
| **Consequences** | <ul><li>All future models follow these conventions</li><li>Price fields use Decimal @db.Decimal(10, 2)</li><li>Foreign keys use cascade delete for 1:1 dependent relations (User→Customer, User→Driver)</li><li>Optional relations use nullable foreign keys</li><li>Indexes on frequent query columns</li></ul> |

### D-0003: User Model Design

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0002 (2026-06-23) |
| **Context** | Need to support different user types (customer, driver, admin) in single User model |
| **Decision** | Single User model with role enum (CUSTOMER, DRIVER, ADMIN), separate Customer/Driver models linked 1:1 |
| **Impacted Projects** | nestjs_prisma, app_taixe, app_user |
| **Consequences** | <ul><li>User.role determines user type</li><li>Customer/Driver models extend User with type-specific fields</li><li>Auth JWT payload includes role for authorization guards</li><li>Register endpoint defaults role=CUSTOMER (backward compatible)</li></ul> |

---

## Pending Decisions

### P-D-0001: Authentication Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | T-0006 (Auth API refresh token) |
| **Options** | <ul><li>JWT with refresh tokens</li><li>Session-based with cookies</li><li>OAuth 2.0 integration</li><li>Firebase Auth</li></ul> |
| **Impact Scope** | NestJS backend, both mobile apps, database schema |
| **Notes** | T-0001 set up JWT access/refresh tokens. T-0002 added role to JWT payload. T-0006 will implement full refresh token flow. |

### P-D-0002: Database Strategy

| Field | Value |
|-------|-------|
| **Status** | Resolved |
| **Resolved By** | T-0001 + T-0002 |
| **Decision** | PostgreSQL with PostGIS + Prisma ORM |
| **Details** | <ul><li>PostgreSQL 16 with PostGIS extension for geo queries</li><li>Prisma ORM for migrations, queries, and type safety</li><li>Database conventions documented in PROJECT_STATE.md</li><li>Redis installed (T-0003) for caching, Geo, streams</li></ul> |

### D-0004: Package Manager — bun

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0003 (2026-06-23) |
| **Context** | Project dùng bun (có bun.lock) nhưng lệnh install ban đầu chạy bằng npm, gây conflict |
| **Decision** | Dùng bun cho tất cả operations (install, run build, run lint, etc.) |
| **Impacted Projects** | nestjs_prisma |
| **Consequences** | <ul><li>`bun add <package>` thay vì `npm install`</li><li>`bun run build` thay vì `npm run build`</li><li>`bun run lint` thay vì `npm run lint`</li><li>Không dùng npm trong project directory</li></ul> |

### P-D-0003: API Versioning

| Field | Value |
|-------|-------|
| **Status** | Resolved |
| **Resolved By** | T-0001 |
| **Decision** | URL versioning with `/api/v1/` prefix |
| **Details** | <ul><li>API_PREFIX = `/api/v1` configurable via env</li><li>All future endpoints use this prefix</li><li>Version bump when breaking changes needed</li></ul> |

### P-D-0004: State Management (Mobile Apps)

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | First feature requiring complex state |
| **Options** | <ul><li>Redux/Redux Toolkit</li><li>Zustand</li><li>MobX</li><li>React Context</li><li>Jotai</li></ul> |
| **Impact Scope** | app_taixe, app_user architecture |
| **Notes** | Affects code structure, testing strategy, developer experience |

### P-D-0005: Testing Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When test coverage requirements become clear |
| **Options** | <ul><li>Unit + integration (Jest)</li><li>E2E testing (Cypress, Detox)</li><li>API contract testing</li><li>Visual regression testing</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects CI/CD, release confidence, development velocity |

### P-D-0006: Deployment & Environment Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | Pre-production setup |
| **Options** | <ul><li>AWS/GCP/Azure</li><li>Heroku</li><li>Docker + Kubernetes</li><li>Vercel/Railway</li><li>Managed services (Firebase, Supabase)</li></ul> |
| **Impact Scope** | Backend deployment, CI/CD pipeline, infrastructure |
| **Notes** | Affects cost, scalability, team DevOps knowledge |

### P-D-0007: Monitoring & Logging

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When production issues appear |
| **Options** | <ul><li>Sentry for error tracking</li><li>DataDog/New Relic for APM</li><li>ELK Stack for logs</li><li>Cloudwatch/Stackdriver</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects debugging, incident response, performance insights |

---

## Superseded Decisions

*(None yet)*

---

## Decision Making Process

1. **Identify**: Recognize when a decision is needed (triggered by task, risk, or recurring question)
2. **Document**: Add to Pending Decisions with Status = Pending
3. **Discuss**: Evaluate options and consequences (may span multiple tasks)
4. **Decide**: Once decided, move to Active Decisions with Status = Accepted
5. **Communicate**: Update `PROJECT_STATE.md` and affected task handoffs
6. **Implement**: Apply decision in new tasks
7. **Review**: Periodically review if decision still holds (quarterly?)

---

## Linking Decisions to Tasks

When a task involves a decision:

- If decision **already exists** in this file: reference it by ID in task `decisions.md`
- If decision is **new to this task**: create it here with `Source Task` set to current task
- If decision **only affects current task**: keep in `tasks/T-XXXX/decisions.md` (don't promote)
- If decision **affects future tasks**: promote to this file

