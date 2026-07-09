# Implementation: T-0075

## Summary

Wired the `app_user` passenger payment flow to the real backend VNPay endpoint and
made the signing deterministic so VNPay sandbox stops rejecting the URL with
`Invalid data format`.

- Removed the `__DEV__` hardcoded VNPay URL mock from `paymentService`; every call
  now hits `POST /payments/vnpay`.
- Aligned the FE payment contract with the backend DTO
  (`{ booking_id, amount, order_info, client_ip }`) and response
  (`{ payment_id, transaction_id, payment_url }`).
- `BookingRouteScreen` now passes the real selected fare as `amount`, builds a
  URL-safe `order_info`, uses a dev-safe `client_ip`, opens the real backend
  `payment_url`, and no longer assumes success on browser close — it confirms
  payment via WS `booking.payment_success` or by polling
  `GET /payments/:bookingId` before transitioning to `LOOKING`.
- Rewrote `vnpay.util.ts` signing so the exact same RFC3986-encoded query string
  (`%20` for spaces, sorted keys) is used for both the HMAC and the returned URL.
- Updated `nestjs_prisma/.env.example` sandbox defaults + setup guidance.

## Files Changed

| File | Change | Reason |
|---|---|---|
| `app_user/src/api/axios/config.ts` | `PAYMENT.VNPAY_CREATE_URL` → `/payments/vnpay` | Match backend route (was `/create-payment-url`) |
| `app_user/src/api/services/paymentService.ts` | Removed `mockCreateVnpayUrl` + `__DEV__` fallback; `createVnpayUrl` now takes `CreateVnpayUrlParams` and sends `{ booking_id, amount, order_info, client_ip }`; response typed `{ payment_id, transaction_id, payment_url }` | AC #1, #2, #3, #4 — no mock, correct contract |
| `app_user/src/api/hooks/useBooking.ts` | `useCreateVnpayUrl` mutation now accepts `CreateVnpayUrlParams` | Pass real amount/order_info/client_ip through |
| `app_user/app/BookingRouteScreen.tsx` | Pass fare as `amount`, build safe `order_info`, `client_ip` fallback, open real `payment_url`; added `pollPaymentSuccess` + WS-confirm ref; `LOOKING` only after confirmed payment; Vietnamese error on fail/cancel | AC #3, #5, #6, #7 |
| `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts` | Replaced `querystring.stringify` dual-encoding with single deterministic `buildSignData` (RFC3986, `%20`, sorted); URL now returns the exact signed string + hash; callback verify uses the same encoder | AC #8 — sign == URL |
| `nestjs_prisma/.env.example` | `VNPAY_URL` sandbox vpcpay endpoint; `VNPAY_RETURN_URL` LAN/tunnel placeholder; setup guidance comment | AC #9 |

## Signing Verification Result (AC #8)

Ran a fixed-sample check (`node` script, since no jest specs exist). Sample input:

```
vnp_Version=2.1.0, vnp_Command=pay, vnp_TmnCode=DATXE001, vnp_Locale=vn,
vnp_CurrCode=VND, vnp_TxnRef=abc12345-1720000000000,
vnp_OrderInfo="Thanh toan booking" (contains spaces on purpose),
vnp_OrderType=other, vnp_Amount=4500000,
vnp_ReturnUrl=http://192.168.1.20:3000/api/v1/payments/vnpay/callback,
vnp_IpAddr=127.0.0.1, vnp_CreateDate=20260709150800
HASH_SECRET=0123456789ABCDEF0123456789ABCDEF
```

Result:

