# Review: T-0072

## Summary

Contract-audit + gap-fix of the trip-lifecycle WebSocket contracts across `nestjs_prisma`, `app_taixe`, `app_user`. All five in-scope events reconciled (three via FE reshape / additive fields, one via ID-semantics root-cause fix, one already matching). Missing `join`/`leave` handlers added with `canAccessRoom` ownership validation; drivers auto-join `driver:${driverPk}` on connect. `runDevMock` in `app_user` now gated behind `__DEV__`.

Type-check clean on all three projects; scoped lint clean on all edited files. D1 path substitution (`dispatch/dispatch.service.ts` → `drivers/drivers.service.ts`) is acceptable — the contract's listed dir does not exist, and the edits landed at the actual emit surface with no scope expansion.

Overall the implementation is correct, tight, and matches the plan. One low-severity nit and one small housekeeping follow-up. No blockers.

## Contract Compliance

- Allowed Files: 4 of 5 edited files are inside the contract's list. The fifth (`drivers/drivers.service.ts`) substitutes for the contract's non-existent `dispatch/dispatch.service.ts` — same module role, same emit surface, no functional widening. Documented in `decisions.md` D1 and `evaluation.md`. Acceptable in-spirit interpretation.
- Out of Scope: `emitPaymentSuccess` at `websocket.gateway.ts:206-212` untouched; `goOnline`/`goOffline`/`getDriverStats` at `drivers.service.ts:280-369` untouched; no Prisma schema/migration change; no new endpoints; no new UI. Verified via diff scope.
- Constraint compliance: no BE field removal (only additive `pickupLat`/`pickupLng`); FE-first reshape preferred and honored; `UserRole.DRIVER` imported from `@prisma/client` (`websocket.gateway.ts:13`) per project memory; TSX order preserved in `OfferScreen.tsx`.
- Acceptance criteria: 8 of 9 PASS by inspection with file:line evidence; the 9th (Manual E2E) is legitimately deferred to QA — evaluator sandbox cannot exercise live devices + live backend.

Verdict: PASS.

## Correctness

- `driver.new_offer` (BE emit → FE map): `drivers.service.ts:164-175` emits the flat wire payload with populated `pickupLat`/`pickupLng`; `useDriverSocket.ts:36-49` maps to the nested `NewOfferPayload` consumed by the existing `HomeScreen` — public type unchanged, `HomeScreen` untouched. Correct.
- `booking.driver_assigned` (nested → flat): `drivers.service.ts:203-216` populates the nested BE shape; `useBookingSocket.ts:34-45` flattens for the app_user public `DriverAssignedPayload`, mapping `vehicleType` → `vehicleModel` and leaving `driverAvatar` unset (BE has no avatar field — expected). `OfferScreen.tsx:15-18` narrows local type to `{ tripId, bookingId }`, which is exactly what the screen reads at lines 92-104. Correct.
- `driver.location_updated` semantics fix (`drivers.service.ts:66-93`): `driver.update` now returns `{ id }`, trip lookup uses `driver_id: driver.id`, emit uses `driver.id`. Previously would have used `user.sub` (User id) against a `driver_id` column (Driver PK) — never matched, event never reached the passenger. Root-cause fix at the shared method, not a per-caller patch. Correct and load-bearing.
- Room-join handler: `@SubscribeMessage('join')` at `websocket.gateway.ts:312-320` gates on `canAccessRoom`; `('leave')` at 322-327 permits leave for any prefix-shaped room (harmless — a socket leaving a room it does not belong to is a no-op). Passenger flow: FE emits `join` `booking:${bookingId}` after `connect` at `useBookingSocket.ts:162,189`; ownership check at `websocket.gateway.ts:346-353` queries the booking's `customer.user_id` / `driver.user_id`. Correct.
- Driver auto-join: `autoJoinRooms` at `websocket.gateway.ts:83-100` joins `user:${userId}` for all, plus `driver:${driverPk}` for `UserRole.DRIVER`. `socket.data.driverId` is set here and read back by `canAccessRoom` at line 343. Correct.
- DEV mock gating: `useBookingSocket.ts:154` (`!socket.connected && __DEV__`) and `useDriverSocket.ts:99` (`!socket.connected && __DEV__`). Correct — mocks now suppressed in production release builds.
- Trip REST verify-only: implementer + evaluator confirmed paths and `emitTripStatusChanged` triggers. Not edited. Correct.

Verdict: PASS.

## Edge Cases

