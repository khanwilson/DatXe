# Implementation: T-0071

## Summary

Replaced `useTripSimulation` mock with real WebSocket wiring for the passenger trip lifecycle in app_user. All UI was already built; this task wired the real `trip.status_changed` and `driver.location_updated` WS events.

## Changes Made

### New Files
- `app_user/src/api/hooks/useTripSocket.ts` — new hook that wraps `useBookingSocket`, owns trip status + driver coord state, maps backend status strings to frontend `TripStatus` enum, stores driver info in Zustand on assignment.

### Modified Files
- `app_user/src/constants/trip.ts` — added `DriverInfo` interface (with `driverId`, `phone`, `lat`, `lng`, optional `rating`/`avatar`), `backendStatusToTripStatus()` mapping function, `DRIVER_AVATAR_PLACEHOLDER`. Kept `MockDriver` alias for backward compat.
- `app_user/src/api/socket/useBookingSocket.ts` — added `TripStatusChangedPayload`, `DriverLocationUpdatedPayload` interfaces; new `onTripStatusChanged` + `onDriverLocationUpdated` callbacks; optional `driverRating`/`driverAvatar`/`tripId` fields on `DriverAssignedPayload`; extended `runDevMock` with full status progression (DRIVER_EN_ROUTE→DRIVER_ARRIVED→IN_PROGRESS→COMPLETED) plus periodic `driver.location_updated` ticks.
- `app_user/src/zustand/session.ts` — added `activeTripId?: string | null` and `driverInfo?: DriverInfo | null` to `SessionState`.
- `app_user/src/components/trip/TripStatusSheet.tsx` — swapped `MockDriver` prop type to `DriverInfo | null | undefined`; added null guards on driver card render; `rating` display falls back to `5.0` if undefined.
- `app_user/app/ActiveTripScreen.tsx` — replaced `useTripSimulation` call with `useTripSocket`; reads driver info from nav params with Zustand fallback; passes real `driverInfo` to `TripStatusSheet`.
- `app_user/app/BookingRouteScreen.tsx` — updated `handleDriverAssigned` to save `driverInfo` (with `driverId`) and `activeTripId` to Zustand, and pass all driver fields as nav params to `ActiveTripScreen`.

## Decisions

- `rating` made optional on `DriverInfo` because backend `booking.driver_assigned` event does not guarantee a rating field.
- Backend status `DRIVER_EN_ROUTE` maps to frontend `EN_ROUTE`; `DRIVER_ARRIVED` → `ARRIVED`; done in a single `backendStatusToTripStatus()` function.
- `driverRating`, `driverAvatar`, `tripId` added as optional fields to `DriverAssignedPayload` for forward compat with backend enhancements; defaults applied where missing.
- `useTripSimulation` is not deleted — it still exists but is no longer used by `ActiveTripScreen`. Removal is out of scope.

## Fix Round 1 (post-review FAIL_FIXABLE)

- **Medium — driverId filter window** (`useTripSocket.ts`): added a `ponytail:` comment above the `useBookingSocket` call naming the known ceiling (driverId null until `onDriverAssigned` → location events accepted during FINDING window, harmless since no location UI renders then). Behavior unchanged; documented per review recommendation.
- **Low — avatar constant** (`BookingRouteScreen.tsx`): imported `DRIVER_AVATAR_PLACEHOLDER` from `constants/trip` and replaced the hardcoded `'https://i.pravatar.cc/150?img=12'` fallback in `handleDriverAssigned`.
- **Low — DEV mock timing** (`useBookingSocket.ts`): aligned `DRIVER_ARRIVED` to t+20s (was t+24s) and `IN_PROGRESS` to t+25s (was t+29s) per contract acceptance criterion.

Checks: `bun run tsc --noEmit` passes; `bun lint` 0 errors (4 pre-existing warnings in untouched files).
