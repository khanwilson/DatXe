# T-0068.1 Plan — BE: Trip Cancellation, Retry & Cashback

**Phase**: Planning  
**Model**: Sonnet  
**Created**: 2026-07-08  
**Depends on**: T-0062 (Payment), T-0063 (Dispatch), T-0068 (Trip lifecycle)

---

## Goal

Bổ sung các trạng thái hủy, cashback, retry cho flow booking:

1. **DRIVER_EN_ROUTE** — Trip status khi driver accept (fix T-0068)
2. **User hủy** → cashback về VNPay ngay
3. **Driver hủy** → chờ user quyết định (retry hoặc hủy)
4. **Không tìm thấy tài xế** → chờ user quyết định (retry hoặc hủy)
5. **Retry logic** — reset LOOKING_DRIVER, tối đa 3 lần, 30s timeout tự hủy

---

## Current State

### Đã có (T-0068)
- Trip lifecycle: driver-arrived → start → complete
- WebSocket events: `driver.location_updated`, `trip.status_changed`
- `GET /drivers/:id/location`

### Chưa có
- Trip status `DRIVER_EN_ROUTE` khi driver accept (hiện tại tạo Trip với status `CREATED`)
- Cancel endpoints (user cancel, driver cancel)
- Retry dispatch endpoint
- Refund/cashback logic
- Trạng thái `CANCELLED_BY_USER`, `CANCELLED_BY_DRIVER`, `AWAITING_USER_DECISION`
- 30s timeout cho user decision
- `retry_count` tracking trên Booking

---

## Proposed Approach

### Step 1: Prisma Migration

Thêm vào `BookingStatus` enum:
```prisma
CANCELLED_BY_USER          // User hủy → cashback ngay
CANCELLED_BY_DRIVER        // Driver hủy → chờ user quyết định
AWAITING_USER_DECISION     // Không tìm thấy driver / driver hủy → chờ user
```

Thêm field vào `Booking`:
```prisma
retry_count  Int  @default(0)  // số lần user đã retry
```

### Step 2: Fix T-0068 — DRIVER_EN_ROUTE

Trong `dispatch.service.ts`, khi driver accept:
```typescript
// Trip tạo với status DRIVER_EN_ROUTE thay vì CREATED
const trip = await this.prisma.trip.create({
  data: {
    status: 'DRIVER_EN_ROUTE',  // ← thay vì 'CREATED'
    ...
  },
});

// Booking status cũng chuyển sang DRIVER_ARRIVING (đã có trong enum)
await this.prisma.booking.update({
  data: { status: BookingStatus.DRIVER_ARRIVING, driver_id: driver.id },
});
```

### Step 3: Booking Cancel/Retry Module

Files mới:
```
nestjs_prisma/api/modules/booking/booking-cancel.controller.ts  (new)
nestjs_prisma/api/modules/booking/booking-cancel.service.ts     (new)
```

Endpoints:

**POST /api/v1/bookings/:id/cancel** — User hủy
- Auth: JWT customer (owner)
- Chỉ cancel được khi status IN [LOOKING_DRIVER, DRIVER_ARRIVING, AWAITING_USER_DECISION]
- Nếu đã thanh toán → gọi refund VNPay
- Booking.status = `CANCELLED_BY_USER`
- Payment.status = `REFUNDED`
- Emit `booking.cancelled` WS

**POST /api/v1/trips/:id/cancel** — Driver hủy
- Auth: JWT driver (owner)
- Chỉ cancel được khi Trip.status IN [DRIVER_EN_ROUTE]
- Trip.status = `CANCELLED`
- Booking.status = `CANCELLED_BY_DRIVER`
- Emit `booking.driver_cancelled` WS → app_user hiện dialog "Tài xế đã hủy. Bạn có muốn tìm tài xế khác?"

