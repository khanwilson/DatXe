# T-0062 Handoff — BE: Booking + Payment + VNPay Module

**Status**: Done  
**Completed**: 2026-07-07  
**Model**: Opus (implementing)

---

## Summary

Implemented `BookingModule` and `PaymentModule` for nestjs_prisma. VNPay sandbox integration with HMAC-SHA512 signature is fully wired. Prisma migration applied for `VNPAY` enum value and `vehicle_type` field on `Booking`.

---

## Files Changed

### New Files
- `api/modules/booking/booking.controller.ts` — POST /bookings, GET /bookings/:id (JWT guarded)
- `api/modules/booking/booking.service.ts` — create + findById (ownership check)
- `api/modules/booking/booking.module.ts` — wires PrismaModule
- `api/modules/booking/dto/create-booking.dto.ts`
- `api/modules/booking/dto/booking-response.dto.ts`
- `api/modules/payment/payment.controller.ts` — POST /payments/vnpay, GET /payments/vnpay/callback, GET /payments/:bookingId
- `api/modules/payment/payment.service.ts` — createVnpayPayment (ownership check), handleVnpayCallback, getPaymentStatus
- `api/modules/payment/payment.module.ts` — wires ConfigModule, PrismaModule, WebSocketModule
- `api/modules/payment/dto/create-vnpay-payment.dto.ts`
- `api/modules/payment/dto/payment-response.dto.ts`
- `api/modules/payment/dto/vnpay-callback.dto.ts`
- `api/modules/payment/utils/vnpay.util.ts` — buildVnpayUrl, verifyVnpayCallback, formatVnpayDate
- `prisma/migrations/20260707000000_add_vnpay_payment_method/migration.sql`

### Modified Files
- `api/app.module.ts` — added BookingModule, PaymentModule
- `api/common/websocket/websocket.gateway.ts` — added `emitPaymentSuccess(bookingId, bookingStatus, paymentStatus)`
- `api/common/config/env.validation.ts` — added VNPAY_* optional vars
- `prisma/schema.prisma` — added `VNPAY` to PaymentMethod enum, `vehicle_type String?` to Booking
- `.env.example` — added VNPay section

---

## API Contracts

### POST /api/v1/bookings
**Auth**: JWT required  
**Request**:
```json
{
  "pickup_lat": 21.028511,
  "pickup_lng": 105.804817,
  "pickup_address": "Hoàn Kiếm, Hà Nội",
  "dropoff_lat": 21.005,
  "dropoff_lng": 105.845,
  "dropoff_address": "Cầu Giấy, Hà Nội",
  "vehicle_type": "xe4cho",
  "estimated_price": 45000,
  "note": ""
}
```
**Response**: `{ success: true, data: Booking }`

### POST /api/v1/payments/vnpay
**Auth**: JWT required  
**Request**:
```json
{
  "booking_id": "uuid",
  "amount": 45000,
  "order_info": "Thanh toán đặt xe",
  "client_ip": "127.0.0.1"
}
```
**Response**: `{ success: true, data: { payment_id, transaction_id, payment_url } }`

### GET /api/v1/payments/vnpay/callback
**Auth**: None (called by VNPay)  
**Query**: VNPay standard params (vnp_*)  
**Response**: `{ RspCode: "00", Message: "Confirm Success" }` on success

### GET /api/v1/payments/:bookingId
**Auth**: JWT required  
**Response**: `{ success: true, data: Payment }`

---

## WebSocket Events Emitted

### `booking.payment_success`
**Room**: `booking:{bookingId}`  
**Payload**: `{ bookingId, bookingStatus: "PAYMENT_COMPLETED", paymentStatus: "SUCCESSFUL" }`  
**Trigger**: VNPay callback confirmed, payment status = SUCCESSFUL

---

## Known Issues / Next Steps

- VNPay credentials placeholder — user must set `VNPAY_TMN_CODE` + `VNPAY_HASH_SECRET` in `.env` to test end-to-end
- `VNPAY_RETURN_URL` must be publicly accessible (use ngrok for local dev)
- `prisma migrate dev` must be run against a live DB before testing (migration SQL is committed)
- T-0063 (DispatchModule) depends on this task — listens to `booking.payment_success` WS event
- T-0064 (FE) depends on this task — calls `POST /bookings` + `POST /payments/vnpay` + listens to WS

---

## Decisions Made

- Authorization: `createVnpayPayment` verifies booking belongs to requesting user (customer_id match) — throws `ForbiddenException` if not owner
- WS payload: `emitPaymentSuccess` emits `{ bookingId, bookingStatus, paymentStatus }` per contract (not amount/paymentId)
- Enum usage: all Prisma enum values use typed imports from `@prisma/client` (not string literals)
- `Buffer` avoided in vnpay.util — `crypto.createHmac` accepts string directly, no Node.js `Buffer` needed
