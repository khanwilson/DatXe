# Implementation Decisions: T-0073

## Decision 1: Placement of @Get('stats') Endpoint
Placed the `@Get('stats')` endpoint above `@Get(':id/location')` in the controller to prevent NestJS from matching 'stats' as the ':id' parameter. This ensures both endpoints work correctly.

## Decision 2: Earnings Calculation
In the `getDriverStats` method, treated null `final_price` values as 0 when calculating earnings to prevent NaN results and ensure consistent numeric output.

## Decision 3: Date Range for Stats
Used `updated_at >= start_of_today` to filter bookings for the current day's stats, which captures all completed bookings from midnight onwards.

## Decision 4: Driver Lookup Method
Used `prisma.driver.findUnique({ where: { user_id: driverUserId } })` as specified in the contract to look up drivers by user_id (JWT subject) rather than driver ID.

## Decision 5: Service Method Return Values
Returned only the necessary fields (id, full_name, status, is_online) from the goOnline/goOffline methods to match the API contract while keeping responses lightweight.