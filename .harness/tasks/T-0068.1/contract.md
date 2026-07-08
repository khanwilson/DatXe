# T-0068.1 Contract — BE: Trip Cancellation, Retry & Cashback

**Phase**: Contracting  
**Model**: Sonnet  
**Created**: 2026-07-08  
**Depends on**: T-0062, T-0063, T-0068

---

## Scope

### In Scope

#### 1. Prisma Migration
- Thêm 3 giá trị vào `BookingStatus` enum: `CANCELLED_BY_USER`, `CANCELLED_BY_DRIVER`, `AWAITING_USER_DECISION`
- Thêm field `retry_count Int @default(0)` vào `Booking` model

#### 2. Fix DRIVER_EN_ROUTE (dispatch.service.ts)
- Khi driver accept → Trip.status = `DRIVER_EN_ROUTE` (thay vì `CREATED`)
- Booking.status = `DRIVER_ARRIVING` (thay vì `ACCEPTED`)

#### 3. Booking Cancel/Retry (new files)
- `booking-cancel.controller.ts` — 3 endpoints
- `booking-cancel.service.ts` — cancel + refund + retry logic

#### 4. Payment Refund (payment.service.ts)
- Thêm `refundPayment(bookingId)` — gọi VNPay refund API, update Payment.status = REFUNDED
- DEV mock: nếu không có VNPay credentials → mock refund success

#### 5. 30s Timeout (dispatch.service.ts)
- Sau khi hết 3 vòng dispatch → `AWAITING_USER_DECISION` (thay vì `NO_DRIVER`)
- `setTimeout` 30s → nếu user không bấm gì → auto cancel + refund

#### 6. WebSocket Events mới (websocket.gateway.ts)
- `emitBookingCancelled(bookingId, reason, refundStatus)`
- `emitBookingDriverCancelled(bookingId, driverId)`
- `emitBookingAwaitingDecision(bookingId, retryCount, maxRetries, timeoutMs)`
- `emitBookingRefunded(bookingId, amount)`

#### 7. Booking Module Update
- Import BookingCancelController + BookingCancelService

---

### Out of Scope
- Frontend changes (app_user, app_taixe)
- Push notification
- Admin dashboard
- Partial refund
- Cash payment refund
- Bull/BullMQ job queue (dùng setTimeout cho MVP)

---

## Allowed Files

```
nestjs_prisma/prisma/schema.prisma
nestjs_prisma/prisma/migrations/20260708020000_cancel_retry/migration.sql  (new)
nestjs_prisma/api/modules/dispatch/dispatch.service.ts
nestjs_prisma/api/modules/payment/payment.service.ts
nestjs_prisma/api/modules/booking/booking.module.ts
nestjs_prisma/api/modules/booking/booking-cancel.controller.ts             (new)
nestjs_prisma/api/modules/booking/booking-cancel.service.ts                (new)
nestjs_prisma/api/common/websocket/websocket.gateway.ts
.harness/tasks/T-0068.1/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
```

---

## API Contracts

### POST /api/v1/bookings/:id/cancel
**Auth**: JWT customer (owner)  
**Valid states**: LOOKING_DRIVER, DRIVER_ARRIVING, AWAITING_USER_DECISION  
**Response 200**:
```json
{
  "success": true,
  "data": { "bookingId": "uuid", "status": "CANCELLED_BY_USER", "refundStatus": "REFUNDED" }
}
```
**Side effects**: Booking.status = CANCELLED_BY_USER, Payment.status = REFUNDED, emit `booking.cancelled`

### POST /api/v1/trips/:id/cancel
**Auth**: JWT driver (owner)  
**Valid states**: Trip.status IN [DRIVER_EN_ROUTE]  
**Response 200**:
```json
{
  "success": true,
  "data": { "tripId": "uuid", "status": "CANCELLED", "bookingStatus": "CANCELLED_BY_DRIVER" }
}
```
**Side effects**: Trip.status = CANCELLED, Booking.status = CANCELLED_BY_DRIVER, emit `booking.driver_cancelled`

### POST /api/v1/bookings/:id/retry
**Auth**: JWT customer (owner)  
**Valid states**: AWAITING_USER_DECISION, CANCELLED_BY_DRIVER  
**Constraint**: retry_count < 3  
**Response 200**:
```json
{
  "success": true,
  "data": { "bookingId": "uuid", "status": "LOOKING_DRIVER", "retryCount": 1 }
}
```
**Response 400** (quá 3 lần):
```json
{ "success": false, "error": "MAX_RETRIES_EXCEEDED" }
```
**Side effects**: retry_count++, Booking.status = LOOKING_DRIVER, emit `payment.success` event → re-dispatch

---

## WebSocket Events

| Event | Room | Payload |
|-------|------|---------|
| `booking.cancelled` | `booking:{id}` | `{ bookingId, reason, refundStatus }` |
| `booking.driver_cancelled` | `booking:{id}` | `{ bookingId, driverId }` |
| `booking.awaiting_decision` | `booking:{id}` | `{ bookingId, retryCount, maxRetries: 3, timeoutMs: 30000 }` |
| `booking.refunded` | `booking:{id}` | `{ bookingId, amount, refundStatus }` |

---

## Acceptance Criteria

- [ ] Driver accept → Trip.status = DRIVER_EN_ROUTE, Booking.status = DRIVER_ARRIVING
- [ ] User cancel (LOOKING_DRIVER/DRIVER_ARRIVING/AWAITING_USER_DECISION) → CANCELLED_BY_USER + refund
- [ ] Driver cancel (DRIVER_EN_ROUTE) → CANCELLED_BY_DRIVER + emit WS
- [ ] No driver found (3 vòng) → AWAITING_USER_DECISION + emit WS
- [ ] User retry → reset LOOKING_DRIVER, retry_count++, re-dispatch
- [ ] User retry quá 3 lần → 400 MAX_RETRIES_EXCEEDED
- [ ] 30s timeout → auto CANCELLED_BY_USER + refund
- [ ] DEV mock refund hoạt động không cần VNPay credentials
- [ ] `npx tsc --noEmit` pass
- [ ] `npx eslint "api/**/*.ts"` pass

---

## Implementation Constraints

- Follow pattern đã có: BookingService, PaymentService, JwtAuthGuard, CurrentUser
- Response format: `{ success: true, data: {...} }`
- Dùng `@UseGuards(JwtAuthGuard)` cho tất cả endpoints
- Verify ownership: booking.customer_id === user.sub hoặc trip.driver_id === user.sub
- DEV mock: nếu VNPay credentials không có → mock refund success
- Không thêm dependency ngoài
