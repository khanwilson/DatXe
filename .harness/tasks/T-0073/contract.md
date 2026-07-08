# Contract: T-0073

## Source Inputs
- Plan: `.harness/tasks/T-0073/plan.md` (approved)
- Task description: `.harness/tasks/T-0073/description.md`
- Project state: not present
- Decisions: not present

## Scope

Add three endpoints to the existing `dispatch` module:

1. `POST /drivers/online` — set authenticated driver's `status = ONLINE`, `is_online = true`, return driver info
2. `POST /drivers/offline` — set authenticated driver's `status = OFFLINE`, `is_online = false`, return driver info
3. `GET /drivers/stats` — return today's completed trip count and earnings sum from `Booking.final_price` for the authenticated driver

All endpoints use `JwtAuthGuard` + `@CurrentUser()`. Driver lookup is by `user_id` (from `user.sub`) not `driver.id`.

`GET /drivers/stats` must be declared in the controller above `@Get(':id/location')` to prevent NestJS from matching the literal `stats` as the `:id` param.

## Out of Scope

- No new files (no new DTOs, no new modules, no new guards)
- No Prisma schema changes
- No migration
- No changes to auth flow or JWT payload
- No role-based guard (out of scope for this task)
- No changes to `app_taixe`, `app_user`, or any file outside the two allowed files
- No changes to existing `updateDriverLocation` or `getDriverLocation` methods

## Allowed Files

- `nestjs_prisma/api/modules/dispatch/dispatch.service.ts`
- `nestjs_prisma/api/modules/dispatch/dispatch.controller.ts`

## Protected Files / Projects

- `app_taixe/**` — must not be touched
- `app_user/**` — must not be touched
- `nestjs_prisma/prisma/schema.prisma` — no schema changes
- All other `nestjs_prisma` files not listed in Allowed Files

## Acceptance Criteria

- [ ] `POST /drivers/online` returns HTTP 200 with `{ success: true, data: { id, full_name, status: "ONLINE", is_online: true } }`
- [ ] `POST /drivers/offline` returns HTTP 200 with `{ success: true, data: { id, full_name, status: "OFFLINE", is_online: false } }`
- [ ] `GET /drivers/stats` returns HTTP 200 with `{ success: true, data: { tripsToday: number, earningsToday: number } }`
- [ ] All three endpoints return HTTP 401 when called without a valid JWT
- [ ] All three endpoints return HTTP 404 when the JWT user has no associated driver record
- [ ] Existing `GET /drivers/:id/location` still works correctly (no route conflict regression)
- [ ] `earningsToday` treats null `final_price` as 0 (no NaN or crash)
- [ ] TypeScript compilation passes with no new type errors

## Required Checks

- [ ] typecheck: `cd nestjs_prisma && npx tsc --noEmit`
- [ ] lint: `cd nestjs_prisma && npx eslint api/modules/dispatch/dispatch.controller.ts api/modules/dispatch/dispatch.service.ts`
- [ ] build: `cd nestjs_prisma && npm run build` (or equivalent)
- [ ] tests: run existing test suite if present; log as skipped if none exist
- [ ] manual verification: curl against running backend — POST /drivers/online, POST /drivers/offline, GET /drivers/stats, GET /drivers/:id/location (confirm no regression)

## API Contract

### POST /drivers/online
- Auth: Bearer JWT required
- Request body: empty
- Response 200:
```json
{ "success": true, "data": { "id": "string", "full_name": "string", "status": "ONLINE", "is_online": true } }
```
- Response 401: no/invalid JWT
- Response 404: driver record not found for this user

### POST /drivers/offline
- Auth: Bearer JWT required
- Request body: empty
- Response 200:
```json
{ "success": true, "data": { "id": "string", "full_name": "string", "status": "OFFLINE", "is_online": false } }
```
- Response 401: no/invalid JWT
- Response 404: driver record not found for this user

### GET /drivers/stats
- Auth: Bearer JWT required
- Request: no params, no body
- Response 200:
```json
{ "success": true, "data": { "tripsToday": 5, "earningsToday": 350000 } }
```
- `earningsToday` is a plain number (VND), summed from `Booking.final_price` where `driver_id = driver.id`, `status = COMPLETED`, and `updated_at >= start of today`
- Response 401: no/invalid JWT
- Response 404: driver record not found for this user

## Database / Migration Impact

None. All required fields already exist in the current Prisma schema:
- `Driver.status` (DriverStatus enum: ONLINE, OFFLINE, SUSPENDED)
- `Driver.is_online` (Boolean)
- `Booking.final_price` (Decimal?)
- `Booking.driver_id` (String?)
- `Booking.status` (BookingStatus enum, has COMPLETED)
- `Booking.updated_at` (DateTime)

No migration required.

## Security / Secrets / Auth Impact

No changes to auth infrastructure. All new endpoints are guarded by the existing `JwtAuthGuard`. The natural security boundary is that `user.sub` (user_id) is used to look up the driver record — a customer user_id will not have a driver row and will receive a 404, which is acceptable for now.

No secrets or credentials are involved.

## Native / Release Impact

None. Backend-only change. No app rebuild or store release required.

## Implementation Constraints

1. Driver lookup must use `prisma.driver.findUnique({ where: { user_id: driverUserId } })` — `user.sub` is the `user_id`, not `driver.id`.
2. Throw `NotFoundException` (imported from `@nestjs/common`) when driver record is not found.
3. `@Post('online')` and `@Post('offline')` must include `@HttpCode(HttpStatus.OK)`.
4. `@Get('stats')` must be placed **above** `@Get(':id/location')` in the controller declaration order.
5. Add `Post` to the `@nestjs/common` import in `dispatch.controller.ts`.
6. Add `NotFoundException` to the `@nestjs/common` import in `dispatch.service.ts`.
7. Stats query uses `Booking` model directly (not `Trip`), because `final_price` lives on `Booking`.
8. `earningsToday` sum: iterate results, treat `null` final_price as 0, convert `Decimal` to `Number`.
9. Follow existing response shape: `{ success: true, data: ... }`.
10. Follow existing Swagger decorator pattern: `@ApiBearerAuth()`, `@ApiOkResponse({ description: '...' })`, `@ApiTags('Drivers')` is already on the controller class.

## Fix Loop Rules

- If typecheck fails due to a missing import, add only the specific import needed.
- If route conflict is detected (stats being matched as `:id`), verify declaration order and move `@Get('stats')` higher.
- If `Decimal` to number conversion causes type errors, use `Number(value ?? 0)`.
- Maximum 2 fix attempts before escalating to harness-architect.

## Escalation Triggers

- If `Driver` model does not have a `user_id` field (schema mismatch with plan assumptions) — escalate to harness-architect before writing any code.
- If `Booking` model does not have `driver_id` or `updated_at` — escalate to harness-architect.
- If the existing controller uses a different auth pattern than `JwtAuthGuard` + `@CurrentUser()` — escalate.

## User Approvals

Plan approved by user before contracting phase.

## Status
READY_FOR_IMPLEMENTING
