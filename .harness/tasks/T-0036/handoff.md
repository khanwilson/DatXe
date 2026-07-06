# T-0036 Handoff — Active trip tracking (app_user)

**Status**: Done
**Completed**: 2026-07-06

## Summary

Implemented a fully mocked active-trip tracking flow in app_user. After the user taps "Book" in `BookingRouteScreen`, they are navigated to `ActiveTripScreen` which simulates a 5-state ride lifecycle (FINDING → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED) with an animated driver marker on the Mapbox map, a status-aware bottom card, and completion summary.

## Files Changed

### New
- `app_user/app/ActiveTripScreen.tsx` — route screen; wires simulation hook + map + status sheet
- `app_user/src/constants/trip.ts` — TripStatus type, MockDriver type, MOCK_DRIVER constant, TRIP_TIMING constants
- `app_user/src/components/trip/useTripSimulation.ts` — lifecycle state machine + driver position simulation
- `app_user/src/components/trip/TripStatusSheet.tsx` — status-aware bottom card (FINDING spinner, driver card, cancel, completion summary, done)

### Modified
- `app_user/src/components/map/AppMap.tsx` — additive `driver?: [number, number]` prop + PointAnnotation driver marker
- `app_user/app/_layout.tsx` — registered `ActiveTripScreen` (headerShown: false)
- `app_user/app/BookingRouteScreen.tsx` — `onBook` now navigates to `/ActiveTripScreen` with `vehicleName` + `fare` params
- `app_user/src/localization/iLocalization.ts` — added 9 trip keys
- `app_user/src/localization/resources/en.ts` — English trip strings
- `app_user/src/localization/resources/vi.ts` — Vietnamese trip strings

## Checks Run

- `npx tsc --noEmit` — 0 errors ✅
- `bun lint` (expo lint) — 0 errors, 4 warnings all pre-existing in out-of-contract files ✅
- Test runner — not configured, skipped per CLAUDE.md ✅

## Known Issues / Limitations

- Driver marker animation steps index-by-index along polyline segments (not smooth Reanimated interpolation). Acceptable for mock; upgrade path is inside `useTripSimulation.animateAlong`.
- `call` / `message` contact buttons in TripStatusSheet are no-op UI (no dialer/SMS wiring per contract).
- Completion returns to Home only; payment/rating screen deferred to T-0035/T-0037.

## Real-feed Seam

`useTripSimulation` is the single mock/real seam. To replace with WebSocket feed (T-0026/T-0028), implement the same return shape `{ status, driverCoord, cancel }` and swap the hook import in `ActiveTripScreen` — no UI rework needed.

## Next Steps

- T-0037: Ride history / receipt persistence after completion
- T-0026/T-0027/T-0028: Real-time driver location via WebSocket
- T-0035: Payment / rating screen post-completion
