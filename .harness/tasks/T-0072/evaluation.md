# Evaluation: T-0072

## Summary

Contract-audit + gap-fix of WebSocket contracts and DEV-mock gating across `nestjs_prisma`, `app_taixe`, `app_user`. All five in-scope events reconciled (three via FE reshape / additive fields, one via ID-semantics root-cause fix in `updateDriverLocation`, one already matching). Missing `join`/`leave` gateway handlers added with room-ownership validation and driver auto-join. `runDevMock` in `app_user` gated behind `__DEV__`. Type-check clean on all three projects; lint clean on all edited files. Manual E2E (live devices + backend) cannot run in this evaluator sandbox and is deferred to QA.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `nestjs_prisma`: `bunx tsc --noEmit` | PASS (exit 0) | no output |
| `nestjs_prisma`: `bunx eslint api/common/websocket/websocket.gateway.ts api/modules/drivers/drivers.service.ts` | PASS (exit 0) | scoped to edited files |
| `nestjs_prisma`: `jest` | SKIPPED | no `*.spec.ts` present in `nestjs_prisma/api` — logged as skipped per contract |
| `nestjs_prisma`: `nest build` | SKIPPED | contract required checks are lint + typecheck (+ test if present); build not listed and not required for this task |
| `app_taixe`: `bunx tsc --noEmit` | PASS (exit 0) | no output |
| `app_taixe`: `bunx expo lint src/api/hooks/useDriverSocket.ts app/OfferScreen.tsx` | PASS (exit 0) | env warnings unrelated (Mapbox env, Undici experimental) |
| `app_taixe`: test | SKIPPED | no test runner configured (per project CLAUDE.md) |
| `app_user`: `bunx tsc --noEmit` | PASS (exit 0) | no output |
| `app_user`: `bunx expo lint src/api/socket/useBookingSocket.ts` | PASS (exit 0) | env warnings unrelated |
| `app_user`: test | SKIPPED | no test runner configured |
| Manual E2E smoke (happy / no-driver / cancellation) | DEFERRED | cannot run against live devices + backend from this sandbox — steps listed below |

## Contract Compliance

Allowed Files (per contract):
- nestjs_prisma/api/common/websocket/websocket.gateway.ts — edited
- nestjs_prisma/api/modules/dispatch/dispatch.service.ts — **does not exist** (empty/missing dir). See D1 assessment.
- nestjs_prisma/api/modules/trip/trip.service.ts — not edited (verified only)
- app_taixe/src/api/hooks/useDriverSocket.ts — edited
- app_taixe/src/api/socket/socketClient.ts — not edited (verified only)
- app_taixe/app/OfferScreen.tsx — edited
- app_user/src/api/socket/useBookingSocket.ts — edited
- app_user/src/api/hooks/useTripSocket.ts — not edited (verified only)
- app_user/src/api/socket/socketClient.ts — not edited (verified only)

Actually modified (per `git diff --name-only`, excluding `.harness/` docs):
- `nestjs_prisma/api/common/websocket/websocket.gateway.ts`
- `nestjs_prisma/api/modules/drivers/drivers.service.ts`  ← **not in Allowed Files** (D1 path substitution)
- `app_taixe/app/OfferScreen.tsx`
- `app_taixe/src/api/hooks/useDriverSocket.ts`
- `app_user/src/api/socket/useBookingSocket.ts`

Out-of-scope compliance:
- No payment code touched (`booking.payment_success` emit site remains untouched; no `paymentService.ts` change; no `/payments/*` controller change). Confirmed: `emitPaymentSuccess` in `websocket.gateway.ts:206-212` unchanged.
- No driver online/offline stats change (`goOnline`, `goOffline`, `getDriverStats` in `drivers.service.ts:280-369` untouched).
- No Prisma schema or migration change (confirmed by diff scope).
- No new endpoints, no new UI.

## Acceptance Criteria

| Criterion | Result | Evidence |
|---|---|---|
| `driver.new_offer` FE ↔ BE shapes agree | PASS | BE emits flat payload with additive `pickupLat`/`pickupLng` at `nestjs_prisma/api/modules/drivers/drivers.service.ts:164-175` and payload type at `nestjs_prisma/api/common/websocket/websocket.gateway.ts:215-231`. FE mapper `mapWireOffer` at `app_taixe/src/api/hooks/useDriverSocket.ts:36-49` produces nested `NewOfferPayload` for the existing `HomeScreen` consumer; handler wired at line 92-95. |
| `driver.offer_response` FE ↔ BE shape agree | PASS | Verify-only. BE handler at `websocket.gateway.ts:303-310` accepts `{ offerId, accepted }`; FE emits same at `app_taixe/app/OfferScreen.tsx:80, 90`. |
| `booking.driver_assigned` FE ↔ BE shapes agree | PASS | BE emits nested driver at `websocket.gateway.ts:234-254` and populated at `drivers.service.ts:203-216`. `app_user` maps nested → flat via `mapWireDriverAssigned` at `app_user/src/api/socket/useBookingSocket.ts:34-45`; `vehicleType` → `vehicleModel` mapping present at line 41. `app_taixe/app/OfferScreen.tsx:15-18` narrows local type to `{ tripId, bookingId }` (only fields read by the screen). |
| `trip.status_changed` FE ↔ BE shapes agree | PASS | Verify-only. BE `emitTripStatusChanged` at `websocket.gateway.ts:169-178` emits `{ tripId, bookingId, status }`; FE listener types match at `app_user/src/api/socket/useBookingSocket.ts:53-57`. |
| `driver.location_updated` FE ↔ BE shapes agree AND semantics fixed | PASS | Shape unchanged. Driver-PK fix at `nestjs_prisma/api/modules/drivers/drivers.service.ts:66-93`: `driver.update` returns `{ id }`, lookup uses `driver_id: driver.id` (line 77), emit uses `driver.id` (line 88). Previously would have used `user.sub` and never matched. |
| Room-join handler exists; role-based rooms | PASS | `@SubscribeMessage('join')` at `websocket.gateway.ts:312-320`, `('leave')` at 322-327. `canAccessRoom` ownership validation at 330-356. Driver auto-join to `driver:${driverPk}` at `autoJoinRooms` (line 84-100) resolves PK from `driver.user_id` and stores it in `socket.data.driverId` for the ownership check. |
| Both DEV mocks gated to `__DEV__` | PASS | `app_user`: gate at `app_user/src/api/socket/useBookingSocket.ts:154` (`!socket.connected && __DEV__`). `app_taixe`: gate at `app_taixe/src/api/hooks/useDriverSocket.ts:99` (`!socket.connected && __DEV__`). |
| Trip REST verified | PASS (verification) | Implementer notes verified `trip.service.ts` and `useTripActions.ts`. Not edited; verify-only per contract. Path/auth/response shape matches; each PATCH triggers `emitTripStatusChanged`. |
| Manual E2E happy path | DEFERRED | Cannot execute in evaluator sandbox — see "Manual E2E steps" below. |

