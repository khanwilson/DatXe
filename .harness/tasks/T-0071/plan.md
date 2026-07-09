# Plan: T-0071

## Goal

Wire the passenger-side trip lifecycle in app_user to real WebSocket events from the backend (T-0068), replacing the existing `useTripSimulation` mock with live `trip.status_changed` and `driver.location_updated` events. The user should experience the full flow: Looking → Driver Assigned → Driver En Route → Driver Arrived → In Progress → Completed.

## Requirements

1. After payment, show "Looking for driver" state with `RadarAnimation` and a cancel option.
2. On `booking.driver_assigned` WS event: show driver info card (name, vehicle, rating, plate).
3. On `trip.status_changed` → `DRIVER_EN_ROUTE`: map shows live driver pin updating via `driver.location_updated` WS events.
4. On `trip.status_changed` → `DRIVER_ARRIVED`: show "Driver has arrived" state in `TripStatusSheet`.
5. On `trip.status_changed` → `IN_PROGRESS`: map shows route to dropoff with live driver position.
6. On `trip.status_changed` → `COMPLETED`: show trip summary (fare, distance, duration) and Done button.
7. Cancellation option shown during FINDING and EN_ROUTE states.
8. DEV mock path works without live backend (extend existing `runDevMock` in `useBookingSocket`).
9. TypeScript and ESLint pass.

## Affected Areas

- `app_user/app/ActiveTripScreen.tsx` — replace `useTripSimulation` with real WS hook; accept real driver info from navigation params
- `app_user/src/api/socket/useBookingSocket.ts` — add `trip.status_changed` and `driver.location_updated` event handlers + extend DEV mock
- `app_user/src/zustand/session.ts` — extend `SessionState` with `activeTripId` and `driverInfo` fields
- `app_user/src/components/trip/TripStatusSheet.tsx` — update `MockDriver` → real `DriverInfo` type (sourced from WS payload); no layout changes needed
- `app_user/src/constants/trip.ts` — export real `DriverInfo` interface alongside existing `TripStatus` type; update `TripStatus` to align with backend enum (`DRIVER_EN_ROUTE` instead of `EN_ROUTE`, etc.)
- `app_user/src/localization/iLocalization.ts`, `vi.ts`, `en.ts` — add any missing trip i18n keys
- `app_user/app/BookingRouteScreen.tsx` — pass real `DriverAssignedPayload` fields to `ActiveTripScreen` params

## Current Context Read

### What exists
- `ActiveTripScreen` + `TripStatusSheet` + `useTripSimulation` are fully built but driven entirely by a frontend-only simulation timer. The simulation already covers all visual states (FINDING, EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED) and the UI accepts them.
- `useBookingSocket` already handles `booking.driver_assigned` with a `DriverAssignedPayload` shape (driverName, driverPhone, vehiclePlate, vehicleModel, driverLat, driverLng). It has a `runDevMock` that fires `onDriverAssigned` at t+8s.
- `BookingRouteScreen` calls `router.push('/ActiveTripScreen', { params: { vehicleName, fare, bookingId } })` on `handleDriverAssigned`.
- `TripStatusSheet` expects a `MockDriver` shape: `{ name, avatar, rating, vehicleModel, plate }`.
- `ZustandSession` has `activeBookingId` but no `activeTripId` or driver info yet.
- Backend emits (T-0068): `trip.status_changed { tripId, bookingId, status }` and `driver.location_updated { driverId, lat, lng, heading }`.

### Key gaps to close
1. `useBookingSocket` does not listen for `trip.status_changed` or `driver.location_updated`.
2. `ActiveTripScreen` drives state via `useTripSimulation` — needs to drive from real WS status instead.
3. `TripStatusSheet` uses `MockDriver`; needs to accept real driver data from `DriverAssignedPayload`.
4. `TripStatus` frontend enum (`EN_ROUTE`) is misaligned with backend (`DRIVER_EN_ROUTE`) — needs mapping.
5. Driver `avatar` field not in `DriverAssignedPayload` — needs a fallback (placeholder URL).

## Proposed Approach

The minimum diff: extend `useBookingSocket` with the two new WS events, replace `useTripSimulation` in `ActiveTripScreen` with a simpler `useTripSocket` hook that consumes those events, and thread driver data from the WS payload through navigation params.