- Connect-race: `useBookingSocket.ts:187-192` handles both `socket.connected === true` (immediate join) and pending connect (`socket.on('connect', ...)`). Timeout at line 153 clears when connect fires. Covered.
- Effect re-run leaks: mock cleanup ref at `useBookingSocket.ts:145,209` fires on unmount; timers and intervals collected in `runDevMock` and cleared. Covered.
- Room ownership for passenger with no active driver: `canAccessRoom` checks `customer.user_id` OR `driver.user_id`; a booking with `driver_id === null` still resolves via the customer branch. Covered by `websocket.gateway.ts:352`.
- Driver connect where the user has `UserRole.DRIVER` but no `driver` row: `autoJoinRooms` at line 95 guards `if (driver)`; the socket keeps its `user:` room but has no `driver:` room. Downstream `driver:` emits silently miss — acceptable, consistent with "driver PK doesn't exist yet".
- OfferScreen accept-then-no-assign fallback: `OfferScreen.tsx:108-114` uses a 10s timeout and reads `responding` from the closure. Preexisting behavior — not part of this task's diff. Not a regression.
- `heading` optional in FE type vs `heading: heading ?? null` in BE: FE type at `useBookingSocket.ts:59-64` marks `heading?: number`, while BE emits `null` when missing (`websocket.gateway.ts:165`). Reading `payload.heading` gets `null` where the FE assumes `undefined | number`. Not a crash — `null` is falsy for the typical `if (heading != null)` idiom — but the type is technically imprecise. Low severity, preexisting, not this task's responsibility to fix.
- `driverAvatar` on `booking.driver_assigned`: FE type marks it optional; mapper leaves it unset. UI must handle `undefined`. Covered by the optional-field contract.

Verdict: PASS.

## Security

- WS handshake auth: `handleConnection` at `websocket.gateway.ts:52-77` still requires a token, verifies via `jwtService.verify`, and disconnects on failure. `socket.data.user` populated only after verification. `autoJoinRooms` runs after auth and only for `user?.id` present. No weakening.
- Room ownership: `canAccessRoom` at `websocket.gateway.ts:330-356` prevents cross-tenant room joining. `user:` requires `id === user.id`; `driver:` requires `id === socket.data.driverId` (the PK resolved at connect, not client-supplied); `booking:` requires the socket's user to be either the customer or the assigned driver via a DB check. Passenger cannot spy on another passenger's booking room. Correct.
- `handleLeave` at `websocket.gateway.ts:322-327` permits any prefix-shaped room to be left. This is safe: `socket.leave` on a room a socket does not belong to is a no-op, and leave is not a privilege escalation. Consistent with socket.io semantics.
- No new secrets, no env changes, no new outbound network calls. Grep for API keys / password / hardcoded tokens across all edited files returned zero hits (per evaluator).
- DEV mock in production: `__DEV__` gate closes the vector where fake `driver_assigned` / `driver_location_updated` could reach a real production build via a slow initial connect.

Verdict: PASS.

## Performance

