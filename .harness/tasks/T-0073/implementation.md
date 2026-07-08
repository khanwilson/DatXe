# Implementation: T-0073

## Summary

Added three new endpoints to the dispatch module for driver online/offline status and daily stats:
- `POST /drivers/online` - Set driver status to ONLINE
- `POST /drivers/offline` - Set driver status to OFFLINE
- `GET /drivers/stats` - Get today's trip count and earnings

## Changes Made

| File | Description |
|------|-------------|
| `nestjs_prisma/api/modules/dispatch/dispatch.service.ts` | Added `goOnline`, `goOffline`, and `getDriverStats` methods |
| `nestjs_prisma/api/modules/dispatch/dispatch.controller.ts` | Added corresponding endpoints with proper JWT authentication |

## Service Methods Implemented

### `goOnline(driverUserId: string)`
1. Finds driver by user_id
2. Throws NotFoundException if driver not found
3. Updates driver status to ONLINE and is_online to true
4. Returns driver info {id, full_name, status, is_online}

### `goOffline(driverUserId: string)`
1. Finds driver by user_id
2. Throws NotFoundException if driver not found
3. Updates driver status to OFFLINE and is_online to false
4. Returns driver info {id, full_name, status, is_online}

### `getDriverStats(driverUserId: string)`
1. Finds driver by user_id
2. Throws NotFoundException if driver not found
3. Calculates start of today (00:00:00)
4. Queries Booking table for completed trips today
5. Counts trips and sums final_price (treating null as 0)
6. Returns {tripsToday, earningsToday}

## Controller Endpoints Added

All endpoints use @UseGuards(JwtAuthGuard), @ApiBearerAuth(), and @CurrentUser():

- `POST /drivers/online`: Calls dispatchService.goOnline(user.sub)
- `POST /drivers/offline`: Calls dispatchService.goOffline(user.sub)
- `GET /drivers/stats`: Calls dispatchService.getDriverStats(user.sub)

The `@Get('stats')` endpoint is placed above `@Get(':id/location')` to prevent route conflicts.