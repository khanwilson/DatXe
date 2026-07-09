# Contract: T-0075 VNPay Sandbox End-to-End Wiring

## Scope

- Remove hardcoded VNPay URL from `app_user` and always call backend.
- Align `app_user` payment API contract with backend `POST /payments/vnpay`:
  - Endpoint constant.
  - Request body: `{ booking_id, amount, order_info, client_ip }`.
  - Response fields: `{ payment_id, transaction_id, payment_url }`.
- Update `BookingRouteScreen` payment flow to:
  - Pass real `amount` (selected fare) and safe `order_info`.
  - Use dev-safe `client_ip` fallback.
  - Open backend-returned `payment_url`.
  - After browser closes, drive UI state from `GET /payments/:bookingId` status + WS `booking.payment_success`, not from browser close.
  - Reset UI + surface clear Vietnamese error on failed/cancelled/missing config.
- Fix `vnpay.util.ts` signing so the signed data and the returned query string use one deterministic RFC3986-style encoding (spaces as `%20`, sorted params, no `+`/`%20` mismatch between signData and the final URL).
- Update `nestjs_prisma/.env.example` sandbox defaults:
  - `VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
  - `VNPAY_RETURN_URL=http://<LAN_OR_TUNNEL_HOST>:3000/api/v1/payments/vnpay/callback`
  - Placeholder guidance for `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` only.
- Document sandbox setup + manual verification path in task artifacts (`implementation.md`, `handoff.md`).

## Out of Scope

- `app_taixe/**` (protected).
- Payment methods other than VNPay (cash, other gateways).
- Refund implementation (existing mock stays).
- Production VNPay credentials.
- Prisma schema/migration changes.
- Broader T-0072 realtime cleanup, including `runDevMock` in `app_user/src/api/socket/useBookingSocket.ts`.
- Removing `bookingService.createBooking` `__DEV__` mock (documented as a known dev limitation, not fixed here).
- Switching from `openBrowserAsync` to `openAuthSessionAsync` or adding a deep-link scheme (larger UX decision).

## Allowed Files

- `app_user/src/api/axios/config.ts`
- `app_user/src/api/services/paymentService.ts`
- `app_user/src/api/hooks/useBooking.ts`
- `app_user/app/BookingRouteScreen.tsx`
- `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts`
- `nestjs_prisma/.env.example`
- `.harness/tasks/T-0075/plan.md`
- `.harness/tasks/T-0075/contract.md`
- `.harness/tasks/T-0075/implementation.md`
- `.harness/tasks/T-0075/files-changed.md`
- `.harness/tasks/T-0075/decisions.md`
- `.harness/tasks/T-0075/evaluation.md`
- `.harness/tasks/T-0075/review.md`
- `.harness/tasks/T-0075/handoff.md`
- `.harness/tasks/T-0075/status.md`
- `.harness/TASKS.md` (row + header counts only)

Any file outside this list requires a Blocker stop and user approval for scope expansion before it may be modified.

## Acceptance Criteria

1. `paymentService.createVnpayUrl` never returns a hardcoded/mock URL — every call hits `POST /payments/vnpay`.
2. `ENDPOINTS.PAYMENT` constant equals `/payments/vnpay`.
3. `createVnpayUrl` request body contains `{ booking_id, amount, order_info, client_ip }` and consumers pass real values from booking/fare context.
4. Backend response `{ payment_id, transaction_id, payment_url }` is mapped to a stable FE result and consumed by `BookingRouteScreen`.
5. `BookingRouteScreen` opens the real backend `payment_url` (not a demo URL).
6. `BookingRouteScreen` does not transition to `LOOKING`/`SEARCHING_DRIVER` on browser close alone; transition is driven by confirmed payment status (`GET /payments/:bookingId` = SUCCESSFUL) or WS `booking.payment_success`.
7. Failed / cancelled / missing-VNPay-config paths reset UI to the pre-payment screen and show a clear Vietnamese error message.
8. `vnpay.util.ts` signs the exact same encoded string that appears in the returned URL (verified against a fixed sample input in `implementation.md`).
9. `nestjs_prisma/.env.example` sandbox defaults updated; no real secrets committed.
10. `implementation.md` and `handoff.md` describe the manual VNPay sandbox verification steps and the known `bookingService` DEV-mock limitation.

## Required Checks

- `cd app_user && npx tsc --noEmit`
- `cd app_user && bun lint` (skip if script missing/unavailable — log in `evaluation.md`).
- `cd nestjs_prisma && bun run build`
- `cd nestjs_prisma && bun test` (skip if not configured — log in `evaluation.md`).
- Grep audit: no `sandbox.vnpayment.vn` hardcoded string remains in `app_user/**`.
- Grep audit: no real `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` value committed anywhere.
- Manual VNPay sandbox verification steps documented (cannot fully execute automatically because real sandbox credentials are user-supplied — evaluator records as `MANUAL_PENDING` if credentials absent).

## Implementation Constraints

- Do not modify `app_taixe/**`.
- Do not modify Prisma schema, migrations, or database seeding.
- Do not remove or alter `bookingService.createBooking` `__DEV__` mock.
- Do not remove or alter `useBookingSocket` `runDevMock`.
- Do not commit real VNPay merchant credentials; `.env` local file untouched (only `.env.example` is edited).
- Keep VNPay controller/service DTO shape stable — FE aligns to BE, not vice versa.
- No new dependencies added to either project.
- Preserve existing exports/public API of `paymentService` where feasible; if breaking a signature is necessary, update all in-tree callers within Allowed Files.
- Vietnamese-language user-facing error strings.
- Match existing code style/conventions of each project.

## User Approvals

None required at contract creation. A Blocker stop with explicit approval is required before any of the following:

- Editing a file outside Allowed Files.
- Removing the `bookingService` DEV mock.
- Touching `useBookingSocket` `runDevMock`.
- Changing backend VNPay DTO / controller / service beyond `vnpay.util.ts`.
- Adding a new dependency.
- Any Prisma schema change.

## Scope Expansion History

(none)