- `autoJoinRooms` adds one `prisma.driver.findUnique({ select: { id: true } })` per driver connect. Bounded by driver login rate; select is on the indexed `user_id` unique. Acceptable.
- `canAccessRoom` for `booking:` prefix adds one `prisma.booking.findUnique` per `join` emit. Called at most twice per booking lifetime per passenger socket (join + leave, and leave doesn't hit it). Not hot. Acceptable.
- `updateDriverLocation` now performs `driver.update` + `trip.findFirst` per GPS tick. Same query count as before (the previous code also did `findFirst` on `driver_id`) — the change is inside the existing round-trip pattern, not adding a new one. Acceptable.
- No new emits, no new listeners, no new intervals in production paths.

Verdict: PASS. No new regression surface.

## Code Quality

- Comments in English (`websocket.gateway.ts:70-71`, `drivers.service.ts:66-67`, `useDriverSocket.ts:6,22,56`, `useBookingSocket.ts:18,76`, `OfferScreen.tsx:13-14`) — matches CLAUDE.md rule.
- Enum imported from `@prisma/client` (`websocket.gateway.ts:13`: `UserRole`) — matches project memory.
- TSX file order preserved in `OfferScreen.tsx`: imports → types → component → stylesheet → export. Matches CLAUDE.md.
- Mappers (`mapWireOffer`, `mapWireDriverAssigned`) are pure functions and colocated with the hooks that consume them. Clear ownership.
- `console.debug` used in `useDriverSocket.ts` — allowed by app_taixe ESLint config (`console.log` is the error, `debug` is fine).
- `ROOM_PREFIX` regex at `websocket.gateway.ts:17` used consistently in `handleLeave` and `canAccessRoom`. Good.

Nit (low severity): `handleJoin` at `websocket.gateway.ts:312-320` silently drops disallowed joins. This is intentional (don't leak whether a booking exists), but the client has no way to tell a join failed. Consider a debug-level log for observability. Not a blocker.

Verdict: PASS.

## Test Coverage

- `nestjs_prisma`: no `*.spec.ts` present — evaluator logged jest as SKIPPED per contract. Typecheck via `bunx tsc --noEmit` clean.
- `app_taixe`, `app_user`: no test runner configured (per CLAUDE.md for both apps). Typecheck via `bunx tsc --noEmit` clean; lint clean on edited files.
- Manual E2E deferred to QA — sandbox cannot exercise live devices + backend. Steps listed in `evaluation.md:83-95`.

Coverage gap is preexisting (the projects have no test infrastructure); not introduced by this task and not a fix candidate under a contract-audit scope.

Verdict: PASS (given project convention).

## Regression Risk

Low overall. Reasoning:

- Non-payment WS: three FE-side reshapes bounded by mapper functions inside hooks; the public FE types are unchanged, so all downstream consumers (`HomeScreen`, `useTripSocket`, `PickupNavigationScreen`) see the same shape as before. Only mismatches with the wire are fixed at the mapper.
- BE additive fields on `driver.new_offer`: adding `pickupLat`/`pickupLng` is non-breaking for any existing FE consumer that ignored them; and the driver app now populates them from `booking.pickup_lat`/`pickup_lng` which are non-null columns.
- Driver location semantics fix: this event was broken before this task (never reached the passenger). Fixing it is behavior-visible. The scope of change is a single service method; the same emit is used from a single call site. Blast radius: passenger sees driver dot moving on the map — the intended behavior.
- Room-join handlers: additive `@SubscribeMessage`s that did not previously exist. No existing behavior is overridden. Driver auto-join is inside `handleConnection`, gated on `UserRole.DRIVER` — non-driver users unaffected.
- DEV mock gate: strictly narrows the mock's activation surface; production behavior only changes from "possible mock leak" to "definitely no mock". Safe.
- No Prisma schema change, no migration.
- Payment / stats paths not touched.

Verdict: Low risk.

## Issues Found

| Severity | File | Issue | Recommendation |
|---|---|---|---|
| Low | `nestjs_prisma/api/common/websocket/websocket.gateway.ts:312-320` | `handleJoin` silently drops disallowed rooms; no observability for a passenger emitting `join` for a booking they don't own. | Add a `this.logger.debug` on the false branch of `canAccessRoom` inside `handleJoin`. Non-blocking. |
| Low | `app_user/src/api/socket/useBookingSocket.ts:59-64` | `heading?: number` on FE type, BE emits `null` (`websocket.gateway.ts:165`). Type is technically imprecise. | Widen to `heading?: number \| null` in a follow-up cleanup task. Preexisting — not introduced here. |
| Info (housekeeping) | Contract template | Contract listed `nestjs_prisma/api/modules/dispatch/dispatch.service.ts` which does not exist. | For future dispatch-touching tasks, name `nestjs_prisma/api/modules/drivers/drivers.service.ts` as the emit surface, or scaffold a real `dispatch/` module. Follow-up. |

## D1 Assessment — `dispatch/dispatch.service.ts` → `drivers/drivers.service.ts`

Verified: `ls /Users/chubo/Work/DatXe/nestjs_prisma/api/modules/dispatch` — directory does not exist. The dispatch emit surface (`emitDriverNewOffer`, `emitBookingDriverAssigned`, `resolveOffer`, `runDriversLoop`, `updateDriverLocation`) lives in `drivers/drivers.service.ts`. Implementer routed the required edits to the file that actually holds the emit code.

Assessment: acceptable in-spirit interpretation of the contract. Same logical target, same module role, no scope expansion, no functional widening. Recorded in `decisions.md` D1 and `evaluation.md`. Not a review failure trigger.

Follow-up (housekeeping, not this task): update `.harness/PROJECT_STATE.md` / task templates so future contracts naming dispatch point at the correct path.

## Architect Escalation Needed?

No.

The room-join model is standard (auth on connect, ownership on join, role-scoped auto-join for the one role that can't self-address). The Driver-PK vs User-id semantics fix is a bounded root-cause fix at the shared method. No architecture-level boundaries were crossed; no cross-module contract needs revising beyond the tiny additive fields on `driver.new_offer`.

## Decision

PASS
