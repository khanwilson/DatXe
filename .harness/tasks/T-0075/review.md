# Review: T-0075

## Decision
PASS

## Summary

VNPay end-to-end wiring is contract-compliant. The `app_user` payment path no longer returns any hardcoded URL, hits the real backend `POST /payments/vnpay`, and only transitions to `LOOKING` after confirmed payment (WS `booking.payment_success` OR `GET /payments/:bookingId` status `SUCCESSFUL`). Backend signing was rewritten so `signData` is byte-identical to the URL query (single `encodeVnp`, sorted keys, `%20`, no `+`). No files outside `Allowed Files` were modified. Live VNPay sandbox execution is legitimately `MANUAL_PENDING` per contract — it requires user-supplied merchant credentials + a non-dev build.

## Contract Compliance

- Files changed in this task match `Allowed Files` exactly:
  - `app_user/src/api/axios/config.ts`
  - `app_user/src/api/services/paymentService.ts`
  - `app_user/src/api/hooks/useBooking.ts`
  - `app_user/app/BookingRouteScreen.tsx`
  - `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts`
  - `nestjs_prisma/.env.example`
  - `.harness/tasks/T-0075/{plan,contract,implementation,files-changed,decisions,evaluation,status}.md`
  - Pre-existing modifications in `.harness/TASKS.md`, `INDEX.md`, `SETUP_COMPLETE.txt`, `.harness/scripts/create-task.sh`, `.harness/runtime/agent-status.json` were staged before this task and are unrelated (evaluation noted this).
- `app_taixe/**`, Prisma schema, `bookingService` DEV mock, and `useBookingSocket.runDevMock` all untouched.
- No new dependencies. Backend VNPay controller/service DTO shape unchanged (only `vnpay.util.ts` internals).

## Correctness

**Signing (`vnpay.util.ts`)**
- Single `encodeVnp = encodeURIComponent` (line 14) is the sole encoder for both `buildSignData` and the URL string returned by `buildVnpayUrl` (line 67-71). Same function is reused by `verifyVnpayCallback` (line 88-90). Round-trip byte-equality is guaranteed by construction.
- Keys are sorted lexicographically via `sortParams` on both the sign and verify paths. Confirmed against the fixed-sample check in `implementation.md:50-60` (`verify valid: true`, `space encoded as %20: true`, `no + present: true`).
- `vnp_Amount` is passed as `String(amount * 100)` (đồng × 100 as VNPay expects). Sample: 45000 VND → `4500000`.

**Payment state machine (`BookingRouteScreen.tsx`)**
- `LOOKING` is entered only when `confirmed` is true (line 292-293). `confirmed = wsConfirmedPaidRef.current || (await pollPaymentSuccess(...))`. Browser close alone never sets `LOOKING`.
- Stale-closure guard: `wsConfirmedPaidRef` is a `useRef` — the poll reads current value each iteration via `isConfirmed()`, so a WS event arriving mid-poll short-circuits correctly (line 71).
- Poll ceiling: 20 × 3s ≈ 60s. Terminates on `SUCCESSFUL` (true), `FAILED` (false), or exhaustion (returns final `isConfirmed()`).
- WS subscription is active during `PAYMENT` state (line 229), so a fast WS success arriving while the browser is still open is captured.
- Failure/cancel path (line 294-306): resets `screenState → IDLE`, clears `activeBookingId`, re-presents modal, shows Vietnamese Alert `Thanh toán thất bại` / `Đặt xe thất bại`. Missing-VNPay-config surfaces as backend `BadRequestException('VNPay configuration missing')` → caught in the `try/catch` → same reset path.

**Callers of the changed API**
- `paymentService.createVnpayUrl` signature changed from `(bookingId)` to `(CreateVnpayUrlParams)`. Consumers grepped: only `BookingRouteScreen.tsx:281` and `useBooking.ts:16`, both updated. No `app_taixe` consumers. No regressions.
- `paymentService.getPaymentStatus` still returns `{ success, data: PaymentStatusResponse }` — matches backend `ApiResponse<T>` envelope and the poll reads `res.data.status` correctly.

## Edge Cases

- `amount` is a JS number (`selected.discountPrice ?? selected.realPrice`) — VND integer, backend DTO validates `@IsNumber() @Min(1000)`. All mock vehicles ≥ 45000. Safe.
- `order_info`: FE builds `DatXe Booking <8char-uuid>, <k> VND`. ASCII only. Contains spaces (which encode to `%20`) and a comma (encodes to `%2C`) — both go through the single `encodeVnp` in signing and URL, so parity holds.
- `client_ip`: constant `127.0.0.1` — non-empty, valid loopback, satisfies backend `@IsNotEmpty()`. VNPay uses it only for audit.
- Transient poll errors (payment record not yet created) are swallowed by the `try/catch` in `pollPaymentSuccess` and polling continues.
- Race WS + poll: both paths set/read `wsConfirmedPaidRef` — even if both fire, the second `setScreenState('LOOKING')` is a no-op.

## Security

- No hardcoded VNPay credentials anywhere; grep confirms `.env.example` uses `your_tmncode_here` / `your_hash_secret_here` only.
- No `sandbox.vnpayment.vn` string remains in `app_user/**` (grep clean).
- No injection surface: `orderInfo` is composed from a UUID slice + integer + literal, then passed through backend `encodeVnp` (RFC3986) before signing/URL.
- Auth surface unchanged; endpoint still requires customer JWT via the axios interceptor.
- HMAC-SHA512 signing preserved; hash secret only ever read via `configService.get('VNPAY_HASH_SECRET')`, never logged.

## Performance

