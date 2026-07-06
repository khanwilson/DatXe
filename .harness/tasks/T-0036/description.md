# T-0036: Active trip tracking with routing app_user

**Title**: Active trip tracking with routing app_user
**Created**: 2026-07-06
**Priority**: P0
**Projects**: app_user
**Depends On**: T-0035 (booking confirmation/payment UI), T-0050 (Goong routing backend)

---

## Requirement

After the user books a ride (`onBook` in `RouteBookingModal`), show an **active
trip tracking screen** that follows the ride lifecycle on the Mapbox map. This is
the demo-ready UI step that comes after route display (T-0054) and booking
confirmation (T-0035).

Because realtime backend integration (T-0026/T-0028) and booking/trip APIs
(T-0008/T-0010) are not yet implemented, driver assignment and live movement are
**mocked on the frontend**, consistent with the rest of the Wave UI tasks
(T-0032→T-0038). The screen is architected so the mock driver source can later be
swapped for a WebSocket feed without reworking the UI.

### Trip lifecycle (mocked progression)
1. **FINDING** — searching for a nearby driver (spinner + "finding driver").
2. **DRIVER_ASSIGNED / EN_ROUTE** — driver card appears; driver marker moves
   toward the pickup along the route; ETA counts down.
3. **ARRIVED** — driver has reached pickup; prompt user to board.
4. **IN_PROGRESS** — trip underway; map follows toward destination.
5. **COMPLETED** — trip summary (fare, distance, duration); dismiss back home.

### Driver info card
- Driver name, photo/avatar, rating, vehicle model + plate number.
- Contact actions (call / message) — UI only, no dialer wiring.
- Selected vehicle type + fare carried over from the booking modal.

### Map behavior
- Reuse `AppMap` (route polyline, origin/destination markers).
- Add a **driver marker** that animates position between mock GPS points.
- Camera follows the active leg (driver→pickup, then pickup→destination).

### Actions
- **Cancel trip** — available before IN_PROGRESS; returns to Home, clears session.
- Status-aware bottom sheet / card that updates per lifecycle phase.

---

## Context

- Booking flow today: Home → `SearchDestinationScreen` → `BookingRouteScreen`
  (route + `RouteBookingModal`). `onBook` currently only dismisses the modal.
- `BookingRouteScreen` already builds route/markers via `useDirections` +
  `decodePolyline` and drives `AppMap` (route, origin, destination, bounds).
- `AppMap` supports `route`, `origin`, `destination`, `bounds`, and an imperative
  `moveCamera`. A driver marker prop must be added.
- Session state (`ZustandSession`) holds `selectedPickup` + `selectedDestination`.
- Theme Mai Linh semantic tokens; `theme.color.map.{pinStart,pinEnd,route}`.
- Reanimated is mandatory for animation (marker movement, camera follow).
- TypeScript strict, bun, expo-router, i18n via `getString`/`useTranslation`.

## Assumptions

- No booking/trip backend yet → driver assignment + movement are mock/simulated.
- Route geometry comes from the existing `useDirections` (Goong) response.
- Screen is reached by navigating from `BookingRouteScreen` on `onBook`.
- Payment method + vehicle selection are passed forward (or re-read from session).

## Out of Scope

- Real WebSocket driver location / realtime status (T-0026, T-0027, T-0028).
- Backend booking/trip/payment APIs (T-0008, T-0010, T-0011).
- Ride history / receipts persistence (T-0037).
- app_taixe driver side.
- Turn-by-turn navigation.

## Success Criteria

- [ ] Active trip screen reachable from `BookingRouteScreen` `onBook`.
- [ ] Trip lifecycle progresses through mocked states with clear UI per state.
- [ ] Driver marker renders and animates along the route toward pickup.
- [ ] Camera follows the active leg.
- [ ] Driver info card (name, rating, vehicle, plate) + carried-over fare.
- [ ] Cancel action returns to Home and clears trip session state.
- [ ] Completion summary shown at end of trip.
- [ ] All user-facing strings via i18n (en + vi).
- [ ] Theme-consistent Mai Linh tokens; no hardcoded colors.
- [ ] `npx tsc --noEmit` clean; `bun lint` clean.

---

**Created**: 2026-07-06
**Phase**: Planning
**Status**: In Progress