**POST /api/v1/bookings/:id/retry** — User chọn tiếp tục chờ
- Auth: JWT customer (owner)
- Chỉ retry được khi status IN [AWAITING_USER_DECISION, CANCELLED_BY_DRIVER]
- Check `retry_count < 3`
- Increment `retry_count`
- Reset Booking.status = `LOOKING_DRIVER`
- Emit `payment.success` event → re-trigger dispatch loop

### Step 4: Payment Refund

Thêm `refundPayment()` vào `payment.service.ts`:
```typescript
async refundPayment(bookingId: string): Promise<void> {
  // 1. Find payment by bookingId
  // 2. Check status = SUCCESSFUL
  // 3. Call VNPay refund API (sandbox)
  // 4. Update Payment.status = REFUNDED
  // 5. Emit booking.refunded WS event
}
```

VNPay refund: gọi API `https://sandbox.vnpayment.vn/merchant-webapi/merchant.html` với `vnp_Command=refund`. Response kiểm tra `vnp_ResponseCode=00`.

### Step 5: 30s Timeout (AWAITING_USER_DECISION)

Trong `dispatch.service.ts`, sau khi hết 3 vòng dispatch:
```typescript
// Thay vì set NO_DRIVER ngay, set AWAITING_USER_DECISION
await this.prisma.booking.update({
  data: { status: BookingStatus.AWAITING_USER_DECISION },
});

// Emit WS cho app_user
this.gateway.emitBookingAwaitingDecision(bookingId);

// Set 30s timeout
setTimeout(async () => {
  const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
  if (booking?.status === BookingStatus.AWAITING_USER_DECISION) {
    // User không bấm gì → tự hủy, cashback
    await this.cancelWithRefund(bookingId, 'AUTO_TIMEOUT');
  }
}, 30_000);
```

### Step 6: WebSocket Events mới

| Event | Room | Payload | Trigger |
|-------|------|---------|---------|
| `booking.cancelled` | `booking:{id}` | `{ bookingId, reason, refundStatus }` | User/driver cancel |
| `booking.driver_cancelled` | `booking:{id}` | `{ bookingId, driverId, reason }` | Driver cancel |
| `booking.awaiting_decision` | `booking:{id}` | `{ bookingId, retryCount, maxRetries, timeoutMs }` | No driver found / driver cancel |
| `booking.refunded` | `booking:{id}` | `{ bookingId, amount, refundStatus }` | Refund completed |

---

## Files To Create

```
nestjs_prisma/api/modules/booking/booking-cancel.controller.ts  (new)
nestjs_prisma/api/modules/booking/booking-cancel.service.ts     (new)
nestjs_prisma/prisma/migrations/20260708020000_cancel_retry/migration.sql  (new)
```

## Files To Modify

```
nestjs_prisma/prisma/schema.prisma                                    (enum + field)
nestjs_prisma/api/modules/dispatch/dispatch.service.ts                (DRIVER_EN_ROUTE fix + AWAITING_USER_DECISION + timeout)
nestjs_prisma/api/modules/payment/payment.service.ts                  (refundPayment method)
nestjs_prisma/api/modules/booking/booking.module.ts                   (import cancel controller/service)
nestjs_prisma/api/common/websocket/websocket.gateway.ts               (new emit methods)
```

---

## API Contracts

### POST /api/v1/bookings/:id/cancel
**Auth**: JWT customer (owner)  
**Response 200**:
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "CANCELLED_BY_USER",
    "refundStatus": "REFUNDED" | "NO_REFUND_NEEDED"
  }
}
```

### POST /api/v1/trips/:id/cancel
**Auth**: JWT driver (owner)  
**Response 200**:
```json
{
  "success": true,
  "data": {
    "tripId": "uuid",
    "status": "CANCELLED",
    "bookingStatus": "CANCELLED_BY_DRIVER"
  }
}
```

### POST /api/v1/bookings/:id/retry
**Auth**: JWT customer (owner)  
**Response 200**:
```json
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "LOOKING_DRIVER",
    "retryCount": 1
  }
}
```
**Response 400** (quá 3 lần):
```json
{
  "success": false,
  "error": "MAX_RETRIES_EXCEEDED"
}
```

---

## State Machine (đầy đủ)

```
PAYMENT_COMPLETED
  │
  ▼
