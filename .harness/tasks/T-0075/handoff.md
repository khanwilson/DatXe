# Handoff: T-0075

## Summary

VNPay end-to-end sandbox wiring is complete. The `app_user` payment flow now calls the real backend `POST /payments/vnpay` endpoint (no more hardcoded mock URL), the FE API contract is aligned to the backend DTO (`{ booking_id, amount, order_info, client_ip }`), and state machine gating ensures the UI transitions to `LOOKING` only after confirmed payment (via WS `booking.payment_success` or `GET /payments/:bookingId` status = `SUCCESSFUL`). Backend VNPay signing was rewritten to guarantee byte-equality between the signed data and the returned URL query (single RFC3986 encoder, `%20` for spaces, sorted keys, no `+`). `.env.example` was updated with sandbox defaults and setup guidance.

All automated checks pass. Live VNPay sandbox E2E execution is `MANUAL_PENDING` per contract — it requires user-supplied merchant credentials and a non-dev build.

## Files Changed

### Source Files

| File | Purpose |
|---|---|
| `app_user/src/api/axios/config.ts` | Updated endpoint from `/payments/vnpay/create-payment-url` to `/payments/vnpay` |
| `app_user/src/api/services/paymentService.ts` | Removed `mockCreateVnpayUrl` and `__DEV__` hardcoded URL; added `CreateVnpayUrlParams` type; function now POSTs `{ booking_id, amount, order_info, client_ip }` and returns `{ payment_id, transaction_id, payment_url }` |
| `app_user/src/api/hooks/useBooking.ts` | Updated `useCreateVnpayUrl` to accept `CreateVnpayUrlParams` instead of bare string |
| `app_user/app/BookingRouteScreen.tsx` | Pass real fare as `amount`, build URL-safe `order_info`, use `CLIENT_IP_FALLBACK = '127.0.0.1'`, open real `payment_url`, added `pollPaymentSuccess` helper + `wsConfirmedPaidRef`, gate `LOOKING` on confirmed payment, Vietnamese error on fail/cancel |
| `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts` | Replaced dual-encoding with single deterministic `buildSignData` (RFC3986, `%20`, sorted keys); `buildVnpayUrl` returns exact signed string + hash; `verifyVnpayCallback` uses same encoder for round-trip verification |
| `nestjs_prisma/.env.example` | Updated sandbox defaults: `VNPAY_URL`, `VNPAY_RETURN_URL` LAN/tunnel placeholder, setup guidance comment; secrets remain placeholders |

### Task Artifacts

- `.harness/tasks/T-0075/plan.md`
- `.harness/tasks/T-0075/contract.md`
- `.harness/tasks/T-0075/implementation.md`
- `.harness/tasks/T-0075/files-changed.md`
- `.harness/tasks/T-0075/decisions.md`
- `.harness/tasks/T-0075/evaluation.md`
- `.harness/tasks/T-0075/review.md`
- `.harness/tasks/T-0075/status.md`

## Commands Run

| Command | Result |
|---|---|
| `cd app_user && npx tsc --noEmit` | PASS (exit 0) |
| `cd app_user && bun lint` | PASS (exit 0) — 0 errors in changed files |
| `cd nestjs_prisma && bun run build` | PASS (exit 0) |
| `cd nestjs_prisma && bun test` | SKIPPED — zero spec files; signing verified via node script |
| Grep `sandbox.vnpayment.vn` in `app_user/**` | PASS — no hardcoded strings |
| Grep real VNPAY secrets | PASS — `.env.example` uses placeholders only |

## Test / Build Status

- **app_user typecheck**: ✓ Clean
- **app_user lint**: ✓ Clean (4 pre-existing warnings in unrelated files)
- **nestjs_prisma build**: ✓ Clean
- **nestjs_prisma test suite**: Skipped (no spec files; signing determinism verified via fixed-sample node script recorded in `implementation.md:50-60`)
- **Secrets audit**: ✓ No real credentials committed
- **Contract alignment**: ✓ All AC met

## Contract Status

**PASS**. All 10 acceptance criteria met:

