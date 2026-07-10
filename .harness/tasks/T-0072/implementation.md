# Implementation: T-0072

## Summary

Contract-audit + gap-fix of the trip-lifecycle WebSocket contracts across `app_taixe` (driver), `app_user` (passenger), and `nestjs_prisma` (backend). Reconciled two payload mismatches (`driver.new_offer`, `booking.driver_assigned`) by reshaping the FE listeners plus one additive BE field; added the missing gateway `join`/`leave` handlers and auto-join of role rooms on connect; gated the passenger DEV mock behind `__DEV__`; and fixed a real end-to-end bug in `driver.location_updated` where the Driver PK vs User-id mix-up meant location events never reached the passenger.

Note on Allowed Files: the contract listed `nestjs_prisma/api/modules/dispatch/dispatch.service.ts`, but that directory is empty. The actual dispatch emit sites (`emitDriverNewOffer`, `emitBookingDriverAssigned`) live in `nestjs_prisma/api/modules/drivers/drivers.service.ts`. I edited that file as the contract-intended dispatch service (same module role, same emit surface). Flagging this path substitution for the Evaluator — no scope expansion, same logical target.

## Per-event audit

| Event | Direction | BE shape (actual) | FE shape (before) | Mismatch | Fix direction |
|---|---|---|---|---|---|
| `driver.new_offer` | BE → `driver:${driverPk}` | flat `{ offerId, bookingId, pickupAddress, dropoffAddress, estimatedPrice, vehicleType, distanceKm, expiresAt }` | nested `{ pickup:{address,lat,lng}, destination:{address}, fare, ... }` | Y | FE-reshape (map wire→nested inside hook, HomeScreen untouched) + BE-additive: added `pickupLat`/`pickupLng` (PickupNavigationScreen needs coords to draw route) |
| `driver.offer_response` | app_taixe → BE | `@SubscribeMessage('driver.offer_response')` expects `{ offerId, accepted }` | OfferScreen emits `{ offerId, accepted }` | N | none needed |
| `booking.driver_assigned` | BE → `booking` + `driver` rooms | nested `{ bookingId, tripId, driver:{id,name,phone,vehicleType,vehiclePlate,rating,lat,lng} }` | app_user flat `{ driverName, driverPhone, vehicleModel, driverLat, driverLng, ... }`; app_taixe `{ tripId, bookingId, driverId }` | Y | FE-reshape both sides: app_user maps wire→flat inside hook (public type + `useTripSocket` untouched); app_taixe OfferScreen type corrected (only reads `tripId`/`bookingId`, dropped nonexistent top-level `driverId`) |
| `trip.status_changed` | BE → both rooms | `{ tripId, bookingId, status }` | `{ tripId, bookingId, status }` | N | none needed |
| `driver.location_updated` | BE → `booking:${bookingId}` | `{ driverId, lat, lng, heading\|null }` | `{ driverId, lat, lng, heading? }` | N (shape) / **Y (id semantics)** | BE fix: `updateDriverLocation` received `user.sub` but looked up trips by Driver PK (never matched) and emitted the wrong `driverId` — resolved Driver PK before the trip lookup + emit so the passenger's `driverId` filter matches |
| `join` / `leave` | FE → BE | **no handler existed** | app_user emits `join`/`leave`; app_taixe never joined | Y | BE: added `@SubscribeMessage('join')` + `('leave')` with ownership validation; added `autoJoinRooms` on connect so drivers auto-join `driver:${driverPk}` (they never emit `join` and don't know their PK) |

## Files Changed

| File | Change | Reason |
|---|---|---|
| nestjs_prisma/api/common/websocket/websocket.gateway.ts | Inject `PrismaService`; auto-join `user:`/`driver:` rooms on connect; add `join`/`leave` `@SubscribeMessage` handlers with room-ownership validation; add `pickupLat`/`pickupLng` to `emitDriverNewOffer` payload type | Room-join handler was missing (events emitted into empty rooms); drivers had no way to join their PK room; offer needs pickup coords additively |
| nestjs_prisma/api/modules/drivers/drivers.service.ts | Populate `pickupLat`/`pickupLng` in `emitDriverNewOffer`; resolve Driver PK in `updateDriverLocation` before trip lookup + location emit | Feed the additive offer fields; fix Driver-PK vs User-id mismatch that broke location broadcast end-to-end |
| app_taixe/src/api/hooks/useDriverSocket.ts | Add `NewOfferWirePayload` + `mapWireOffer`; handler maps flat BE payload → nested `NewOfferPayload`; DEV mock emits wire shape | Match BE flat emit while keeping HomeScreen's nested consumer (not in Allowed Files) untouched |
| app_taixe/app/OfferScreen.tsx | Correct local `DriverAssignedPayload` type (drop nonexistent top-level `driverId`) | BE payload nests driver; screen only reads `tripId`/`bookingId` |
| app_user/src/api/socket/useBookingSocket.ts | Add `DriverAssignedWirePayload` + `mapWireDriverAssigned`; handler maps nested BE → flat public payload; gate `runDevMock` behind `__DEV__` | Reconcile nested-vs-flat without touching `useTripSocket`; stop mock firing in production |

Not changed (verified only):
- app_taixe/src/api/socket/socketClient.ts, app_user/src/api/socket/socketClient.ts — both attach JWT via `auth:{ token: 'Bearer <accessToken>' }` from `ZustandPersist`; gateway `extractToken` strips `Bearer `. Correct as-is.
- app_taixe/src/api/hooks/useTripActions.ts, app_user/src/api/hooks/useTripSocket.ts — not edited (useTripActions not in Allowed Files; verified paths/shapes correct). Trip REST paths (`/trips/:id/driver-arrived|start|complete`) match the controller; each triggers `emitTripStatusChanged`.

## Implementation Decisions

1. **`dispatch.service.ts` → `drivers.service.ts` substitution.** Contract path is an empty dir; the real emit surface is `drivers.service.ts`. Edited it as the intended target. Flagged, not scope expansion.
2. **`driver.new_offer`: FE-reshape + BE-additive (both).** Flattened via a mapper inside `useDriverSocket` so `HomeScreen.tsx` (not in Allowed Files) stays untouched. Added `pickupLat`/`pickupLng` to BE (additive) because PickupNavigationScreen draws the pickup route from coords — the UI genuinely needs them and the flat BE payload lacked them.
3. **`booking.driver_assigned`: FE-reshape.** Mapped nested→flat inside `useBookingSocket`; kept the public `DriverAssignedPayload` and `useTripSocket` consumer unchanged. `vehicleType` → `vehicleModel`; `driverAvatar` left optional/unset (BE has no avatar in this payload).
4. **Room-join model.** Drivers auto-join `driver:${driverPk}` on connect (they never emit `join` and can't know their PK client-side); passengers keep emitting `join`/`leave` for `booking:${bookingId}`, now backed by a validated handler. Ownership check: `user:` must match own id, `driver:` must match resolved PK, `booking:` must be the booking's customer or driver.
5. **`driver.location_updated` root-cause fix.** Not a shape mismatch — an id-semantics bug. `user.sub` was used as `driver_id` in the trip lookup (Driver PK) so it never matched, and the emitted `driverId` wouldn't match the passenger's filter. Resolved the Driver PK once, used it for both lookup and emit. Root-cause fix in the shared service method, not a per-caller patch.

## Notes for Evaluation

Commands:
- `nestjs_prisma`: `bunx tsc --noEmit` (ran clean), plus `bun run lint` and `bun run test` if present.
- `app_taixe`: `bunx tsc --noEmit` (ran clean), `bun lint`.
- `app_user`: `bunx tsc --noEmit` (ran clean), `bun lint`.

Risk areas / things to smoke-test:
- Room-join ownership: confirm a passenger can't join another booking's room (handler returns false → no join).
- Driver auto-join: verify on driver connect the socket is in `driver:${driverPk}` (add a debug log or inspect `socket.rooms`), otherwise offers silently go to an empty room.
- Location flow: with a real active trip, confirm the passenger receives `driver.location_updated` with `driverId === ` the Driver PK from `booking.driver_assigned` (the bug that was fixed).
- DEV mock: confirm the passenger mock does NOT fire in a production build (`__DEV__ === false`).
- `booking.payment_success`, payment REST, driver online/offline stats: out of scope, untouched.

## Status
Implemented
