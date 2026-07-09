# Contract: T-0071 — FE app_user Trip Flow (WebSocket Wiring)

## Scope

Wire the passenger-side trip lifecycle in `app_user` to real WebSocket events, replacing `useTripSimulation` with live `trip.status_changed` and `driver.location_updated` event consumption. Extend DEV mock for offline testing. No new UI layout work.

## Out of Scope

- Backend changes (T-0068 is complete)
- `app_taixe` changes
- `nestjs_prisma` changes
- New screens or navigation structure
- Payment flow changes
- Unit test framework setup
- Avatar image fetching from a real API

## Allowed Files

```
app_user/src/api/socket/useBookingSocket.ts
app_user/src/api/hooks/useTripSocket.ts          ← new file
app_user/src/zustand/session.ts
app_user/src/components/trip/TripStatusSheet.tsx
app_user/src/constants/trip.ts
app_user/app/ActiveTripScreen.tsx
app_user/app/BookingRouteScreen.tsx
app_user/src/localization/iLocalization.ts
app_user/src/localization/resources/vi.ts
app_user/src/localization/resources/en.ts
```

## Acceptance Criteria

- [ ] After payment, "Looking for driver" state shows `RadarAnimation` and cancel option
- [ ] On `booking.driver_assigned`: driver info card shows (name, vehicle, rating, plate)
- [ ] On `trip.status_changed` → `DRIVER_EN_ROUTE`: map shows live driver pin updating via `driver.location_updated`
- [ ] On `trip.status_changed` → `DRIVER_ARRIVED`: TripStatusSheet shows "Driver has arrived" state
- [ ] On `trip.status_changed` → `IN_PROGRESS`: map shows route to dropoff with live driver position
- [ ] On `trip.status_changed` → `COMPLETED`: trip summary screen shows (fare, distance, duration) and Done button
- [ ] Cancellation option visible during FINDING and EN_ROUTE states
- [ ] DEV mock (`runDevMock`) fires full state progression offline: DRIVER_EN_ROUTE at t+12s, DRIVER_ARRIVED at t+20s, IN_PROGRESS at t+25s, COMPLETED at t+60s, periodic `driver.location_updated` ticks during EN_ROUTE and IN_PROGRESS
- [ ] TypeScript passes: `bun run tsc --noEmit` in `app_user/`
- [ ] ESLint passes: `bun lint` in `app_user/`

## Required Checks

1. `cd app_user && bun run tsc --noEmit`
2. `cd app_user && bun lint` (or `bun run lint`)
3. Manual verification: DEV mock cycles through all states in simulator

## Implementation Constraints

1. **No layout changes** to `TripStatusSheet.tsx` or `ActiveTripScreen.tsx` — only type and hook wiring
2. **Status mapping** must live in one place: `backendStatusToTripStatus()` in `constants/trip.ts`
3. `useTripSocket` must return the same shape as `useTripSimulation` for drop-in replacement
4. `avatar` field: use a static placeholder string as default — no network fetch
5. Store last received `tripStatus` in `ZustandSession` so `ActiveTripScreen` can read it on mount (handles late mounting after a status event)
6. `driver.location_updated` filter: only process events matching the current trip's `driverId` (sourced from `DriverAssignedPayload`); skip unknown drivers
7. No hardcoded colors — use theme tokens if any UI touches are needed
8. Follow TSX file structure: imports → variables → render → stylesheet → export

## Scope Expansion History

None.

## User Approvals Required

None — all decisions are within contract.
