# T-0062 Implementation

**Phase**: Done  
**Model**: Opus

---

## Changes Made

### Prisma Schema & Migration
- Added `VNPAY` to `PaymentMethod` enum
- Added `vehicle_type String?` to `Booking` model
- Migration: `20260707000000_add_vnpay_payment_method`
- Ran `prisma generate` to regenerate client

### New Files Created

| File | Purpose |
|------|---------|
| `api/modules/booking/booking.controller.ts` | POST /bookings, GET /bookings/:id |
| `api/modules/booking/booking.service.ts` | create(), findById() |
| `api/modules/booking/booking.module.ts` | NestJS module |
| `api/modules/booking/dto/create-booking.dto.ts` | CreateBookingDto |
| `api/modules/booking/dto/booking-response.dto.ts` | BookingResponseDto |
| `api/modules/payment/payment.controller.ts` | POST /payments/vnpay, GET /payments/vnpay/callback, GET /payments/:bookingId |
| `api/modules/payment/payment.service.ts` | createVnpayPayment(), handleVnpayCallback(), getPaymentStatus() |
| `api/modules/payment/payment.module.ts` | NestJS module |
| `api/modules/payment/dto/create-vnpay-payment.dto.ts` | CreateVnpayPaymentDto |
| `api/modules/payment/dto/payment-response.dto.ts` | PaymentResponseDto |
| `api/modules/payment/dto/vnpay-callback.dto.ts` | VnpayCallbackDto |
| `api/modules/payment/utils/vnpay.util.ts` | buildVnpayUrl(), verifyVnpayCallback(), formatVnpayDate() |

### Modified Files

| File | Change |
|------|--------|
| `api/app.module.ts` | Added BookingModule + PaymentModule imports |
| `api/common/websocket/websocket.gateway.ts` | Added emitPaymentSuccess() |
| `api/common/config/env.validation.ts` | Added VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL |
| `.env.example` | Added VNPay env vars section |
| `prisma/schema.prisma` | VNPAY enum + vehicle_type field |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/bookings` | JWT | Create booking |
| GET | `/api/v1/bookings/:id` | JWT | Get booking by ID |
| POST | `/api/v1/payments/vnpay` | JWT | Create VNPay payment URL |
| GET | `/api/v1/payments/vnpay/callback` | None | VNPay IPN callback |
| GET | `/api/v1/payments/:bookingId` | JWT | Get payment status |

---

## WebSocket Events

| Event | Room | Payload |
|-------|------|---------|
| `booking.payment_success` | `booking:{bookingId}` | `{ bookingId, paymentId, amount }` |

---

## VNPay Flow

1. Client calls `POST /payments/vnpay` with `booking_id`, `amount`, `order_info`, `client_ip`
2. Service creates `Payment` record (PENDING) and builds signed VNPay URL (HMAC-SHA512)
3. Client opens URL via `Linking.openURL`
4. After payment, VNPay calls `GET /payments/vnpay/callback?vnp_*`
5. Service verifies HMAC-SHA512 signature, updates Payment → SUCCESSFUL, Booking → PAYMENT_COMPLETED
6. Emits `booking.payment_success` via WebSocket
