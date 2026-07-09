# Evaluation: T-0075

## Decision
PASS

## Summary

All required automated checks pass. Every allowed file was modified as expected; no file outside `Allowed Files` was touched by this task. FE now hits the real backend `POST /payments/vnpay`, opens the real `payment_url`, and gates the `LOOKING` transition on confirmed payment (WS or `GET /payments/:bookingId` poll). Backend signing is deterministic (single `encodeVnp`; signed string == URL query). Live VNPay sandbox execution is `MANUAL_PENDING` because it requires user-supplied merchant credentials + non-dev build, and this is explicitly acceptable per the contract.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `cd app_user && npx tsc --noEmit` | PASS (exit 0) | Clean typecheck |
| `cd app_user && bun lint` (`expo lint`) | PASS (exit 0) | 0 errors, 4 pre-existing warnings in `SearchDestinationScreen.tsx`, `authService.ts`, `clearCache.ts` — none in Allowed Files |
| `cd nestjs_prisma && bun run build` (`nest build`) | PASS (exit 0) | Clean build |
| `cd nestjs_prisma && bun test` (`jest`) | SKIPPED | Backend has zero `*.spec.ts` files; signing determinism verified via fixed-sample script in `implementation.md` instead |
| Grep `sandbox.vnpayment.vn` in `app_user/**` | PASS | No matches |
| Grep real VNPAY secrets in repo | PASS | `.env.example` uses `your_tmncode_here` / `your_hash_secret_here` placeholders only |

## Contract Compliance

- Files outside `Allowed Files`: **No**.
- Files changed for T-0075 (per `git status` minus pre-existing unrelated M's like `INDEX.md`, `SETUP_COMPLETE.txt`, `.harness/scripts/create-task.sh`, `.harness/runtime/agent-status.json`, and prior `TASKS.md` staging):
  - `app_user/src/api/axios/config.ts` (allowed)
  - `app_user/src/api/services/paymentService.ts` (allowed)
  - `app_user/src/api/hooks/useBooking.ts` (allowed)
  - `app_user/app/BookingRouteScreen.tsx` (allowed)
  - `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts` (allowed)
  - `nestjs_prisma/.env.example` (allowed)
  - `.harness/tasks/T-0075/{plan,contract,implementation,files-changed,decisions,status}.md` (allowed)
- `app_taixe/**` untouched. Prisma schema / migrations untouched. `bookingService.createBooking` `__DEV__` mock untouched. `useBookingSocket.runDevMock` untouched. No new dependencies. Backend VNPay controller/service DTO shape stable.

## Acceptance Criteria

| Criterion | Result | Evidence |
|---|---|---|
| #1 `createVnpayUrl` never returns mock URL — always hits backend | MET | `paymentService.ts:29-41` — no `__DEV__` branch; single `apiClient.post(ENDPOINTS.PAYMENT.VNPAY_CREATE_URL, ...)` path |
| #2 `ENDPOINTS.PAYMENT.VNPAY_CREATE_URL === '/payments/vnpay'` | MET | `axios/config.ts:34` |
| #3 Body `{ booking_id, amount, order_info, client_ip }` with real values | MET | `paymentService.ts:35-40` (snake_case body); `BookingRouteScreen.tsx:274-279` passes real `bookingAmount`, safe `orderInfo`, `CLIENT_IP_FALLBACK` |
| #4 Response `{ payment_id, transaction_id, payment_url }` typed and consumed | MET | `paymentService.ts:13-17` (`CreateVnpayUrlResponse`); `BookingRouteScreen.tsx:282` reads `vnpayResult.data.payment_url` |
| #5 Opens real backend `payment_url` (not demo URL) | MET | `BookingRouteScreen.tsx:287` `WebBrowser.openBrowserAsync(paymentUrl, ...)` |
| #6 `LOOKING` only on confirmed payment (WS or GET status), not on browser close | MET | `BookingRouteScreen.tsx:290-299`: `wsConfirmedPaidRef` or `pollPaymentSuccess` (checks `SUCCESSFUL`/`FAILED`) gates `setScreenState('LOOKING')`; WS subscribed during `PAYMENT` (line 229) |
| #7 Fail/cancel/missing-config resets UI + Vietnamese error | MET | `BookingRouteScreen.tsx:294-306`: resets to `IDLE`, clears `activeBookingId`, re-presents modal, `Alert.alert('Thanh toán thất bại', ...)` and `Alert.alert('Đặt xe thất bại', ...)` |
| #8 Signed data == URL query (deterministic encoding) | MET | `vnpay.util.ts:14-25`: single `encodeVnp` + `buildSignData`, used identically by `buildVnpayUrl` (line 67-71) and `verifyVnpayCallback` (line 88-90). Round-trip sample in `implementation.md:50-60` confirms `%20`, sorted keys, no `+`, `verify valid: true` |
| #9 `.env.example` sandbox defaults updated; no real secrets | MET | `.env.example:64-67`: placeholders + sandbox URL + `<LAN_OR_TUNNEL_HOST>` return URL |
| #10 Manual sandbox steps + `bookingService` DEV-mock limitation documented | PARTIAL / MANUAL_PENDING | `implementation.md:87-100` documents 6-step manual verification and known dev-mock limitations. `handoff.md` not yet written — that is the Closing-phase artifact per Harness workflow, so treated as expected pending, not a fail. |

## Security / Secrets Check

- No hardcoded API keys, hashes, TMN codes, or hash secrets in changed files.
- `.env.example` contains only placeholders (`your_tmncode_here`, `your_hash_secret_here`).
- `client_ip` fallback = `127.0.0.1` — non-sensitive, backend accepts any non-empty value for VNPay audit field (documented in `decisions.md` D1).
- No injection risk: `orderInfo` is built from booking id (UUID slice) + integer price; encoded by backend `encodeVnp` (RFC3986) before signing/URL build.
- Auth flow / permission surfaces unchanged.

## Failures

None. Automated checks all green.

## Root Cause

N/A.

## Fix Recommendation

N/A. Two follow-ups for later (out of scope for T-0075, tracked in `implementation.md`):

- Add a `vnpay.util.spec.ts` once backend gains a jest suite (currently zero spec files). Determinism was verified via a one-off node sample and the sample is captured in `implementation.md`.
- Manual sandbox E2E validation (register `sandbox.vnpayment.vn/devreg`, populate `.env`, non-dev build): `MANUAL_PENDING`. Steps documented in `implementation.md:87-100`.

## Re-evaluation History

- 2026-07-09 (first pass) — PASS on all automated checks; `MANUAL_PENDING` on live sandbox execution per contract.

## Decision
PASS
