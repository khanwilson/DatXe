# Decisions: T-0072

## D1 — Contract path substitution: `dispatch.service.ts` → `drivers.service.ts`
The contract's Allowed Files listed `nestjs_prisma/api/modules/dispatch/dispatch.service.ts`, but that directory is empty. The actual dispatch emit sites (`emitDriverNewOffer`, `emitBookingDriverAssigned`, `resolveOffer`, `runDriversLoop`) live in `nestjs_prisma/api/modules/drivers/drivers.service.ts`. Edited that file as the contract-intended dispatch service — same module role, same emit surface, no scope expansion. Flagged for the Evaluator.

## D2 — `driver.new_offer`: FE reshape + additive BE fields
FE (`useDriverSocket`) expected a nested `{ pickup, destination, fare }` shape; BE emits flat. Chose to reshape the FE via a `mapWireOffer` mapper inside the hook rather than changing the public `NewOfferPayload` type, so `HomeScreen.tsx` (which consumes the nested shape and is NOT in Allowed Files) stays untouched. Additionally added `pickupLat`/`pickupLng` to the BE payload (additive, non-breaking) because `PickupNavigationScreen` draws the pickup route from coordinates — the UI genuinely needs them and the flat BE payload lacked them. This is the one case where the plan's "extend BE only if UI truly needs a missing field" applied.

## D3 — `booking.driver_assigned`: FE flatten
BE emits nested `{ driver: {...} }`; app_user expected flat fields. Mapped nested→flat inside `useBookingSocket` (`mapWireDriverAssigned`), keeping the public flat `DriverAssignedPayload` and its `useTripSocket` consumer unchanged. `vehicleType` maps to the FE's `vehicleModel`; `driverAvatar` stays optional/unset (no avatar in the BE payload). app_taixe's OfferScreen only reads `tripId`/`bookingId`, so its local type was corrected by dropping the nonexistent top-level `driverId`.

## D4 — Room-join model: driver auto-join, passenger explicit join
Drivers never emit `join` and cannot know their Driver PK client-side, yet offers are addressed to `driver:${driverPk}`. Resolved by auto-joining role rooms server-side in `handleConnection` (`autoJoinRooms`): every socket joins `user:${userId}`, and drivers additionally join `driver:${driverPk}`. Passengers continue to emit `join`/`leave` for `booking:${bookingId}`, now backed by a new validated `@SubscribeMessage` handler. Room access is validated: `user:` must equal own id, `driver:` must equal the resolved PK, `booking:` must belong to the requesting user (customer or assigned driver).

## D5 — `driver.location_updated`: root-cause id fix (not a shape fix)
The event shape already matched. The bug: `updateDriverLocation(user.sub, ...)` used the User id as `driver_id` in the trip lookup (which keys on the Driver PK) so it never matched, and the emitted `driverId` would not match the passenger's filter (which expects the Driver PK from `booking.driver_assigned`). Fixed at the shared service method by resolving the Driver PK once and using it for both the trip lookup and the emit — a single root-cause fix rather than patching callers.
