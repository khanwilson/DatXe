# T-0063 Plan — BE: Dispatch Module (Find Nearest Driver)

**Phase**: Planning  
**Model**: Sonnet  
**Created**: 2026-07-07

---

## Goal

Implement the `DispatchModule` on the backend: driver location updates, a 3-round sweep dispatch loop triggered by payment success, WebSocket notifications to driver/user, and the offer accept/reject flow via WebSocket.

---

## Key Observations from Codebase

1. **`Driver.current_location Json?` already exists** in schema — the contract says to add `last_location`, but `current_location` serves the identical purpose. We will use `current_location` instead of adding a duplicate field. No schema migration needed for this field. **Only the enum additions need a migration.**

2. **`@nestjs/event-emitter` already installed** in `package.json` — no `bun add` needed.

3. **`BookingStatus` enum missing**: `LOOKING_DRIVER`, `NO_DRIVER` — these must be added. `DRIVER_ARRIVED` is already in `TripStatus` but not `BookingStatus`; contract requests it in `BookingStatus` too (for booking state machine completeness).

4. **`DispatchOffer.expired_at`** is the existing DB field name (contract calls it `expires_at` — we use the DB name in Prisma queries).

5. **`PaymentService.handleVnpayCallback`** currently emits only via `WebSocketGateway.emitPaymentSuccess`. We need to also emit an internal `payment.success` NestJS EventEmitter event so `DispatchService` can listen.

6. **`WebSocketGateway`** needs two new emitter methods: `emitDriverNewOffer` and `emitBookingDriverAssigned` / `emitBookingNoDriverFound`.

7. **Auth guard pattern**: booking module controller uses `@UseGuards(JwtAuthGuard)` — dispatch controller will follow same pattern. Auth module exposes `JwtAuthGuard`.

---

## Approach

### Step 1 — Prisma schema + migration
Add to `BookingStatus` enum:
- `LOOKING_DRIVER`
- `NO_DRIVER`
- `DRIVER_ARRIVED` (optional per contract — include for completeness)

Migration name: `dispatch_booking_status_enum`

No new model fields needed (`current_location` already exists on `Driver`).

### Step 2 — WebSocketGateway additions
Add 3 new emit methods:
- `emitDriverNewOffer(driverId, payload)` → room `driver:{driverId}`
- `emitBookingDriverAssigned(bookingId, driverId, payload)` → rooms `booking:{bookingId}` + `driver:{driverId}`
- `emitBookingNoDriverFound(bookingId, payload)` → room `booking:{bookingId}`

### Step 3 — PaymentService update
Add `EventEmitter2` injection to `PaymentService`.  
In `handleVnpayCallback`, after setting `PAYMENT_COMPLETED`, emit `payment.success` event:
```ts
this.eventEmitter.emit('payment.success', { bookingId: payment.booking_id });
```

### Step 4 — DispatchModule files
Create:
- `dispatch.module.ts` — imports PrismaModule, WebSocketModule, EventEmitterModule (global so no re-import needed)
- `dispatch.controller.ts` — `PATCH /api/v1/drivers/location` (JWT driver guard)
- `dto/update-driver-location.dto.ts`
- `dispatch.service.ts` — location update + Haversine helper
- `dispatch.listener.ts` — `@OnEvent('payment.success')` → triggers dispatch loop

**DispatchService responsibilities**:
- `updateDriverLocation(driverId, dto)` — upsert `current_location` on Driver
- `runDispatchLoop(bookingId)` — 3-round sweep
- `handleOfferResponse(driverId, offerId, accepted)` — called from WebSocket listener

**Dispatch loop design**:
```
rounds = [{radius: 5, timeout: 30s}, {radius: 10, timeout: 30s}, {radius: 15, timeout: 30s}]
skipSet = Set<driverId>  // rejected drivers in this booking session
for each round:
  drivers = query ONLINE drivers with non-null current_location, filtered by Haversine ≤ radius
  sorted ascending by distance
  for each driver (not in skipSet):
    offer = create DispatchOffer(status=PENDING, expired_at=now+15s)
    emit WS driver.new_offer
    wait 15s via Promise + setTimeout
    re-fetch offer status:
      ACCEPTED → update Booking=ACCEPTED, create Trip, emit booking.driver_assigned → return
      REJECTED → add to skipSet, continue next driver
      PENDING (timeout) → update offer=EXPIRED, add to skipSet, continue
if all rounds exhausted → Booking=NO_DRIVER, emit booking.no_driver_found
```

