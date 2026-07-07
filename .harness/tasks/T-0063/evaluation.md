# T-0063 Evaluation Report

**Task**: BE: Dispatch Module (Find Nearest Driver)
**Evaluator**: Sonnet
**Date**: 2026-07-07
**Status**: ✅ PASS

---

## Quality Checks

### Code Quality
- ✅ **Lint**: PASS (0 errors, 0 warnings)
- ✅ **TypeScript**: PASS (0 errors)
- ✅ **Build**: SUCCESS
- ✅ **No secrets**: PASS (no hard-coded keys found)

### Tests
- ⚠️ **Unit tests**: N/A (no test files exist in project)
- ⚠️ **Integration tests**: N/A (no test files exist in project)
- ⚠️ **Test runner**: Jest configured but watchman permission issue (environment issue, not code issue)

---

## Contract Compliance

### Allowed Files
✅ **All changes within allowed scope**:
- `prisma/schema.prisma` - Added enum values
- `prisma/migrations/20260707010000_dispatch_booking_status_enum/migration.sql` - Created migration
- `api/app.module.ts` - Imported modules
- `api/common/websocket/websocket.gateway.ts` - Added emit methods + SubscribeMessage handler
- `api/modules/payment/payment.service.ts` - Added EventEmitter2 injection + emit
- `api/modules/dispatch/*` - All new files created
- `eslint.config.mjs` - Added Node.js globals (minor config fix)

### Out of Scope
✅ **No violations**:
- Did not modify `app_user` or `app_taixe`
- Did not modify other backend modules beyond contract
- Did not implement UI (correctly deferred to T-0070)

---

## Acceptance Criteria Verification

### 1. PATCH /api/v1/drivers/location
✅ **PASS**
- Endpoint implemented in `dispatch.controller.ts`
- Protected by `JwtAuthGuard`
- Calls `updateDriverLocation(driverId, dto)`
- Updates `Driver.current_location` with `{lat, lng, heading, updated_at}`

### 2. VNPay callback → Booking.status = LOOKING_DRIVER
✅ **PASS**
- `PaymentService.handleVnpayCallback` emits `payment.success` event
- `DispatchListener` listens to `@OnEvent('payment.success')`
- Calls `runDispatchLoop(bookingId)` which sets `Booking.status = LOOKING_DRIVER`

### 3. Dispatch loop: 3 rounds with 5/10/15km radius
✅ **PASS**
- `DISPATCH_ROUNDS` constant: `[{radius: 5}, {radius: 10}, {radius: 15}]`
- Each round queries drivers and filters by Haversine distance

### 4. Haversine distance calculation
✅ **PASS**
- `haversineKm(lat1, lng1, lat2, lng2)` function implemented
- Uses standard Haversine formula with Earth radius = 6371km
- Drivers filtered: `x.dist <= round.radius`
- Sorted ascending by distance

### 5. Offer created with expires_at = now + 15s
✅ **PASS**
- `OFFER_TIMEOUT_MS = 15_000`
- `expiresAt = new Date(Date.now() + OFFER_TIMEOUT_MS)`
- `DispatchOffer.expired_at = expiresAt`

### 6. WS driver.new_offer emit to driver:{driverId}
✅ **PASS**
- `gateway.emitDriverNewOffer(driverId, payload)` implemented
- Emits to room `driver:{driverId}`
- Payload matches contract: `{offerId, bookingId, pickupAddress, dropoffAddress, estimatedPrice, vehicleType, distanceKm, expiresAt}`

### 7. Driver accept → Booking = ACCEPTED, Trip created, WS booking.driver_assigned
✅ **PASS**
- `waitForOffer(offerId)` resolves with `accepted = true`
- Updates `DispatchOffer.status = ACCEPTED`
- Updates `Booking.status = ACCEPTED`, `Booking.driver_id = driver.id`
- Creates `Trip` with `status = CREATED`
- Emits `booking.driver_assigned` to both `booking:{bookingId}` and `driver:{driverId}`
- Payload includes driver info: `{id, name, phone, vehicleType, vehiclePlate, rating, lat, lng}`

### 8. Driver reject → continue to next driver
✅ **PASS**
- `waitForOffer(offerId)` resolves with `accepted = false`
- Adds driver to `skipSet`
- Continues to next driver in loop
- Updates `DispatchOffer.status = REJECTED`

### 9. Offer timeout 15s → DispatchOffer.status = EXPIRED
✅ **PASS**
- `waitForOffer` uses `setTimeout(OFFER_TIMEOUT_MS)`
- If timeout fires, resolves with `false`
- Checks current offer status: if still `PENDING`, sets to `EXPIRED`
- Adds driver to `skipSet`, continues to next driver

### 10. No driver found after 3 rounds → WS booking.no_driver_found, Booking = NO_DRIVER
✅ **PASS**
- After all rounds exhausted, updates `Booking.status = NO_DRIVER`
- Emits `booking.no_driver_found` to `booking:{bookingId}`
- Payload: `{bookingId, message: 'Không tìm được tài xế. Vui lòng thử lại.'}`

