# Plan: T-0072

## Goal

Verify bidirectional WebSocket event flow works end-to-end for the trip lifecycle across `app_taixe` (driver), `app_user` (passenger), and `nestjs_prisma` (backend); fix any contract mismatches between what the FE listens for and what the BE actually emits; gate DEV mocks so they never fire in production.

This is a contract-audit + gap-fix task, not a new-feature task. Payment-related events and REST are handled by T-0075 (see Out of Scope).

## Requirements

1. For each event and each direction, the FE and BE agree on the event name, room, and payload shape.
2. WS auth: both apps attach a valid JWT on the socket handshake; BE gateway accepts it and populates `socket.data.user`.
3. Room membership: passenger sockets end up in `booking:${bookingId}`; driver sockets end up in `driver:${driverId}`. Events reach only the intended clients.
4. DEV mocks (`runDevMock` in `app_user/src/api/socket/useBookingSocket.ts`, `runDevMock` in `app_taixe/src/api/hooks/useDriverSocket.ts`) are gated to `__DEV__` only and never run when a real socket is connected.
5. Trip REST calls from `app_taixe` (`PATCH /trips/:id/driver-arrived|start|complete`) succeed against the live backend and cause the expected BE-side state transition + `trip.status_changed` emit.
6. No changes to unrelated files, no new endpoints, no new UI.

## Assumptions

- The BE gateway is the sole emit surface for the events in scope. Confirmed via grep: only `nestjs_prisma/api/common/websocket/websocket.gateway.ts` emits these events; `drivers.service.ts` references `offer_response` in a comment only.
- The FE listeners are the two hook files already identified: `app_user/src/api/socket/useBookingSocket.ts`, `app_user/src/api/hooks/useTripSocket.ts`, and `app_taixe/src/api/hooks/useDriverSocket.ts`. Trip-action REST lives in `app_taixe/src/api/hooks/useTripActions.ts`.
- Room-join must go through explicit gateway API. FE currently emits `socket.emit('join', 'booking:${bookingId}')` in `useBookingSocket.ts:133,160` but I saw no matching `@SubscribeMessage('join')` handler in `websocket.gateway.ts`. This is one of the concrete gaps to confirm and fix during implementation.
- Auth token wiring already exists on both FE apps via `axios/interceptors.ts`; the socket client must reuse the same `ZustandPersist.accessToken`.

## Affected Areas

Backend (`nestjs_prisma`):
- `api/common/websocket/websocket.gateway.ts` — emit sites and (if missing) an incoming `join`/`leave` handler.
- `api/modules/trip/trip.service.ts` — verify each state transition triggers `emitTripStatusChanged`.
- `api/modules/dispatch/dispatch.service.ts` — verify `emitDriverNewOffer` payload construction and `emitBookingDriverAssigned` call site.

Driver app (`app_taixe`):
- `src/api/hooks/useDriverSocket.ts` — `NewOfferPayload` shape vs BE `emitDriverNewOffer`.
- `src/api/socket/socketClient.ts` — auth token attach on handshake, driver-room join.
- `app/OfferScreen.tsx` — payload parsing for offer + `booking.driver_assigned` receiver.
- `src/api/hooks/useTripActions.ts` — trip REST endpoints against BE controller.

Passenger app (`app_user`):
- `src/api/socket/useBookingSocket.ts` — `DriverAssignedPayload`, `TripStatusChangedPayload`, `DriverLocationUpdatedPayload`; `runDevMock` gating.
- `src/api/socket/socketClient.ts` — auth token attach, booking-room join.
- `src/api/hooks/useTripSocket.ts` — consumer of the above.

## Current Context Read

Task-scoped (mandatory):
- `.harness/tasks/T-0072/description.md`
- `.harness/tasks/T-0072/status.md`
- `.harness/tasks/T-0070/handoff.md` (driver-side wiring result)
- `.harness/tasks/T-0071/handoff.md` (passenger-side wiring result)
- `.harness/tasks/T-0068/handoff.md` (BE dispatch + trip state machine result)

