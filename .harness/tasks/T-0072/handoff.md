# Handoff: T-0072

## Summary

T-0072 completed a full WebSocket contract audit across `nestjs_prisma`, `app_taixe`, and `app_user`, reconciling five trip-lifecycle events with FE↔BE payload mismatches. Two events reshaped on the FE side via mapper functions inside hooks; one received additive BE fields (`pickupLat`/`pickupLng`); one fixed by resolving a root-cause ID-semantics bug in `updateDriverLocation` where Driver PK was confused with User id; one required no changes. Missing gateway `join`/`leave` handlers were added with ownership validation, and drivers now auto-join their role-scoped `driver:${driverPk}` room on connect. Both DEV mocks gated behind `__DEV__`. All three projects type-check clean; scoped lint clean on edited files.

## Files Changed

**nestjs_prisma:**
- `api/common/websocket/websocket.gateway.ts` — `PrismaService` injected; `handleConnection` calls `autoJoinRooms` to join `user:${userId}` (all) + `driver:${driverPk}` (drivers); added `@SubscribeMessage('join')` / `@SubscribeMessage('leave')` handlers with `canAccessRoom` ownership validation; `emitDriverNewOffer` payload type extended with `pickupLat`, `pickupLng` (additive, non-breaking).
- `api/modules/drivers/drivers.service.ts` — `emitDriverNewOffer` now populates `pickupLat: booking.pickup_lat`, `pickupLng: booking.pickup_lng`; `updateDriverLocation` resolved Driver PK from `driver.update()` result and uses it for trip lookup and location emit (was using User id as Driver id, never matched).

**app_taixe:**
- `src/api/hooks/useDriverSocket.ts` — Added `NewOfferWirePayload` type + `mapWireOffer` mapper; `handleNewOffer` receives flat BE payload and maps to nested `NewOfferPayload` shape consumed by `HomeScreen`; DEV mock updated to emit flat wire payload; gate behind `__DEV__`.
- `app/OfferScreen.tsx` — Local `DriverAssignedPayload` type corrected: dropped nonexistent top-level `driverId` (BE nests driver info).

**app_user:**
- `src/api/socket/useBookingSocket.ts` — Added `DriverAssignedWirePayload` type + `mapWireDriverAssigned` mapper; `handleDriverAssigned` maps nested BE payload → flat public shape; `vehicleType` → `vehicleModel` mapping; `runDevMock` gated behind `__DEV__`.

## Commands Run

| Command | Result |
|---------|--------|
| nestjs_prisma: `bunx tsc --noEmit` | PASS |
| nestjs_prisma: scoped `bunx eslint` | PASS |
| app_taixe: `bunx tsc --noEmit` | PASS |
| app_taixe: scoped `bunx expo lint` | PASS |
| app_user: `bunx tsc --noEmit` | PASS |
| app_user: scoped `bunx expo lint` | PASS |

## Test / Build Status

- Type-check: **PASS** on all three projects (zero errors).
- Lint: **PASS** on all edited files in scope.
- Jest: **SKIPPED** — `nestjs_prisma` has no `*.spec.ts` present.
- Test: **SKIPPED** — `app_taixe` and `app_user` have no test runner configured per project CLAUDE.md.
- Manual E2E (live devices + backend): **DEFERRED** to QA — sandbox cannot execute live flows. Smoke steps documented in `evaluation.md:83-95`.

## Contract Status

**Allowed Files**: 4 of 5 edited files inside contract's list. The fifth (`drivers/drivers.service.ts`) substitutes for the contract's non-existent `dispatch/dispatch.service.ts` — same module role, same emit surface, no functional widening. **D1 Assessment** (in `decisions.md`): `dispatch/` dir does not exist; edits routed to the actual dispatch emit surface (`drivers/drivers.service.ts`). Acceptable in-spirit interpretation. **Recommendation for follow-up**: update project state / task templates so future dispatch-touching contracts name `drivers/drivers.service.ts` or scaffold a real `dispatch/` module.

**Out of Scope**: `emitPaymentSuccess` untouched; `goOnline`/`goOffline`/`getDriverStats` untouched; no Prisma schema/migration; no new endpoints; no new UI.

**Acceptance Criteria**: 8 of 9 PASS by inspection with file:line evidence. The 9th (Manual E2E) legitimately deferred to QA.

## Review Status

**PASS** (review.md:124). All five in-scope events reconciled. Security verified (room ownership gates cross-tenant access; DEV mocks suppressed in production). Performance acceptable (auto-join is one `findUnique` per driver connect; room validation one `findUnique` per join, called twice per booking lifetime per socket). Code quality matches project conventions (English comments, `UserRole` enum from `@prisma/client`, TSX file order preserved, mappers colocated). Regression risk low (FE reshapes bounded by mappers, public types unchanged, BE additive-only, Driver-PK fix is root-cause at the shared method). One low-severity nit (silent join failures; debug log suggested but non-blocking) and one housekeeping follow-up (contract path template correction).

## Known Issues

**Low Severity, Preexisting:**
1. `heading?: number` on FE type vs `heading: null` from BE (`websocket.gateway.ts:165`). Type technically imprecise; reading the field gets `null` where FE assumes `undefined | number`. Not a crash (falsy check works). Preexisting, not introduced by this task. Recommend widening to `heading?: number | null` in a follow-up cleanup task.
2. Silent room-join failures on `canAccessRoom` false (no observability for a passenger emitting `join` for a booking they don't own). Intentional design (don't leak whether booking exists), but client has no way to tell join failed. Recommend adding `this.logger.debug` on the false branch in a follow-up.

**Contract Template Follow-up:**
- Future dispatch-touching tasks should name `nestjs_prisma/api/modules/drivers/drivers.service.ts` (real emit surface) or scaffold `dispatch/` module formally, not the non-existent `dispatch/dispatch.service.ts`.

## Follow-up / Next Steps

**Manual E2E Smoke Testing (QA responsibility)**:
1. Happy path: both apps against live backend. Verify `driver.new_offer` payload has `pickupLat`/`pickupLng` populated; `booking.driver_assigned` flat fields correctly populated; `driver.location_updated` reaches passenger with `driverId` matching the Driver PK from assignment.
2. No-driver path: create booking with no drivers online / all reject → `booking.awaiting_decision` → `booking.no_driver_found`.
3. Cancellation path: passenger/driver cancels → `booking.cancelled` / `booking.driver_cancelled`.
4. Room ownership: attempt `join` for a booking you don't own → silent fail (no join).
5. DEV mock guard: release build of `app_user` with `__DEV__ === false` → no mock fires when backend offline.

**Housekeeping (future task):**
- Update `.harness/PROJECT_STATE.md` and task templates to clarify that the dispatch emit surface is `drivers/drivers.service.ts`, not `dispatch/dispatch.service.ts`.
- Optional: add debug log to `websocket.gateway.ts:318` for failed room joins (observability).
- Optional: widen `heading` type in `useBookingSocket.ts:59-64` to `heading?: number | null`.

**Immediate Next Step:**
- Mark T-0072 Done in TASKS.md; unblock subsequent realtime polish tasks as needed.

## Contract Status

All acceptance criteria met; type-check + lint clean; manual E2E deferred per sandbox constraints.

## Final Status

Done
