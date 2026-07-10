# Contract: T-0072

## Source Inputs
- Plan: `.harness/tasks/T-0072/plan.md`
- Task description: `.harness/tasks/T-0072/description.md`
- Project state: `.harness/PROJECT_STATE.md` (not preloaded; consult on demand only)

## Scope

Contract-audit + gap-fix of WebSocket event contracts and DEV-mock gating across app_taixe (driver), app_user (passenger), nestjs_prisma (backend) for the trip lifecycle. Reshape FE listeners or BE emits so both agree; add missing room-join handler; gate DEV mocks to `__DEV__`; verify trip REST.

## Out of Scope

- `booking.payment_success` event, `POST /payments/vnpay`, `GET /payments/:bookingId`, `mockCreateVnpayUrl` (owned by T-0075)
- driver online/offline stats (T-0073)
- any new UI feature, any new BE endpoint, payment flow changes

## Allowed Files

- nestjs_prisma/api/common/websocket/websocket.gateway.ts
- nestjs_prisma/api/modules/dispatch/dispatch.service.ts
- nestjs_prisma/api/modules/trip/trip.service.ts
- app_taixe/src/api/hooks/useDriverSocket.ts
- app_taixe/src/api/socket/socketClient.ts
- app_taixe/app/OfferScreen.tsx
- app_user/src/api/socket/useBookingSocket.ts
- app_user/src/api/hooks/useTripSocket.ts
- app_user/src/api/socket/socketClient.ts

Note: implementer MAY need to extend this list after grepping for consumers of a changed payload type (e.g. screens that read fields off `driver.new_offer` or `booking.driver_assigned`). Adding any file to Allowed Files requires STOPPING and getting scope approval first.

## Protected Files / Projects

- All payment code paths (`app_user/src/api/services/paymentService.ts`, any `/payments/*` controller/service in `nestjs_prisma`) — owned by T-0075.
- Driver online/offline stats code paths (owned by T-0073).
- Prisma schema and migrations (none required for this task).
- Any file outside the Allowed Files list.

## Acceptance Criteria

- [ ] For each in-scope WS event (`driver.new_offer`, `driver.offer_response`, `booking.driver_assigned`, `trip.status_changed`, `driver.location_updated`), the FE listener payload shape matches the BE emit shape, or a fix is applied so both sides agree.
- [ ] Room-join handler exists on the gateway; each socket joins the correct room by role (passenger → `booking:${bookingId}`, driver → `driver:${driverId}`).
- [ ] Both DEV mocks (`runDevMock` in `app_user/src/api/socket/useBookingSocket.ts` and `app_taixe/src/api/hooks/useDriverSocket.ts`) gated to `__DEV__`.
- [ ] Trip REST (`PATCH /trips/:id/driver-arrived|start|complete`) verified against BE controller (path, auth, response shape).
- [ ] Manual E2E happy path completes with no FE parse errors.

## Required Checks

- [ ] nestjs_prisma: lint + typecheck (+ test if present)
- [ ] app_taixe: `bunx tsc --noEmit` + lint
- [ ] app_user: `tsc --noEmit` + lint
- [ ] Manual E2E smoke: happy path, no-driver path, cancellation path
- [ ] No new test-framework installs

## API Contract

WebSocket events in scope (BE = `websocket.gateway.ts` emit sites; FE = the three hook files listed in Allowed Files):

| Event | Direction | Owner of shape |
|-------|-----------|----------------|
| `driver.new_offer` | BE → `driver:${driverId}` room | Reconcile — prefer FE reshape; extend BE additively only if UI truly needs a missing field |
| `driver.offer_response` | app_taixe → BE | Verify emit site payload `{ offerId, accepted }` |
| `booking.driver_assigned` | BE → both `booking:${bookingId}` and `driver:${driverId}` | Reconcile — prefer flatten on FE to match BE-adjacent DB shape |
| `trip.status_changed` | BE → both rooms | Verify only |
| `driver.location_updated` | BE → `booking:${bookingId}` | Verify only |
| `join` / `leave` (subscribe) | FE → BE | Add `@SubscribeMessage('join')` / `('leave')` handler on gateway if missing |

Trip REST in scope (verification only, no new endpoints):

- `PATCH /trips/:id/driver-arrived`
- `PATCH /trips/:id/start`
- `PATCH /trips/:id/complete`

Each must: authenticate via bearer JWT, mutate BE state as expected, and trigger a `trip.status_changed` emit visible to the passenger.

## Database / Migration Impact

None. No Prisma schema change, no migration. If the implementer finds that a payload gap requires a new DB column, STOP and escalate.

## Security / Secrets / Auth Impact

- Verify JWT is attached on WS handshake for both apps via `auth: { token }` reading `ZustandPersist.accessToken`.
- Verify gateway `handleConnection` rejects sockets without a valid token and populates `socket.data.user`.
- No new secrets, no env changes.

## Native / Release Impact

None. No native module changes, no `app.config.ts` change, no new permission.

## Implementation Constraints

- No git push; no source deletion/rename.
- Prefer FE-side reshape over BE reshape. If BE must change, keep it additive (do not remove existing fields inside this task).
- Stop-and-ask before editing any file outside Allowed Files.
- No new endpoints, no new UI.
- Import Prisma enums from `@prisma/client` (per project memory) — do not hardcode strings.
- Match existing TSX file convention on the FE (import → biến → render → StyleSheet → export) when touching `OfferScreen.tsx`.

## Fix Loop Rules

- Max 2 attempts per mismatch. If a third attempt is needed, step back, diagnose root cause, and post the root-cause explanation before trying a fundamentally different approach.
- If a payload reshape breaks a screen consumer, prefer patching the consumer over reverting the fix.
- If BE reshape is unavoidable, keep it additive within this task (deprecations happen in a follow-up).

## Escalation Triggers

Escalate to `harness-architect` if:

- Room-join model is fundamentally wrong (e.g. race between `connect` and `join`, or ambiguous role-to-room mapping across multiple bookings per user).
- WS auth on the gateway is not workable with the current token strategy.
- A payload gap can only be closed by adding a new DB column or a new backend endpoint.
- More than 2 files outside Allowed Files need to change to complete the fix.

## User Approvals

- Plan approval: assumed granted (contracting was invoked directly against the approved plan).
- No further user approvals required unless an Escalation Trigger fires.

## Status
READY_FOR_IMPLEMENTING