Code (targeted reads, no broad exploration):
- `nestjs_prisma/api/common/websocket/websocket.gateway.ts` — full file (all emit sites + one `@SubscribeMessage`)
- `app_user/src/api/socket/useBookingSocket.ts` — full file (FE listener shapes + DEV mock)
- `app_user/src/api/hooks/useTripSocket.ts` — full file (consumer + payload mapping)
- `app_taixe/src/api/hooks/useDriverSocket.ts` — full file (FE listener shape + DEV mock)

Global state files not preloaded.

## Proposed Approach

Straight audit-then-fix. No architecture escalation needed — the mismatches will be small, localized contract fixes.

Step 1: Confirm exact BE emit shapes (already extracted for main events; verify by re-reading trip.service, dispatch.service emit call sites during implementation).

Step 2: Diff BE emit shape vs FE listener shape for each event. Preliminary diff from the reads I did:

| Event | BE emits | FE expects | Preliminary status |
|-------|----------|------------|--------------------|
| `driver.new_offer` (BE→app_taixe) | `{ offerId, bookingId, pickupAddress, dropoffAddress, estimatedPrice, vehicleType, distanceKm, expiresAt }` | `{ offerId, bookingId, pickup:{address,lat,lng}, destination:{address}, fare, expiresAt }` | MISMATCH: nested vs flat, `fare` vs `estimatedPrice`, no `pickup.lat/lng` in BE payload, missing `vehicleType`/`distanceKm` in FE |
| `driver.offer_response` (app_taixe→BE) | `{ offerId, accepted }` | (emitted by app_taixe) | Verify emit site matches |
| `booking.driver_assigned` (BE→both) | `{ bookingId, tripId, driver:{id,name,phone,vehicleType,vehiclePlate,rating,lat,lng} }` | app_user: flat `driverId,driverName,driverPhone,vehiclePlate,vehicleModel,driverLat,driverLng,...` | MISMATCH: nested `driver` vs flat, `vehicleType` vs `vehicleModel`, `driverAvatar` doesn't exist on BE |
| `trip.status_changed` (BE→both) | `{ tripId, bookingId, status }` | Same | LIKELY OK |
| `driver.location_updated` (BE→app_user booking room) | `{ driverId, lat, lng, heading\|null }` | `{ driverId, lat, lng, heading? }` | LIKELY OK |

Step 3: Fix by adjusting either the FE parser or the BE emit — decision per-mismatch during implementation. Prefer changing the FE to match BE (BE is closer to the DB shape); flip only if the BE payload is clearly wrong (e.g., missing a field the FE genuinely needs like pickup coordinates for map rendering).

Step 4: Room-join wiring. FE emits `socket.emit('join', room)` on connect, but I did not see a `@SubscribeMessage('join')` in the gateway. Confirm during implementation. If missing, add it (a thin handler that calls `joinBookingRoom` / `joinUserRoom` / `joinDriverRoom` with auth check).

Step 5: Auth wiring. Verify each app's `socketClient.ts` reads `ZustandPersist.accessToken` and passes it via `auth: { token }` (gateway's `extractToken` already handles both `handshake.auth.token` and query `token`).

Step 6: DEV mock gating. Both hooks currently trigger the mock when the socket does not connect within a timeout. The driver hook gates on `__DEV__`; the passenger hook does NOT gate on `__DEV__` (see `useBookingSocket.ts:124-129`). Add a `__DEV__` guard to `useBookingSocket.ts`.

Step 7: Manual E2E smoke — one full happy path (offer → assign → en-route → arrived → in-progress → complete), one no-driver path, one cancellation path. Log observations in `evaluation.md`.

## Phases / Steps

1. **Contract audit** — For each event, produce a diff row of BE emit vs FE listen. Include exact field names and nesting.
2. **Room-join wiring** — Confirm/add `@SubscribeMessage('join')` and `('leave')` handlers on the gateway; ensure each socket joins the right room per role.
3. **Auth wiring** — Verify both apps' `socketClient.ts` attaches the JWT; confirm gateway `handleConnection` accepts it.
4. **Fix `driver.new_offer` mismatch** — Reshape either the BE emit or FE listener so the driver's OfferScreen receives the fields it renders. If pickup coords are genuinely needed by the UI, extend the BE payload; otherwise flatten the FE type.
5. **Fix `booking.driver_assigned` mismatch** — Same decision: nested `driver` on BE vs flat fields on FE. Prefer flattening on the FE (simpler, matches existing FE type). Handle `vehicleType` vs `vehicleModel` naming.
6. **DEV mock gating** — Add `__DEV__` guard to `useBookingSocket.ts`; confirm driver-side already guards.
7. **Trip REST verification** — Confirm the three PATCH endpoints work against the live BE (path, auth header, response shape).
8. **Manual E2E smoke** — Run one happy path and log status transitions observed on both apps.
9. **Update handoff + status** — Record every mismatch found and the direction of the fix; promote any shared payload conventions to `.harness/DECISIONS.md` if worth reusing.