```
signData:
vnp_Amount=4500000&vnp_Command=pay&vnp_CreateDate=20260709150800&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh%20toan%20booking&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2F192.168.1.20%3A3000%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Fcallback&vnp_TmnCode=DATXE001&vnp_TxnRef=abc12345-1720000000000&vnp_Version=2.1.0

secureHash:
b894ef71b02b824524c36942d9d96361281ad5240d8e058c48ca32601bfe7b412c561f4eaaeabf150fd77d8ffd94427efe9bed04761dcd92c610ca990ebc47c3

round-trip signData matches: true   (buildVnpayUrl signData == verifyVnpayCallback signData)
verify valid: true                  (HMAC of parsed URL query == returned vnp_SecureHash)
space encoded as %20: true | no + present: true
```

The signed bytes are byte-identical to the query string appended to the URL, so a
callback re-signed from the parsed query reproduces the same hash. Spaces are
`%20`, keys sorted, no `+`.

## Encoding Convention Note

VNPay's official 2.1.0 sample encodes spaces as `+`
(`encodeURIComponent(v).replace(/%20/g,'+')`). This implementation deliberately
keeps `%20` (per contract) and the FE sends a space-free `order_info`
(`DatXe Booking <id8>, <k> VND` → only spaces, which encode to `%20`). Because sign
and URL use the identical encoder, VNPay's server-side re-sign will match
regardless of `+` vs `%20`, as long as VNPay decodes `%20` back to a space (it
does). If a future signed value needs `+` compatibility, flip `encodeVnp` to the
`+` convention — it's the single source of truth for both paths.

## Notes for Evaluation

Commands run:

- `cd app_user && npx tsc --noEmit` → exit 0
- `cd app_user && bun lint` → 0 errors, 4 pre-existing warnings (SearchDestinationScreen, authService, clearCache — none in changed files)
- `cd nestjs_prisma && bun run build` → exit 0
- `cd nestjs_prisma && bun test` (jest) → NOT run: `package.json` has `"test": "jest"` but there are zero `*.spec.ts` files, so nothing to execute. Signing verified via the fixed-sample node script above instead.
- Grep: `sandbox.vnpayment.vn` in `app_user/**` → none. `.env.example` VNPAY secrets → placeholders only.

Manual VNPay sandbox verification steps (MANUAL_PENDING — needs user-supplied credentials):

1. Register sandbox merchant at https://sandbox.vnpayment.vn/devreg → get `VNPAY_TMN_CODE` + `VNPAY_HASH_SECRET`.
2. Put them in `nestjs_prisma/.env` (local, uncommitted). Set `VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` and `VNPAY_RETURN_URL` to a host VNPay can reach (LAN IP for device access; ngrok/tunnel if VNPay must POST the callback). App_user `baseUrl` is `http://192.168.1.20:3000/api/v1`, so match the LAN IP.
3. Start backend + app_user dev build. Create a booking, tap pay.
4. Expect the opened URL to start with `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...` and render the VNPay card form (not `Invalid data format`).
5. Pay with a VNPay sandbox test card. Backend callback sets `Payment.status=SUCCESSFUL`, `Booking.status=PAYMENT_COMPLETED`, emits `booking.payment_success`.
6. App transitions to `LOOKING` (radar) after WS event or the `GET /payments/:bookingId` poll returns `SUCCESSFUL`. Cancelling/closing without paying resets to the booking screen with a Vietnamese error.

Known limitations (in scope, documented, not fixed):

- `bookingService.createBooking` still returns a `__DEV__` mock. In a `__DEV__` build the booking id is fake, so a real backend payment record won't exist and the poll will fall through to the error path unless a WS mock fires. To test the real VNPay flow, run a non-dev build or temporarily disable that mock. Removing it is out of scope (contract).
- `useBookingSocket.runDevMock` untouched (T-0072 territory). In dev with no live socket it auto-fires `payment_success` after 3s, which will drive `LOOKING` even without real payment — expected dev behavior, not a production path.
- `WebBrowser.openBrowserAsync` (not `openAuthSessionAsync`) + no deep-link scheme: the app can't auto-detect the VNPay redirect, so it relies on the user closing the browser then WS/poll confirmation. Switching to an auth session / deep link is an explicitly out-of-scope UX decision.

## Status

Implemented
