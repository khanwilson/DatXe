# Plan: T-0073

## Goal

Implement three missing backend API endpoints that `app_taixe` needs:
- `POST /drivers/online` -- driver goes online
- `POST /drivers/offline` -- driver goes offline
- `GET /drivers/stats` -- driver daily stats (trips completed, earnings today)

## Requirements

1. **POST /drivers/online**: Set authenticated driver's `status = ONLINE` and `is_online = true`. Return driver info.
2. **POST /drivers/offline**: Set authenticated driver's `status = OFFLINE` and `is_online = false`. Return driver info.
3. **GET /drivers/stats**: Return today's stats: number of completed trips, total earnings (sum of `final_price` from completed bookings). Scoped to authenticated driver only.
4. All endpoints require JWT authentication via `JwtAuthGuard`.
5. Follow existing DispatchController/DispatchService patterns.

## Affected Areas

- **nestjs_prisma/api/modules/dispatch/dispatch.controller.ts** -- add 3 new endpoints
- **nestjs_prisma/api/modules/dispatch/dispatch.service.ts** -- add 3 new service methods

No other files need modification. No Prisma migration needed (schema already has `status`, `is_online`, `completed_at`, `final_price`).

## Current Context Read

### Prisma Schema (relevant fields)
- `Driver.status` -- `DriverStatus` enum (ONLINE, OFFLINE, SUSPENDED), default OFFLINE
- `Driver.is_online` -- Boolean, default false
- `Trip.completed_at` -- DateTime?, set when trip completes
- `Trip.status` -- TripStatus enum (has COMPLETED)
- `Trip.driver_id` -- String
- `Booking.final_price` -- Decimal?, the actual fare after trip completion
- `Booking.driver_id` -- String? (set when driver assigned)
- `Booking.status` -- BookingStatus enum (has COMPLETED)

### Auth Pattern
- `JwtAuthGuard` protects endpoints
- `@CurrentUser() user: JwtPayload` extracts `{ sub: user_id, user_name }` from JWT
- `user.sub` is the **user_id**, not driver_id -- need to look up Driver by `user_id`

### Route Ordering Concern
- Existing: `GET /drivers/:id/location` (parameterized route)
- New: `GET /drivers/stats` (literal route)
- NestJS matches routes in declaration order. Literal `stats` must be declared **above** `:id/location` to avoid `stats` being captured as `:id`.

## Proposed Approach

### 1. DispatchService -- add 3 methods

**`goOnline(driverUserId: string)`**
```
1. Find driver by user_id (prisma.driver.findUnique where user_id)
2. Throw NotFoundException if driver not found
3. Update driver: status = ONLINE, is_online = true
4. Return { id, full_name, status, is_online }
```

**`goOffline(driverUserId: string)`**
```
1. Find driver by user_id
2. Throw NotFoundException if not found
3. Update driver: status = OFFLINE, is_online = false
4. Return { id, full_name, status, is_online }
```

**`getDriverStats(driverUserId: string)`**
```
1. Find driver by user_id to get driver.id
2. Throw NotFoundException if driver not found
3. Compute start of today: new Date(), setHours(0,0,0,0)
4. Query Booking directly:
     where: { driver_id: driver.id, status: COMPLETED, updated_at >= todayStart }
     select: { final_price: true }
5. Count trips, sum final_price (treat null as 0)
6. Return { tripsToday: count, earningsToday: number }
```

Using Booking directly is simpler than Trip because `final_price` lives on Booking. Booking gets `driver_id` set at dispatch time and `status = COMPLETED` when the ride finishes.

### 2. DispatchController -- add 3 endpoints

All use `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`, `@CurrentUser()`.

```typescript
@Post('online')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOkResponse({ description: 'Driver is now online' })
async goOnline(@CurrentUser() user: JwtPayload) {
  const data = await this.dispatchService.goOnline(user.sub);
  return { success: true, data };
}

@Post('offline')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOkResponse({ description: 'Driver is now offline' })
async goOffline(@CurrentUser() user: JwtPayload) {
  const data = await this.dispatchService.goOffline(user.sub);
  return { success: true, data };
}

@Get('stats')            // MUST be declared above @Get(':id/location')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOkResponse({ description: 'Driver stats for today' })
async getStats(@CurrentUser() user: JwtPayload) {
  const data = await this.dispatchService.getDriverStats(user.sub);
  return { success: true, data };
}
```

## API Contract

### POST /drivers/online
- **Auth**: JWT (driver)
- **Request**: empty body
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "driver-uuid",
    "full_name": "Nguyen Van A",
    "status": "ONLINE",
    "is_online": true
  }
}
```
- **Response 404**: Driver profile not found for this user

### POST /drivers/offline
- **Auth**: JWT (driver)
- **Request**: empty body
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "driver-uuid",
    "full_name": "Nguyen Van A",
    "status": "OFFLINE",
    "is_online": false
  }
}
```
- **Response 404**: Driver profile not found for this user

### GET /drivers/stats
- **Auth**: JWT (driver)
- **Request**: no params
- **Response 200**:
```json
{
  "success": true,
  "data": {
    "tripsToday": 5,
    "earningsToday": 350000
  }
}
```
- `earningsToday` is a number (VND), summed from `Booking.final_price` (null treated as 0)

## Phases / Steps

1. **Add service methods** in `dispatch.service.ts`:
   - `goOnline(driverUserId)` -- find driver by user_id, update status + is_online
   - `goOffline(driverUserId)` -- find driver by user_id, update status + is_online
   - `getDriverStats(driverUserId)` -- query completed bookings today, sum final_price

2. **Add controller endpoints** in `dispatch.controller.ts`:
   - Import `Post` from `@nestjs/common`
   - Add `@Post('online')`, `@Post('offline')`, `@Get('stats')`
   - `@Get('stats')` placed above existing `@Get(':id/location')` to avoid route conflict
   - Add Swagger decorators

3. **Verify** route ordering does not break existing `GET /drivers/:id/location`

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Route conflict: `GET /drivers/stats` vs `GET /drivers/:id/location` | Place `@Get('stats')` above `@Get(':id/location')` in controller |
| Driver record not found for JWT user | Service throws `NotFoundException` with clear message |
| `final_price` is null for some completed bookings | Treat null as 0 in sum |
| No role-based guard yet (any JWT user could call) | Acceptable for now; driver lookup by user_id naturally filters -- customer records won't have a driver row. Role guard can be added in a future task. |

## Architect Required?

No

## Testing Strategy

- **TypeScript compilation**: `npx tsc --noEmit` to verify types
- **Manual curl** against running backend:
  - Login as driver, get JWT
  - `POST /drivers/online` -- verify status changes to ONLINE
  - `POST /drivers/offline` -- verify status changes to OFFLINE
  - `GET /drivers/stats` -- verify correct count/earnings
  - `GET /drivers/:id/location` -- verify existing endpoint still works (no route conflict)

## Estimated Effort

~30 minutes. Straightforward CRUD additions to existing module.

## Approval Gate

Waiting for user approval before Contracting.