1. ✓ `createVnpayUrl` never returns mock URL
2. ✓ Endpoint constant = `/payments/vnpay`
3. ✓ Body sends `{ booking_id, amount, order_info, client_ip }` with real values
4. ✓ Response `{ payment_id, transaction_id, payment_url }` typed and consumed
5. ✓ Opens real backend `payment_url`
6. ✓ `LOOKING` gated on confirmed payment (WS or status poll), not browser close
7. ✓ Failed/cancelled/missing-config paths reset UI + Vietnamese error
8. ✓ Signing deterministic: signed data byte-identical to URL query
9. ✓ `.env.example` sandbox defaults; no real secrets
10. ✓ Manual steps + limitations documented (this handoff + `implementation.md`)

## Review Status

**PASS**. Reviewer confirmed contract compliance, correctness of signing/state machine, edge case handling, security (no hardcoded secrets, auth preserved), and performance (poll interval reasonable). No Critical/Major/Minor blocking issues. Two Nits flagged as follow-ups (out of Allowed Files):

- `payment.service.ts:58` fallback URL inconsistency (legacy `paygate` vs new `paymentv2/vpcpay.html`) — only triggers if `.env` omits `VNPAY_URL`.
- `BookingRouteScreen.tsx:297` modal ref timing (pre-existing pattern, not T-0075 regression).

## Known Issues

### Development Limitations (In Scope, Documented, Not Fixed)

1. **bookingService DEV mock** — `bookingService.createBooking` still returns a mock in `__DEV__`. To test real VNPay flow: run a non-dev build or temporarily disable the mock. Removing it is out of contract scope (T-0072 territory).
2. **useBookingSocket.runDevMock** — In dev mode with no live socket, auto-fires `payment_success` after 3s. Expected dev behavior; not a production path. Untouched per contract.
3. **Browser close detection** — App uses `openBrowserAsync` (not `openAuthSessionAsync`) with no deep-link scheme. User must manually close the VNPay browser to trigger the poll. Switching to auth session / deep link is an explicit out-of-scope UX decision.

### Follow-up Items (Out of Scope)

- Add `vnpay.util.spec.ts` once backend gains a jest test suite (currently zero spec files).
- Verify `payment.service.ts:58` fallback URL aligns with `.env` sandbox defaults in a future task.

## Follow-up / Next Steps

1. **Live VNPay Sandbox Verification** (user-facing, `MANUAL_PENDING`):

   1. Register sandbox merchant at https://sandbox.vnpayment.vn/devreg (free, instant).
   2. Obtain `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` from merchant panel.
   3. Populate `nestjs_prisma/.env` (local, not committed):
      ```
      VNPAY_TMN_CODE=<your-merchant-code>
      VNPAY_HASH_SECRET=<your-hash-secret>
      VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
      VNPAY_RETURN_URL=http://<your-lan-ip>:3000/api/v1/payments/vnpay/callback
      ```
      (Use LAN IP for device access; ngrok/tunnel if VNPay must POST callback remotely.)
   4. Start backend and `app_user` dev build (or non-dev build to bypass bookingService mock).
   5. Create a booking in the app, tap pay.
   6. Verify the opened URL renders the VNPay card form (not `Invalid data format` error).
   7. Pay with a VNPay sandbox test card (available on their docs).
   8. Confirm backend callback sets `Payment.status=SUCCESSFUL`, emits WS `booking.payment_success`, and app transitions to `LOOKING` (driver search) within 3s (WS fast path) or up to 60s (poll).
   9. Test cancellation: close the VNPay browser without paying. App should reset to booking screen with Vietnamese error `Thanh toán thất bại` within 60s.

2. **Code-Level Verification**:
   - `BookingRouteScreen.tsx` lines 229, 290–306: WS subscription during PAYMENT, payment-gated state transition, error reset.
   - `vnpay.util.ts` lines 14–25, 67–71, 88–90: single `encodeVnp`, sorted params, byte-equal sign/URL.

3. **Architecture Decisions to Retain**:
   - FE aligns to BE DTO shape (not vice versa) — enforced via contract.
   - Payment state machine: transition gated on confirmed payment, never browser close.
   - Single RFC3986 encoder for both signing and URL — simplest maintenance path.

## Final Status

**Done**

---

**Completed by**: Harness Closer (Haiku 4.5)  
**Date**: 2026-07-09  
**Task ID**: T-0075  
**Branch**: feature/dat-xe  
**Commits**: None (user will stage and push)