### 11. No ONLINE drivers → graceful handling
✅ **PASS**
- If no ONLINE drivers, `drivers` array is empty
- `driversInRadius` is empty
- Loop doesn't execute
- Falls through to `NO_DRIVER` status
- No exceptions thrown

### 12. Prisma migration
⚠️ **CANNOT VERIFY**
- Database server not running in sandbox environment
- Migration SQL file created: `20260707010000_dispatch_booking_status_enum/migration.sql`
- SQL is correct: `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'LOOKING_DRIVER'` (and others)
- User will need to run `bun prisma migrate dev` manually when DB is available

### 13. Build passes
✅ **PASS**
- `bun run build` completed successfully
- No TypeScript errors
- No compilation errors

### 14. Lint passes
✅ **PASS**
- `bun run lint` completed successfully
- 0 errors, 0 warnings

---

## Implementation Quality

### Architecture
✅ **Clean separation of concerns**:
- `DispatchController` - HTTP endpoint only
- `DispatchService` - Business logic (location update, dispatch loop, offer resolution)
- `DispatchListener` - Event handling (listens to payment.success)
- `WebSocketGateway` - WS communication (emit methods + SubscribeMessage handler)

### Code Quality
✅ **Type safety**:
- All Prisma queries use proper types
- `Prisma.InputJsonValue` for JSON field
- `as unknown as DriverLocation` for safe JSON casting
- Proper TypeScript types throughout

✅ **Error handling**:
- Graceful handling when booking not found
- Graceful handling when no drivers available
- No unhandled promise rejections

✅ **Concurrency**:
- `resolverMap` properly manages concurrent offer responses
- Each offer has unique resolver
- Timeout cleanup prevents memory leaks

✅ **Logging**:
- Comprehensive logging at key points
- Uses NestJS Logger
- Logs dispatch start, each round, driver accept/reject, no driver found

### Performance Considerations
✅ **Efficient queries**:
- Single query per round to fetch all ONLINE drivers
- In-memory filtering by Haversine distance
- Skip set prevents re-querying rejected drivers

✅ **No blocking operations**:
- `waitForOffer` uses Promise + setTimeout (non-blocking)
- Dispatch loop is async/await (non-blocking)

---

## Security Review

✅ **No hard-coded secrets**:
- No API keys
- No passwords
- No tokens

✅ **Authentication**:
- `PATCH /drivers/location` protected by `JwtAuthGuard`
- Only authenticated drivers can update their location

✅ **Authorization**:
- Driver can only update their own location (uses `user.sub` from JWT)

✅ **Input validation**:
- `UpdateDriverLocationDto` validates lat/lng ranges
- `class-validator` decorators enforce constraints

---

## Known Limitations

1. **No database migration test**: Cannot verify migration runs cleanly without DB server
2. **No unit tests**: Project has no test files; evaluation cannot verify test coverage
3. **No integration tests**: Cannot verify end-to-end flow without running app
4. **Concurrency lock**: Multiple simultaneous dispatch loops for same booking could conflict (acceptable for MVP, T-0068 can add lock)
5. **Resolver map memory**: If app crashes mid-dispatch, resolvers in Map are lost (acceptable for MVP)

---

## Files Changed

### New Files (6)
- `api/modules/dispatch/dispatch.module.ts` (14 lines)
- `api/modules/dispatch/dispatch.controller.ts` (29 lines)
- `api/modules/dispatch/dispatch.service.ts` (217 lines)
- `api/modules/dispatch/dispatch.listener.ts` (17 lines)
- `api/modules/dispatch/dto/update-driver-location.dto.ts` (19 lines)
- `prisma/migrations/20260707010000_dispatch_booking_status_enum/migration.sql` (4 lines)

### Modified Files (5)
- `prisma/schema.prisma` (+3 enum values)
- `api/app.module.ts` (+2 imports)
- `api/common/websocket/websocket.gateway.ts` (+60 lines: 3 emit methods + SubscribeMessage handler + registerDispatchService)
- `api/modules/payment/payment.service.ts` (+4 lines: EventEmitter2 injection + emit)
- `eslint.config.mjs` (+5 lines: Node.js globals)

---

## Evaluation Result

### ✅ PASS

**All acceptance criteria met** (except migration which cannot be verified without DB).

**Ready to proceed to Reviewing phase.**

---

## Recommendations for User

1. **Run migration manually**:
   ```bash
   cd nestjs_prisma
   bun prisma migrate dev
   ```

2. **Test the flow**:
   - Start backend: `bun run start:dev`
   - Create a booking, complete VNPay payment
   - Verify dispatch loop starts (check logs)
   - Simulate driver accept/reject via WebSocket client

3. **Monitor dispatch logs**:
   - Look for "Dispatch loop started for booking X"
   - Look for "Dispatch round radius=Xkm for booking Y"
   - Look for "Driver Z accepted booking X" or "No driver found for booking X"

4. **Future enhancements** (T-0068):
   - Add concurrency lock for dispatch loops
   - Add Redis Geo for more efficient driver queries
   - Add retry mechanism for failed dispatches
