# Implementation Decisions: T-0075

## D1 — `client_ip` fallback = `127.0.0.1`

A React Native app cannot reliably know its own public IP, and the backend DTO
requires a non-empty `client_ip` (used by VNPay only for auditing). Chose a
constant `CLIENT_IP_FALLBACK = '127.0.0.1'` in `BookingRouteScreen`. Chose loopback
over `0.0.0.0` because it is a valid, unambiguous host that VNPay's `vnp_IpAddr`
audit accepts. Not security-sensitive.

## D2 — Payment confirmation strategy: WS-first, poll fallback

Browser close does not imply payment success. Two confirmation sources:

1. WS `booking.payment_success` (fast path) sets `wsConfirmedPaidRef` and moves to
   `LOOKING` immediately.
2. After the browser closes, `pollPaymentSuccess` polls
   `GET /payments/:bookingId` every 3s up to 20 attempts (~60s), returning true on
   `SUCCESSFUL`, false on `FAILED`, and continuing on transient/missing-record
   errors. It short-circuits if the WS ref is already set.

A `ref` (not state) carries WS confirmation into the in-flight poll to avoid a
stale closure. `LOOKING` is entered only when one source confirms; otherwise the
UI resets and shows a Vietnamese error. Poll ceiling is a `ponytail:` comment —
bump if sandbox settlement is slower.

## D3 — Subscribe WS during `PAYMENT` state

Previously `useBookingSocket` only had a `bookingId` in `LOOKING`/`DRIVER_FOUND`.
Added `PAYMENT` so a `booking.payment_success` arriving while the browser is still
open (or right after) is captured. Without this the WS fast path would miss events
during the payment window.

## D4 — Keep `%20` encoding, require space-free `order_info`

Contract mandates `%20` (not `+`). VNPay's official sample uses `+`, but both work
as long as the signed string equals the URL query. Since `order_info` is the only
signed value that can contain spaces and the FE controls it, kept `%20` and build a
space-free-ish `order_info` (`DatXe Booking <id8>, <k> VND`). `encodeVnp` is the
single source of truth for both signing and URL build, with a `ponytail:` note on
how to flip to `+` if a future signed value needs it.

## D5 — Signing verified via node script, not jest

Backend `package.json` has `"test": "jest"` but zero `*.spec.ts` files. Rather than
scaffold a jest suite (out of the lazy scope for a util fix), verified determinism
with a one-off node script against a fixed sample (result recorded in
`implementation.md`) and deleted it. Add a real `vnpay.util.spec.ts` when the
backend gains a test suite.
