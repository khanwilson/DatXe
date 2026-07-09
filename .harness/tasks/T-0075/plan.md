# Plan: T-0075 VNPay Sandbox End-to-End Wiring

## Goal

Remove the hardcoded VNPay sandbox URL in `app_user`, align the passenger payment API contract with the existing backend endpoint, fix VNPay signing/URL generation details, and document the sandbox setup/manual verification path so the payment flow can run against VNPay sandbox instead of the fake `DEMO` URL.

## Current State Summary

- `app_user/src/api/services/paymentService.ts` returns a hardcoded VNPay URL in `__DEV__`, so sandbox rejects it with `Invalid data format`.
- `app_user/src/api/axios/config.ts` points to `POST /payments/vnpay/create-payment-url`, but backend exposes `POST /payments/vnpay`.
- Backend `CreateVnpayPaymentDto` requires `{ booking_id, amount, order_info, client_ip }`.
- Backend response shape is `{ payment_id, transaction_id, payment_url }`, while FE expects `{ paymentUrl, txnRef }`.
- Backend `.env` currently lacks real `VNPAY_*` values; `.env.example` has placeholder values and an outdated sandbox URL default.
- `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts` signs unencoded query strings, then returns an encoded query string. This can produce a signature/query mismatch for values containing spaces, Vietnamese text, or URLs.
- `BookingRouteScreen` moves to `LOOKING` after browser close regardless of real callback result. It already listens for `booking.payment_success`, but should keep state transitions tied to actual payment status and handle cancel/fail clearly.

## Implementation Approach

1. **Contract alignment in app_user**
   - Update payment endpoint constant to `POST /payments/vnpay`.
   - Replace `CreateVnpayUrlResponse` with backend-aligned data fields.
   - Remove `mockCreateVnpayUrl` and all `__DEV__` hardcoded VNPay URL fallback.
   - Make `createVnpayUrl` accept enough data to send `{ booking_id, amount, order_info, client_ip }`.
   - Map backend snake_case response to a stable FE-friendly result only if needed by call sites.

2. **BookingRouteScreen payment flow**
   - Pass selected fare as `amount`.
   - Build an `order_info` string that avoids special characters where possible and includes booking context.
   - Use a local/dev-safe `client_ip` fallback because mobile apps cannot reliably know their public IP.
   - Open the returned real `payment_url`.
   - After browser closes, poll `GET /payments/:bookingId` or surface a waiting/payment status state instead of assuming success.
   - Keep `booking.payment_success` as the source of truth for switching to `LOOKING`.
   - On failed/cancelled status or payment URL creation failure, reset UI and show a clear Vietnamese error.

3. **Backend VNPay URL signing**
   - Fix signing/query encoding to use one deterministic encoding path for both create URL and callback verification.
   - Prefer RFC3986-style encoding with `%20` for spaces, sorted params, and no `+` mismatch.
   - Add a small focused test if a test harness is practical; otherwise document manual signature verification in evaluation.

4. **Backend VNPay env defaults/docs**
   - Update `nestjs_prisma/.env.example` sandbox defaults:
     - `VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
     - `VNPAY_RETURN_URL=http://<LAN_OR_TUNNEL_HOST>:3000/api/v1/payments/vnpay/callback`
   - Do not commit real `VNPAY_TMN_CODE` or `VNPAY_HASH_SECRET`.
   - If modifying local `.env`, only add placeholder/commented guidance, not real secrets.

5. **Harness documentation**
   - Create/update `contract.md` after plan approval with exact allowed files.
   - During implementation, keep `implementation.md`, `files-changed.md`, `evaluation.md`, and `status.md` updated inline.
   - Update `PROJECT_STATE.md` and `DECISIONS.md` only if contract/API conventions change beyond documenting the active payment contract.

## Expected Contract Scope

### Likely Allowed Files

- `app_user/src/api/axios/config.ts`
- `app_user/src/api/services/paymentService.ts`
- `app_user/src/api/hooks/useBooking.ts`
- `app_user/app/BookingRouteScreen.tsx`
- `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts`
- `nestjs_prisma/.env.example`
- `.harness/tasks/T-0075/*`
- `.harness/TASKS.md`
- `.harness/PROJECT_STATE.md` if closing requires contract/env state update

### Protected / Out of Scope

- `app_taixe/**`
- Payment methods other than VNPay
- Refund implementation
- Production VNPay credentials
- Prisma schema/migrations unless a hard blocker is discovered
- T-0072 broader realtime cleanup, including the existing `runDevMock` in `useBookingSocket`
- Removing `bookingService` DEV mock unless explicitly approved as a scope expansion

## Acceptance Criteria Mapping

1. **No fake VNPay URL**: `paymentService.createVnpayUrl` always calls backend.
2. **Correct endpoint/body/response**: FE sends backend DTO and handles `{ payment_url, transaction_id }`.
3. **Sandbox URL valid**: Generated URL includes required VNPay fields and signature generated from the same encoded params as the query.
4. **Success path**: VNPay callback updates `Payment.status=SUCCESSFUL`, `Booking.status=PAYMENT_COMPLETED`, and emits `booking.payment_success`.
5. **App state**: app_user changes to searching/looking only after WS success or confirmed paid status, not merely browser close.
6. **Failure path**: fail/cancel/missing VNPay config surfaces a clear error and returns user to booking UI.
7. **Docs**: manual sandbox setup and test script are captured in task docs.

## Verification Plan

- `cd app_user && npx tsc --noEmit`
- `cd app_user && bun lint` if available/usable
- `cd nestjs_prisma && bun run build`
- `cd nestjs_prisma && bun test` if configured and not blocked
- Manual API check:
  - Ensure backend `.env` has real sandbox `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, `VNPAY_RETURN_URL`.
  - Create or reuse a booking with a valid customer JWT.
  - Call `POST /api/v1/payments/vnpay` and confirm returned URL starts with `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.
  - Open URL and confirm VNPay shows the sandbox card form, not `Invalid data format`.
  - Complete payment with VNPay test card.
  - Confirm `GET /api/v1/payments/:bookingId` returns `SUCCESSFUL` and the app receives `booking.payment_success`.

## Risks / Blockers

- Real sandbox credentials are required. Without valid `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET`, end-to-end sandbox cannot pass.
- VNPay return URL must be reachable by VNPay servers. `localhost` will not work for a real hosted callback; use LAN only for emulator-to-backend access and a tunnel/ngrok for VNPay callback if needed.
- `bookingService.createBooking` still mocks booking in `__DEV__`; with only VNPay mock removed, local dev must either disable that mock or run a non-dev build to create real backend bookings. Removing that mock is outside the current task unless approved.
- App browser/deep-link close behavior may remain limited if using `openBrowserAsync`; switching to `openAuthSessionAsync` or adding an app deep link would be a larger scope decision.

## Approval Gate

Plan approval is required before Contracting and Implementation.
