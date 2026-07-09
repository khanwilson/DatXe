# Review: T-0071

## Summary

Re-review after Fix Round 1. All three findings from the initial review have been addressed in source and confirmed by re-evaluation (tsc 0 errors, lint 0 errors). The implementation wires the passenger trip lifecycle to real WebSocket events, replacing `useTripSimulation` with `useTripSocket` and extending `useBookingSocket` with `trip.status_changed` and `driver.location_updated` handling. No issues remain.

## Contract Compliance

All acceptance criteria are met. All changes are within Allowed Files. No out-of-scope projects touched.

- Status mapping lives exclusively in `backendStatusToTripStatus()` in `constants/trip.ts` (constraint 2).
- `useTripSocket` returns `{ status, driverCoord, driverInfo, tripId, cancel }`, matching the `useTripSimulation` shape (constraint 3).
- `avatar` uses `DRIVER_AVATAR_PLACEHOLDER` — no network fetch (constraint 4).
- `activeTripId` and `driverInfo` written to Zustand on assignment so `ActiveTripScreen` reads them on mount (constraint 5).
- `driver.location_updated` filtered by `driverId` with documented known ceiling (constraint 6).
- DEV mock timings: DRIVER_EN_ROUTE t+12s, DRIVER_ARRIVED t+20s, IN_PROGRESS t+25s, COMPLETED t+60s — matches contract exactly.

## Correctness

Core wiring is correct. Event handler registration, `bookingId` guard on `trip.status_changed`, `driverId` filter on `driver.location_updated`, Zustand writes, and status state transitions are all correct.

The pre-assignment `driverId null` window (location events accepted during FINDING before `onDriverAssigned` fires) is documented with a `ponytail:` comment and has no user-visible impact since no location UI renders during FINDING state.

`initialDriverInfo` snapshot-on-mount via `useMemo` with empty deps is intentional for a one-way route and correctly annotated.

## Edge Cases

- DEV mock timing now matches contract (DRIVER_ARRIVED t+20s, IN_PROGRESS t+25s). Verified in source.
- `tripId` starts as null and populates on first `trip.status_changed` — no current dependency on immediate availability, acceptable.
- `cancel()` clears Zustand only; does not emit a backend cancellation. Contract does not require a backend call; callers should be aware.
- `rating` defaults to `5.0` in `useTripSocket.onDriverAssigned`, so the `0.0` fallback in `TripStatusSheet` is unreachable through this path.

## Security

No secrets, no hardcoded credentials. `DRIVER_AVATAR_PLACEHOLDER` constant references `i.pravatar.cc` — acceptable for dev/demo; replace with a bundled asset before production. No new auth paths or network calls introduced.

## Performance

DEV mock timer and interval cleanup is correct — all handles tracked in `timers` and `intervals` arrays, cleared on cleanup. All `useTripSocket` callbacks are `useCallback` with stable empty deps, preventing spurious re-subscriptions via `useBookingSocket`'s dep-array effect.

## Code Quality

Follows project conventions throughout: imports → variables → render → stylesheet → export; `useMemo` for styles; absolute imports; English comments; no `console.log`. `MockDriver = DriverInfo` alias kept with `ponytail:` comment. Dead `useTripSimulation` not deleted (correctly out of scope).

## Test Coverage

No unit test runner configured in `app_user`. TypeScript and ESLint are the available automated checks — both pass clean. DEV mock provides full offline flow coverage.

## Regression Risk

Low. `useTripSimulation` still present and unused — no callers removed. `TripStatusSheet` prop type widened with null guards added — backward safe. Zustand `SessionState` additions are additive. `useBookingSocket` new event handlers are opt-in via optional callbacks.

## Issues Found

None. All findings from Round 1 resolved.

| Severity | File | Issue | Recommendation |
|---|---|---|---|
| — | — | No issues | — |

## Architect Escalation Needed?

No

## Decision

PASS
