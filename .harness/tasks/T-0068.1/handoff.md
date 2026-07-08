# T-0068.1 Handoff

**Task**: BE: Trip Cancellation, Retry & Cashback  
**Status**: Done  
**Date**: 2026-07-08  
**Depends on**: T-0062, T-0063, T-0068

---

## Summary

Implemented booking cancellation, retry, and cashback logic for the trip lifecycle:

1. **User cancel** — `POST /api/v1/bookings/:id/cancel` — cancels booking + refunds VNPay
2. **Driver cancel** — `POST /api/v1/trips/:id/cancel` — cancels trip → AWAITING_USER_DECISION
3. **User retry** — `POST /api/v1/bookings/:id/retry` — resets to LOOKING_DRIVER, re-dispatches
4. **30s auto-cancel** — if user doesn't act after driver cancel or no driver found → auto cancel + refund
5. **DRIVER_EN_ROUTE fix** — Trip created with `DRIVER_EN_ROUTE` status when driver accepts

---

## Files Changed

### New Files
```
nestjs_prisma/api/modules/booking/booking-cancel.controller.ts
nestjs_prisma/api/modules/booking/booking-cancel.service.ts
```

### Modified Files
```
nestjs_prisma/prisma/schema.prisma                                    (enum values + retry_count field)
nestjs_prisma/prisma/migrations/20260708020000_cancel_retry/migration.sql (already existed)
nestjs_prisma/api/modules/dispatch/dispatch.service.ts                (AWAITING_USER_DECISION + event)
nestjs_prisma/api/modules/dispatch/dispatch.listener.ts               (booking.retry handler)
nestjs_prisma/api/modules/payment/payment.service.ts                  (refundPayment method)
nestjs_prisma/api/modules/booking/booking.module.ts                   (register new controller/service)
nestjs_prisma/api/modules/trip/trip.controller.ts                     (POST /:id/cancel endpoint)
nestjs_prisma/api/modules/trip/trip.service.ts                        (cancelByDriver method)
nestjs_prisma/api/common/websocket/websocket.gateway.ts               (new emit methods, already existed)
```

---

## API Contracts

### POST /api/v1/bookings/:id/cancel
**Auth**: JWT customer (owner)  
**Valid states**: LOOKING_DRIVER, DRIVER_ARRIVING, AWAITING_USER_DECISION  
**Response 200**:
```json
{ "success": true, "data": { "bookingId": "uuid", "status": "CANCELLED_BY_USER", "refundStatus": "REFUNDED" } }
```

### POST /api/v1/trips/:id/cancel
**Auth**: JWT driver (owner)  
**Valid states**: Trip.status = DRIVER_EN_ROUTE  
**Response 200**:
```json
{ "success": true, "data": { "tripId": "uuid", "status": "CANCELLED", "bookingStatus": "CANCELLED_BY_DRIVER" } }
```

### POST /api/v1/bookings/:id/retry
**Auth**: JWT customer (owner)  
**Valid states**: AWAITING_USER_DECISION, CANCELLED_BY_DRIVER  
**Constraint**: retry_count < 3  
**Response 200**:
```json
{ "success": true, "data": { "bookingId": "uuid", "status": "LOOKING_DRIVER", "retryCount": 1 } }
```
**Response 400** (quá 3 lần): `{ "success": false, "error": "MAX_RETRIES_EXCEEDED" }`

---

## WebSocket Events

| Event | Room | Payload |
|-------|------|---------|
| `booking.cancelled` | `booking:{id}` | `{ bookingId, reason, refundStatus }` |
| `booking.driver_cancelled` | `booking:{id}` | `{ bookingId, driverId }` |
| `booking.awaiting_decision` | `booking:{id}` | `{ bookingId, retryCount, maxRetries: 3, timeoutMs: 30000 }` |
| `booking.refunded` | `booking:{id}` | `{ bookingId, amount, refundStatus }` |

---

## Internal Events (EventEmitter2)

| Event | Payload | Producer | Consumer |
|-------|---------|----------|----------|
| `dispatch.exhausted` | `{ bookingId }` | DispatchService | BookingCancelService |
| `trip.driver_cancelled` | `{ bookingId }` | TripService | BookingCancelService |
| `booking.retry` | `{ bookingId }` | BookingCancelService | DispatchListener |

---

## Commands Run

```bash
npx tsc --noEmit    # ✅ PASS
npx eslint "api/**/*.ts"  # ✅ PASS
```

---

## Prisma Changes

### Enum additions to `BookingStatus`:
- `CANCELLED_BY_USER`
- `CANCELLED_BY_DRIVER`
- `AWAITING_USER_DECISION`

### Field added to `Booking`:
- `retry_count Int @default(0)`

Migration: `20260708020000_cancel_retry/migration.sql`

---

## Known Issues

1. **setTimeout not reliable** — server restart loses pending timeouts. Production should use Bull/BullMQ.
2. **No automated tests** — integration tests should be added before production.
3. **VNPay refund is mocked** — real VNPay refund API integration not yet implemented (sandbox credentials needed).

---

## Next Steps

1. Frontend implementation (app_user): cancel/retry UI, awaiting decision dialog
2. Frontend implementation (app_taixe): driver cancel trip button
3. Add integration tests
4. Replace setTimeout with Bull/BullMQ for production
5. Implement real VNPay refund API call
6. Push notification for cancel/retry events