## Risks and Mitigations

- **Risk**: The FE fix cascades into unrelated UI files (e.g., OfferScreen uses individual params from the payload). **Mitigation**: Contract must call out the touched screens; implementer greps for every consumer of the changed type before renaming fields.
- **Risk**: Backend-side reshape breaks the existing test suite or other consumers. **Mitigation**: Prefer FE-side reshape unless the BE payload is genuinely missing information; if BE must change, keep additive (add new fields without removing old ones) inside this task.
- **Risk**: `driver.new_offer` payload lacks pickup coordinates but the driver UI needs to draw a route to pickup. **Mitigation**: Verify by reading `OfferScreen.tsx` and `PickupNavigationScreen.tsx` during implementation; if coords are needed, extend BE payload with `pickupLat`/`pickupLng`.
- **Risk**: Room-join handler missing means events emit into empty rooms — silent failure. **Mitigation**: Explicit step 2 to confirm/add the handler; verify with a socket.io debug log during smoke test.
- **Risk**: Overlap with T-0075 causes double-fix on payment events. **Mitigation**: `booking.payment_success` + payment REST are explicitly out of scope; the audit skips those rows.

## Architect Required?

No. This is contract reconciliation on already-designed events. Escalate only if the implementer finds a systemic issue (e.g., the room-join model is fundamentally wrong, or auth on WS is not workable). Otherwise standard Sonnet contracting + implementing is enough.

## Contracting Notes

The contract should list:

- **Allowed files** (nine): `nestjs_prisma/api/common/websocket/websocket.gateway.ts`, `nestjs_prisma/api/modules/dispatch/dispatch.service.ts`, `nestjs_prisma/api/modules/trip/trip.service.ts`, `app_taixe/src/api/hooks/useDriverSocket.ts`, `app_taixe/src/api/socket/socketClient.ts`, `app_taixe/app/OfferScreen.tsx` (if payload shape change reaches the screen), `app_user/src/api/socket/useBookingSocket.ts`, `app_user/src/api/hooks/useTripSocket.ts`, `app_user/src/api/socket/socketClient.ts`. Implementer may extend after reading each consumer.
- **Out of scope**: `booking.payment_success` event, `POST /payments/vnpay`, `GET /payments/:bookingId`, `mockCreateVnpayUrl`, driver online/offline stats, any new UI, any new endpoint.
- **Acceptance criteria** framed as "for each event, FE assumption matches BE emission, or a fix is applied and both sides agree". Also: `__DEV__` gate on both DEV mocks; manual E2E happy-path completes without any FE parse errors.

## Testing Strategy

- `nestjs_prisma`: `bun run lint`, `bun run typecheck` (or `tsc --noEmit`), `bun run test` if present.
- `app_taixe`: `bunx tsc --noEmit`, `bun lint`.
- `app_user`: `bun run tsc --noEmit`, `bun lint`.
- Manual E2E: happy path (offer → assign → en-route → arrived → in-progress → complete), no-driver path, cancellation. Log which events fired at which timestamps in `evaluation.md`.
- Existing unit tests in `nestjs_prisma` if any touch dispatch/trip — confirm they still pass after any payload reshape.
- No new test framework install. `app_user` and `app_taixe` have no test runner; that's fine, contract audit relies on tsc+lint+manual E2E.

## Estimated Effort

Small to medium. Audit + focused edits across at most 9 files. Most time will be in confirming BE emit shapes against actual runtime and in the manual E2E smoke test. Expect 1 fix round, no architecture work.

## Approval Gate

Waiting for user approval before Contracting.