The `TripStatusSheet` UI needs zero changes — only its `MockDriver` prop type gets widened to accept `DriverInfo` (same fields, `avatar` optional with fallback). The map already renders a `driver` pin; we just feed it real coords instead of simulated ones.

DEV mock: extend `runDevMock` with timed synthetic `trip.status_changed` and `driver.location_updated` firings so the full flow is testable offline.

### Status mapping
Backend `TripStatus` → frontend `TripStatus`:
- `DRIVER_EN_ROUTE` → `EN_ROUTE`
- `DRIVER_ARRIVED` → `ARRIVED`
- `IN_PROGRESS` → `IN_PROGRESS`
- `COMPLETED` → `COMPLETED`
- (FINDING is a frontend-only state; no backend event needed — it's the default after driver assignment)

## Phases / Steps

### Step 1 — Extend Zustand session (session.ts)
Add `activeTripId?: string | null` and `driverInfo` fields to `SessionState`. Driver info stored so it survives re-renders.

### Step 2 — Add new WS event handlers to useBookingSocket
Add callbacks: `onTripStatusChanged(status, tripId)` and `onDriverLocationUpdated(lat, lng, heading?)`. Extend `runDevMock` to fire synthetic status progression: DRIVER_EN_ROUTE at t+12s, DRIVER_ARRIVED at t+20s, IN_PROGRESS at t+25s, COMPLETED at t+60s, plus periodic `driver.location_updated` ticks during EN_ROUTE and IN_PROGRESS.

### Step 3 — Create useTripSocket hook
New file: `app_user/src/api/hooks/useTripSocket.ts`. Wraps `useBookingSocket` and owns trip state (`status`, `driverCoord`, `driverInfo`). Returns the same shape as `useTripSimulation` — `{ status, driverCoord, driverInfo, cancel }` — so `ActiveTripScreen` can drop-in replace the simulation hook.

### Step 4 — Update TripStatus type and DriverInfo
In `constants/trip.ts`: export `DriverInfo` interface (replaces `MockDriver`; same fields, `avatar` optional). Keep `TripStatus` union unchanged (UI strings already match). Add status mapping function `backendStatusToTripStatus(s: string): TripStatus | null`.

### Step 5 — Update TripStatusSheet prop type
Swap `MockDriver` → `DriverInfo` prop type. One-line change. All usages update automatically.

### Step 6 — Update BookingRouteScreen
On `handleDriverAssigned`, save driver info to `ZustandSession` and pass extra params to `ActiveTripScreen` (driverName, vehiclePlate, vehicleModel, driverLat, driverLng, tripId).

### Step 7 — Rewrite ActiveTripScreen driver
Replace `useTripSimulation` call with `useTripSocket`. Read driver params from both navigation params and Zustand. No layout changes.

### Step 8 — i18n
Audit existing trip keys; add any missing ones to `iLocalization.ts`, `vi.ts`, `en.ts`. Keys likely already present from T-0036/T-0064.

### Step 9 — Lint + typecheck

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| `driver.location_updated` fires for *any* driver, not just the user's current trip driver | `useBookingSocket` already has a `bookingId` guard; add a `driverId` filter once we have it from `DriverAssignedPayload` |
| Backend `trip.status_changed` may arrive before `ActiveTripScreen` mounts | Store last status in `ZustandSession` so screen reads it on mount |
| DEV mock timing may not match real backend sequence | Mock is clearly flagged as DEV-only; easy to adjust |
| `TripStatus` enum mismatch between frontend and backend | Handled by `backendStatusToTripStatus` mapping function in one place |
| Avatar field absent from WS payload | Use a static placeholder URL as default in `DriverInfo` |

## Architect Required?

No — this is a single-app frontend change with a well-defined WS contract already established by T-0068. No schema, API contract, or cross-app changes.

## Testing Strategy

- DEV mock flow: run app in dev, complete booking flow (mock payment), verify all 5 states cycle automatically via `runDevMock` timers.
- TypeScript: `bun run tsc --noEmit` in `app_user/`.
- Lint: `bun lint` in `app_user/`.
- No unit test framework configured; ponytail: skip test file, add when test runner exists.

## Estimated Effort

Small — 4–6 files changed, mostly wiring not new UI. The UI (`TripStatusSheet`, `AppMap`) is already complete and proven. The main work is the `useTripSocket` hook + `useBookingSocket` extension.

## Approval Gate

Waiting for user approval before Contracting.