LOOKING_DRIVER (dispatch loop)
  │
  ├─ Driver accept ──────────────────────────────────┐
  │                                                   ▼
  │                                        DRIVER_ARRIVING (Trip: DRIVER_EN_ROUTE)
  │                                                   │
  │                                                   ├─ Driver đến đón
  │                                                   │   ▼
  │                                                   │ DRIVER_ARRIVED
  │                                                   │   │
  │                                                   │   ├─ Driver bấm bắt đầu
  │                                                   │   │   ▼
  │                                                   │   │ IN_PROGRESS
  │                                                   │   │   │
  │                                                   │   │   ├─ Driver bấm hoàn thành
  │                                                   │   │   │   ▼
  │                                                   │   │   │ COMPLETED ✓
  │                                                   │   │   │
  │                                                   │   │   └─ Driver hủy
  │                                                   │   │       ▼
  │                                                   │   │   CANCELLED_BY_DRIVER
  │                                                   │   │       │
  │                                                   │   │       ▼
  │                                                   │   │  AWAITING_USER_DECISION
  │                                                   │   │  (retry hoặc cancel)
  │                                                   │   │
  │                                                   │   └─ User hủy trước khi driver đến
  │                                                   │       ▼
  │                                                   │   CANCELLED_BY_USER (cashback)
  │                                                   │
  ├─ Hết 3 vòng, không tìm thấy                      │
  │   ▼                                               │
  │   AWAITING_USER_DECISION                          │
  │   │                                               │
  │   ├─ User bấm "Tiếp tục chờ" (retry_count < 3)    │
  │   │   ▼                                           │
  │   │   LOOKING_DRIVER (retry)                      │
  │   │                                               │
  │   ├─ User bấm "Hủy"                               │
  │   │   ▼                                           │
  │   │   CANCELLED_BY_USER (cashback)                │
  │   │                                               │
  │   └─ 30s timeout (không bấm gì)                   │
  │       ▼                                           │
  │       CANCELLED_BY_USER (auto cashback)           │
  │                                                   │
  └─ User hủy khi đang tìm driver ◄──────────────────┘
      ▼
      CANCELLED_BY_USER (cashback)
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| VNPay refund API sandbox không ổn định | Medium | Medium | Mock refund trong DEV mode |
| setTimeout không reliable (server restart) | Low | Low | Acceptable MVP, production sẽ dùng Bull/BullMQ job queue |
| Race condition: user cancel + driver accept cùng lúc | Low | High | Check booking status trước khi cancel, throw ConflictException nếu đã ACCEPTED |
| Prisma migration break existing data | Very Low | Low | Enum addition only, no data loss |

---

## Acceptance Criteria

- [ ] Driver accept → Trip.status = DRIVER_EN_ROUTE, Booking.status = DRIVER_ARRIVING
- [ ] User cancel (LOOKING_DRIVER/DRIVER_ARRIVING) → CANCELLED_BY_USER + refund VNPay
- [ ] Driver cancel (DRIVER_EN_ROUTE) → CANCELLED_BY_DRIVER + emit WS
- [ ] No driver found → AWAITING_USER_DECISION + emit WS
- [ ] User retry → reset LOOKING_DRIVER, retry_count++, re-dispatch
- [ ] User retry quá 3 lần → 400 error
- [ ] 30s timeout → auto CANCELLED_BY_USER + refund
- [ ] `bun run typecheck` pass
- [ ] `bun run lint` pass

---

## Out of Scope

- Frontend changes (app_user, app_taixe)
- Push notification cho cancel/retry
- Admin dashboard cho refund tracking
- Partial refund (chỉ full refund)
- Cash payment refund (chỉ VNPay)

---

## Model Routing

- Planning: Sonnet ✓
- Implementing: Opus (per harness rule)
- Evaluating/Reviewing: Sonnet
- Closing: Haiku
