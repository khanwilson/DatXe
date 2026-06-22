# Project State

**Last Updated**: 2026-06-22  
**Harness Version**: 1.0

---

## Architecture Overview

### Projects

| Project | Role | Status | Tech Stack |
|---------|------|--------|-----------|
| **app_taixe** | Mobile app for drivers | Active | React Native + Expo + TypeScript |
| **app_user** | Mobile app for customers | Active | React Native + Expo + TypeScript |
| **nestjs_prisma** | Backend API | Active | NestJS + Prisma + TypeScript |

### Deployment Model

- **Frontend**: React Native apps (iOS/Android via Expo)
- **Backend**: NestJS REST API
- **Database**: Managed via Prisma ORM
- **Authentication**: [To be documented when implemented]
- **Deployment**: [To be documented when implemented]

---

## Completed Capabilities

- [ ] User registration (driver & customer)
- [ ] User authentication
- [ ] Driver profile management
- [ ] Customer profile management
- [ ] Ride booking flow
- [ ] Ride tracking
- [ ] Payment system
- [ ] Rating & review system

---

## Active API Contracts

### Authentication API
- **Endpoint**: `POST /api/auth/register` | `POST /api/auth/login`
- **Status**: Not yet documented
- **Last Updated**: -
- **Projects**: app_taixe, app_user, nestjs_prisma

---

## Active Prisma Models & Database Conventions

### Conventions
- **Naming**: PascalCase for models, camelCase for fields
- **Timestamps**: `createdAt`, `updatedAt` on all models
- **Soft Delete**: [Not yet decided]
- **ID Type**: [To be confirmed in first DB task]

### Models
- [ ] User (base model for drivers & customers)
- [ ] Driver (extends User)
- [ ] Customer (extends User)
- [ ] Ride
- [ ] RideLocation
- [ ] Payment
- [ ] Rating

---

## Shared Conventions

### Code Style
- **Language**: TypeScript with strict mode
- **Linting**: ESLint (if configured in projects)
- **Formatting**: Prettier (if configured in projects)
- **Type Checking**: TypeScript strict

### Folder Structure
- `src/` - Source code
- `src/types/` - Shared types
- `src/components/` - React components (mobile apps)
- `src/services/` - Business logic
- `src/modules/` - NestJS modules

### Error Handling
- [To be documented]

### Logging
- [To be documented]

---

## Known Risks

- **API Contract Mismatch**: Frontend/backend API signatures may diverge
- **Database Migration**: Migration strategy not yet defined
- **Authentication Flow**: Implementation approach not yet decided
- **Cross-app State**: How user state syncs between apps unclear
- **Offline Support**: Unclear if mobile apps need offline-first design

---

## Open Technical Debt

- No test coverage documented
- No CI/CD pipeline configured
- No error handling strategy defined
- No logging strategy defined
- No environment configuration strategy
- No API versioning strategy
- No database backup strategy

---

## Recently Completed Tasks

- None yet (harness initialized 2026-06-22)

---

## Suggested Next Tasks

1. **T-0001**: Setup project initialization & harness validation
2. **T-0002**: Design authentication & authorization flow
3. **T-0003**: Create User, Driver, Customer Prisma models
4. **T-0004**: Implement user registration API (backend)
5. **T-0005**: Implement user registration screen (app_taixe)
6. **T-0006**: Implement user registration screen (app_user)
7. **T-0007**: Implement login API (backend)
8. **T-0008**: Implement login screens (mobile apps)

---

## Assumptions

- Repository root is `/Users/chubo/Work/DatXe/` (named `hethong` logically)
- Project structure is as-is; no source code reorganization
- Each project manages its own dependencies
- No monorepo tooling (Nx, Turborepo) in use
- Tasks are sequential unless explicitly parallelized
- No existing CLAUDE.md or harness setup before this initialization

---

## Environment Variables & Secrets

**[Not yet configured]**

Define once first task needs it:
- Backend API URL
- Database connection string
- Authentication secrets
- Third-party API keys

---

## Performance Baseline

**[Not yet measured]**

To be established after core features working:
- API response times
- Mobile app startup time
- Database query performance
- Build times

