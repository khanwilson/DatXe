# Files Changed: T-0072

## Backend (nestjs_prisma)

- `api/common/websocket/websocket.gateway.ts`
  - Inject `PrismaService`; import `UserRole` from `@prisma/client`.
  - `handleConnection` now calls `autoJoinRooms` (joins `user:${userId}`, and for drivers `driver:${driverPk}` resolved from `driver.user_id`).
  - Added `@SubscribeMessage('join')` / `@SubscribeMessage('leave')` handlers with `canAccessRoom` ownership validation.
  - `emitDriverNewOffer` payload type: added `pickupLat`, `pickupLng` (additive).

- `api/modules/drivers/drivers.service.ts`  *(contract said `dispatch/dispatch.service.ts` — that dir is empty; this is the real dispatch emit site)*
  - `emitDriverNewOffer` call: pass `pickupLat: booking.pickup_lat`, `pickupLng: booking.pickup_lng`.
  - `updateDriverLocation`: resolve Driver PK from the `driver.update` result and use it for the active-trip lookup and the location emit (was incorrectly using `user.sub`).

## Driver app (app_taixe)

- `src/api/hooks/useDriverSocket.ts`
  - Added `NewOfferWirePayload` type + `mapWireOffer` mapper; `handleNewOffer` receives the flat BE payload and maps to nested `NewOfferPayload`.
  - DEV mock updated to emit the flat wire shape.

- `app/OfferScreen.tsx`
  - Local `DriverAssignedPayload` corrected: dropped nonexistent top-level `driverId` (BE nests driver; screen only uses `tripId`/`bookingId`).

## Passenger app (app_user)

- `src/api/socket/useBookingSocket.ts`
  - Added `DriverAssignedWirePayload` type + `mapWireDriverAssigned` mapper; `handleDriverAssigned` maps nested BE payload → flat public `DriverAssignedPayload`.
  - Gated `runDevMock` behind `__DEV__`.

## Verified, not changed

- `app_taixe/src/api/socket/socketClient.ts`, `app_user/src/api/socket/socketClient.ts` — JWT attach on handshake correct.
- `app_taixe/src/api/hooks/useTripActions.ts` — trip REST paths correct (not in Allowed Files; verify-only).
- `app_user/src/api/hooks/useTripSocket.ts` — consumer of flat `DriverAssignedPayload`, unaffected by the mapper.