- Poll interval 3s × 20 attempts is reasonable for sandbox latency and cheap on the backend (single Prisma `findUnique` per hit). Marked with a `ponytail:` note documenting how to tune. No perf regression.
- No new dependencies, no bundle impact.

## Code Quality

- `encodeVnp` documented with the `%20` vs `+` VNPay-compat note plus the "how to flip" path — matches D4 decision.
- `wsConfirmedPaidRef` naming + comment explain the stale-closure motivation clearly.
- Vietnamese strings for user-facing errors, English for code comments — matches project convention.
- File structure order in `BookingRouteScreen.tsx` (imports → variables → component → StyleSheet → export) follows CLAUDE.md convention.
- `pollPaymentSuccess` is a pure helper outside the component — clean, testable.

## Test Coverage

- Backend has no jest suite (`package.json` has `"test": "jest"` but zero `*.spec.ts` files). Signing determinism was verified via a one-off `node` script against a fixed sample recorded in `implementation.md:50-60`. The script itself was cleaned up (not committed) per `files-changed.md:25-26`. Adding a real `vnpay.util.spec.ts` is outside the lazy scope for a util fix; noted as follow-up.
- Live VNPay sandbox verification is `MANUAL_PENDING` — the 6-step manual test path is documented in `implementation.md:87-100`. Acceptable per contract.

## Regression Risk

- `createVnpayUrl` signature change is the only breaking API shift. Both in-tree consumers were updated. `app_taixe` never imports `paymentService`. Low risk.
- `useBookingSocket` bookingId condition now includes `PAYMENT` — expands subscription window but same event handlers, same cleanup. Low risk.
- Backend `payment.service.ts` unchanged; only the util internals changed, callers stay stable. Low risk.
- Pre-existing hardcoded default `https://sandbox.vnpayment.vn/paygate` in `payment.service.ts:58` as `VNPAY_URL` fallback is inconsistent with the new `.env.example` default (`paymentv2/vpcpay.html`) — but `payment.service.ts` is not in Allowed Files and the fallback only fires when the env is missing entirely. Flagged as Nit below.

## Issues Found

| Severity | File | Issue | Recommendation |
|---|---|---|---|
| Nit | `nestjs_prisma/api/modules/payment/payment.service.ts:58` | `configService.get('VNPAY_URL', 'https://sandbox.vnpayment.vn/paygate')` fallback still points at the legacy `paygate` endpoint, inconsistent with the new `.env.example` `paymentv2/vpcpay.html`. | Out of Allowed Files for T-0075 — track as a follow-up. Only triggers if `.env` omits `VNPAY_URL` entirely. |
| Nit | `app_user/app/BookingRouteScreen.tsx:297` | `bookingModalRef.current?.present()` called immediately after `setScreenState('IDLE')` while the modal is currently unmounted (mounted only when `isModalVisible`). The re-mount happens on the next render, so `.present()` runs against a null ref. The pattern already existed in `handleNoDriverFound` (line 221), not a T-0075 regression. | Pre-existing minor UX quirk. If encountered later, gate modal mounting on `isModalVisible \|\| screenState === 'PAYMENT'` or call `.present()` inside an effect keyed on `screenState`. Out of scope here. |
| Nit | `app_user/app/BookingRouteScreen.tsx:184-188` | `handlePaymentSuccess` sets `wsConfirmedPaidRef.current = true` AND `setScreenState('LOOKING')`. If WS fires while the browser is still open, the screen state transitions to LOOKING even though the user may still be on the VNPay page. Then `handleBook` continues after browser close and re-sets LOOKING (no-op). Harmless because the modal is already dismissed and the browser is external. | Acceptable — documented in D3. No change required. |

No Critical, Major, or Minor blocking issues.

## Payment-Specific Verification Notes

**Signing byte-equality (AC #8)**
- `buildSignData` output at `vnpay.util.ts:21-25` is directly interpolated into the returned URL at line 71 (`${signData}&vnp_SecureHash=${signed}`). No re-encoding, no `querystring.stringify` middleware, no dual-path. The HMAC input is character-for-character the URL query.
- Callback re-verification at line 85-90 parses the incoming query, drops `vnp_SecureHash*`, sorts, runs the same `buildSignData`, and re-HMACs — same encoder, same sort, so a legitimate round-trip reproduces the hash.

**State machine (AC #6)**
- The only place `setScreenState('LOOKING')` runs outside the confirmed branch is inside `handlePaymentSuccess` (a WS event handler) — which is itself the "confirmed" signal. Browser-close never triggers it directly.
- `useBookingSocket` bookingId gate is `screenState in {LOOKING, DRIVER_FOUND, PAYMENT}` (line 227-229). During PAYMENT, WS is active. On IDLE/BOOKING, bookingId is null → hook is inert.

**Failure paths (AC #7)**
- Three failure sources funnel to the same reset:
  1. Poll returns false → `else` branch on line 294 → Vietnamese `Thanh toán thất bại`.
  2. `createVnpayUrl` throws (missing config, network) → `catch` on line 300 → Vietnamese `Đặt xe thất bại`.
  3. `createBooking` throws → same `catch`.
- All three: `setScreenState('IDLE')` + clear `activeBookingId` + re-present modal + Alert.

**Manual sandbox (AC #10)**
- 6-step reproduction is documented in `implementation.md:87-100`. Two known dev limitations (bookingService DEV mock, useBookingSocket runDevMock) are called out as explicitly out-of-scope, per contract.

## Architect Escalation Needed?
No.

## Risk Assessment

Low. No architecture changes, no schema changes, backend DTO stable, small blast radius. The one live-execution gap (VNPay sandbox against real merchant creds) is contract-approved as MANUAL_PENDING and gated on user-supplied secrets.

## Decision
PASS