## Security / Secrets Check

- Grep for API keys / secrets / password / hardcoded tokens across all five edited files — zero hits.
- JWT flow: `handleConnection` at `websocket.gateway.ts:52-77` still requires a token, calls `jwtService.verify`, and disconnects on failure. `autoJoinRooms` gated on `user?.id`. No auth path weakened.
- Room ownership: passenger cannot join arbitrary `booking:` room — `canAccessRoom` at line 346-353 queries the booking and requires the socket's `user.id` to match `customer.user_id` or `driver.user_id`. `user:` and `driver:` rooms similarly gated.
- DEV mocks: `runDevMock` now only fires when `__DEV__ === true`, preventing fake driver data in production builds.
- No new dependencies, no env changes, no new outbound network calls.

## D1 Assessment — `dispatch.service.ts` → `drivers.service.ts`

Contract's Allowed Files listed `nestjs_prisma/api/modules/dispatch/dispatch.service.ts` but that directory does not exist in the repo (verified: `ls /Users/chubo/Work/DatXe/nestjs_prisma/api/modules/dispatch` → No such file or directory). The actual dispatch emit sites (`emitDriverNewOffer`, `emitBookingDriverAssigned`, `resolveOffer`, `runDriversLoop`, `updateDriverLocation`) live in `nestjs_prisma/api/modules/drivers/drivers.service.ts`.

**Assessment: acceptable in-spirit interpretation.** Same logical target (dispatch emit surface), same module role, no scope expansion, no functional widening — the implementer routed the required edits to the file that actually holds the emit code. Flagging so a future contract for this repo names `drivers/drivers.service.ts` instead of the non-existent `dispatch/dispatch.service.ts`. Not a failure trigger.

Recommendation for follow-up: update project state / conventions doc so future contracts point at the real dispatch service path.

## Manual E2E Steps (deferred to QA)

Cannot run from the evaluator sandbox (no live backend, no real devices). Recommended smoke set:

1. **Happy path (both apps against live backend):**
   - Driver logs in → goes online → GPS ticks emit `updateDriverLocation`.
   - Passenger logs in → creates booking → sees `booking.status_changed` → LOOKING_DRIVER.
   - Driver receives `driver.new_offer` in `driver:${driverPk}` room; log payload has `pickupLat`/`pickupLng` populated.
   - Driver accepts → passenger receives `booking.driver_assigned` in `booking:${bookingId}`; verify FE flat fields populated (`driverName`, `vehiclePlate`, `vehicleModel`, `driverLat`/`driverLng`).
   - Driver moves → passenger receives `driver.location_updated` with `driverId` equal to the Driver PK from the assignment event (the bug this task fixed).
   - Driver PATCH `/trips/:id/driver-arrived` → both rooms see `trip.status_changed`.
   - Driver PATCH `/trips/:id/start` → status = IN_PROGRESS.
   - Driver PATCH `/trips/:id/complete` → status = COMPLETED.
2. **No-driver path:** create booking with no drivers online / all reject → passenger sees `booking.awaiting_decision`, then `booking.no_driver_found` if retries exhausted.
3. **Cancellation path:** passenger cancels or driver cancels → `booking.cancelled` / `booking.driver_cancelled` emitted to booking room.
4. **Room ownership:** attempt to `join` a `booking:` room the socket does not own — expect no join (silent) and no events received.
5. **DEV mock guard:** run a release build of `app_user` with `__DEV__ === false` — confirm no mock `booking.driver_assigned` or `trip.status_changed` fires when backend is offline.

## Failures

None.

## Root Cause

N/A.

## Fix Recommendation

N/A. For a follow-up housekeeping task: correct the contract template to reference `drivers/drivers.service.ts` (or introduce a real `dispatch/` module) so this path-substitution note doesn't recur.

## Re-evaluation History

- 2026-07-09 — first evaluation pass. Type-check + scoped lint clean on all three projects; acceptance criteria met by inspection; only open item is manual E2E which the evaluator sandbox cannot execute.

## Decision

PASS
