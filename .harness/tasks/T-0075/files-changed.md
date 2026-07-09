# Files Changed: T-0075

## Source files

| File | Description |
|---|---|
| `app_user/src/api/axios/config.ts` | Changed `ENDPOINTS.PAYMENT.VNPAY_CREATE_URL` from `/payments/vnpay/create-payment-url` to `/payments/vnpay` to match the backend controller route. |
| `app_user/src/api/services/paymentService.ts` | Removed `mockCreateVnpayUrl` and the `__DEV__` hardcoded-URL fallback. Added `CreateVnpayUrlParams` type. `createVnpayUrl(params)` now POSTs `{ booking_id, amount, order_info, client_ip }` and returns `{ payment_id, transaction_id, payment_url }`. |
| `app_user/src/api/hooks/useBooking.ts` | `useCreateVnpayUrl` mutation now takes `CreateVnpayUrlParams` instead of a bare `bookingId` string. |
| `app_user/app/BookingRouteScreen.tsx` | Pass real fare as `amount`; build URL-safe `order_info`; `CLIENT_IP_FALLBACK`; open real `payment_url`; added `pollPaymentSuccess` helper + `wsConfirmedPaidRef`; subscribe WS during `PAYMENT`; transition to `LOOKING` only on confirmed payment; Vietnamese error + UI reset on fail/cancel. |
| `nestjs_prisma/api/modules/payment/utils/vnpay.util.ts` | Replaced dual `querystring.stringify` encoding with a single deterministic `buildSignData` (`encodeVnp` RFC3986, `%20`, sorted). `buildVnpayUrl` returns the exact signed string + `vnp_SecureHash`; `verifyVnpayCallback` re-signs with the same encoder. Dropped `querystring` import. |
| `nestjs_prisma/.env.example` | Updated `VNPAY_URL` to sandbox vpcpay endpoint, `VNPAY_RETURN_URL` to `<LAN_OR_TUNNEL_HOST>` placeholder, added sandbox setup guidance comment. Secrets remain placeholders. |

## Task artifacts

| File | Description |
|---|---|
| `.harness/tasks/T-0075/implementation.md` | Implementation summary, signing verification result, manual test steps, known limitations. |
| `.harness/tasks/T-0075/files-changed.md` | This file. |
| `.harness/tasks/T-0075/decisions.md` | Implementation decisions. |
| `.harness/tasks/T-0075/status.md` | Phase → Evaluating. |

## Temporary files

- `nestjs_prisma/vnpcheck.mjs` — created to verify signing, then deleted. Not committed.