**Offer response handling** (WebSocket event `driver.offer_response`):
- Add `@SubscribeMessage('driver.offer_response')` handler in `WebSocketGateway` OR use a dedicated listener file
- Resolves the pending Promise in the dispatch loop via a shared `Map<offerId, resolver>`

**Concurrency approach**: `resolverMap = Map<offerId, (accepted: boolean) => void>` stored in `DispatchService`. The offer-wait Promise registers a resolver; the WS handler calls it. After 15s timeout, a `setTimeout` calls resolver with `false` (treat as expired).

### Step 5 — WebSocketGateway: add SubscribeMessage handler
Add `@SubscribeMessage('driver.offer_response')` in gateway that calls `dispatchService.resolveOffer(offerId, accepted)`.

### Step 6 — AppModule update
Import `EventEmitterModule.forRoot()` and `DispatchModule`.

### Step 7 — Build + lint verification
Run `bun run build` and `bun run lint` in `nestjs_prisma/`.

---

## File Change Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `LOOKING_DRIVER`, `NO_DRIVER`, `DRIVER_ARRIVED` to `BookingStatus` enum |
| `prisma/migrations/` | New migration `dispatch_booking_status_enum` |
| `api/app.module.ts` | Import `EventEmitterModule.forRoot()`, `DispatchModule` |
| `api/common/websocket/websocket.gateway.ts` | Add 3 emit methods + `SubscribeMessage` for `driver.offer_response` |
| `api/modules/payment/payment.service.ts` | Inject `EventEmitter2`, emit `payment.success` after PAYMENT_COMPLETED |
| `api/modules/payment/payment.module.ts` | Import `EventEmitterModule` (or rely on global) |
| `api/modules/dispatch/dispatch.module.ts` | New |
| `api/modules/dispatch/dispatch.controller.ts` | New — PATCH /drivers/location |
| `api/modules/dispatch/dispatch.service.ts` | New — location update + dispatch loop |
| `api/modules/dispatch/dispatch.listener.ts` | New — @OnEvent('payment.success') |
| `api/modules/dispatch/dto/update-driver-location.dto.ts` | New |

---

## Risks

- **Dispatch loop concurrency**: If two payments succeed simultaneously for same driver pool, two loops may run independently. Acceptable for now (single-driver apps); T-0068 can add lock.
- **No DB for current test**: migration needs live DB. Build/lint can pass without DB; note in evaluation.
- **Offer resolver leak**: if app crashes mid-dispatch, resolvers in Map are lost. Acceptable for MVP.
- **`SubscribeMessage` in gateway vs separate listener**: putting it in gateway keeps WS logic centralized; gateway will need `DispatchService` injected (circular dependency risk). Mitigate: `WebSocketModule` exports gateway; `DispatchModule` imports `WebSocketModule`. Gateway does NOT import `DispatchModule` — gateway calls `dispatchService` directly, so inject `DispatchService` lazily via `ModuleRef` or inject at gateway level by having `DispatchModule` forward-declare. **Cleaner approach**: gateway emits to all, `DispatchService` registers resolvers via a method; gateway `SubscribeMessage` calls `dispatchService.resolveOffer()` — this requires `DispatchService` injected in gateway. To avoid circular: export `DispatchService` from `DispatchModule`, import `DispatchModule` in `WebSocketModule` OR use `forwardRef`. Chosen: use `ModuleRef` + lazy get in gateway to avoid circular module dependency.

---

## Architect Escalation

Not required — scope is contained within one new module + two existing file touches. No cross-project boundary, no auth/payment rework.

---

## Model Used

Sonnet (planning). Opus for implementation per harness routing.
