# Handoff: T-0071

## Summary

Successfully wired the passenger-side trip lifecycle in `app_user` to real WebSocket events from the backend. Replaced the `useTripSimulation` mock with a new `useTripSocket` hook that consumes `trip.status_changed` and `driver.location_updated` events. All UI was already complete; this task connected the frontend state machine to live backend events. Passed evaluation and review with one fix round (ponytail comment on driverId ceiling, avatar constant, DEV mock timing alignment). TypeScript and ESLint clean.

## Files Changed

### New Files
- `/Users/chubo/Work/DatXe/app_user/src/api/hooks/useTripSocket.ts`

### Modified Files
- `/Users/chubo/Work/DatXe/app_user/src/constants/trip.ts`
- `/Users/chubo/Work/DatXe/app_user/src/api/socket/useBookingSocket.ts`
- `/Users/chubo/Work/DatXe/app_user/src/zustand/session.ts`
- `/Users/chubo/Work/DatXe/app_user/src/components/trip/TripStatusSheet.tsx`
- `/Users/chubo/Work/DatXe/app_user/app/ActiveTripScreen.tsx`
- `/Users/chubo/Work/DatXe/app_user/app/BookingRouteScreen.tsx`

## Commands Run

```bash
cd /Users/chubo/Work/DatXe/app_user && bun run tsc --noEmit
cd /Users/chubo/Work/DatXe/app_user && bun lint
```

Both passed clean (tsc 0 errors; lint 0 errors, 4 pre-existing warnings in untouched files).

## Test / Build Status

- **TypeScript**: `tsc --noEmit` PASS (0 errors)
- **ESLint**: `bun lint` PASS (0 errors; 4 pre-existing warnings)
- **Manual verification**: DEV mock via `runDevMock` fires full state progression (DRIVER_EN_ROUTE t+12s → DRIVER_ARRIVED t+20s → IN_PROGRESS t+25s → COMPLETED t+60s) plus periodic `driver.location_updated` ticks during EN_ROUTE and IN_PROGRESS legs.

## Contract Status

All acceptance criteria met:

1. ✅ "Looking for driver" state shows RadarAnimation and cancel option after payment
2. ✅ On `booking.driver_assigned`: driver info card shows (name, vehicle, rating, plate)
3. ✅ On `trip.status_changed` → `DRIVER_EN_ROUTE`: map shows live driver pin via `driver.location_updated`
4. ✅ On `trip.status_changed` → `DRIVER_ARRIVED`: TripStatusSheet shows "Driver has arrived"
5. ✅ On `trip.status_changed` → `IN_PROGRESS`: map shows route to dropoff with live driver position
6. ✅ On `trip.status_changed` → `COMPLETED`: trip summary (fare, distance, duration) and Done button
7. ✅ Cancellation option visible during FINDING and EN_ROUTE states
8. ✅ DEV mock fires full progression with correct timings
9. ✅ TypeScript passes
10. ✅ ESLint passes

All files modified are within Allowed Files scope. No out-of-scope projects touched.

## Review Status

PASS (re-review after Fix Round 1). All findings from initial review resolved:

- **ponytail comment on driverId ceiling**: Added at `useTripSocket.ts` lines 68–70, naming the null-driverId window during FINDING state (location events accepted but harmless since no location UI renders).
- **avatar constant**: Imported `DRIVER_AVATAR_PLACEHOLDER` from `constants/trip` and used as fallback in `BookingRouteScreen.handleDriverAssigned` line 161.
- **DEV mock timings**: Aligned DRIVER_ARRIVED to t+20s (was t+24s) and IN_PROGRESS to t+25s (was t+29s).

## Known Issues

None.

## Follow-up / Next Steps

1. **T-0072 (Integration & Realtime Wiring)**: Coordinate with driver-side trip flow (T-0070) to ensure bidirectional WS event flow works end-to-end in a live test.
2. **Avatar image handling**: `DRIVER_AVATAR_PLACEHOLDER` currently points to `i.pravatar.cc` (public mock service). Before production, replace with a bundled asset or a real avatar API.
3. **DEV mock toggle**: The `runDevMock` is automatically used when `isDevMock` is true (set by `useBookingSocket` on entry). Consider exposing this as a dev-only UI toggle or environment flag for easier testing.
4. **Backend T-0068 verification**: Confirm that `trip.status_changed` and `driver.location_updated` event payloads match the assumed shapes in `useTripSocket.onTripStatusChanged` and `onDriverLocationUpdated`.

## Final Status

**Done**

Task completed successfully. All phases passed: Implementing → Evaluating → Reviewing → Closing. Ready for integration testing with T-0072.
