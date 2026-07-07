# T-0063 Handoff — BE: Dispatch Module (Find Nearest Driver)

**Status**: Done  
**Completed**: 2026-07-07  
**Model**: Opus (implementing)

---

## Summary

Implemented `DispatchModule` cho nestjs_prisma. Driver location update endpoint, 3-round Haversine dispatch loop triggered bởi NestJS EventEmitter, WebSocket notifications tới driver/user, và offer accept/reject flow qua WebSocket.

---

## Files Changed

### New Files
- `api/modules/dispatch/dispatch.module.ts`
- `api/modules/dispatch/dispatch.controller.ts` — PATCH /api/v1/drivers/location (JWT driver)
- `api/modules/dispatch/dispatch.service.ts` — updateDriverLocation + runDispatchLoop + resolveOffer
- `api/modules/dispatch/dispatch.listener.ts` — @OnEvent('payment.success') → runDispatchLoop
- `api/modules/dispatch/dto/update-driver-location.dto.ts`
- `prisma/migrations/20260707010000_dispatch_booking_status_enum/migration.sql`

### Modified Files
- `prisma/schema.prisma` — thêm LOOKING_DRIVER, NO_DRIVER, DRIVER_ARRIVED vào BookingStatus enum
- `api/app.module.ts` — import EventEmitterModule.forRoot() + DispatchModule
- `api/common/websocket/websocket.gateway.ts` — thêm emitDriverNewOffer, emitBookingDriverAssigned, emitBookingNoDriverFound, @SubscribeMessage('driver.offer_response'), registerDispatchService()
- `api/modules/payment/payment.service.ts` — inject EventEmitter2, emit 'payment.success' sau PAYMENT_COMPLETED
- `eslint.config.mjs` — thêm setTimeout/clearTimeout vào globals

---

## API Contracts

### PATCH /api/v1/drivers/location
**Auth**: JWT required (driver role)  
**Request**:
```json
{ "lat": 21.028511, "lng": 105.804817, "heading": 90 }
```
**Response**: `{ success: true }`  
**DB**: Cập nhật `Driver.current_location` (Json field đã có sẵn trong schema)

---

## WebSocket Events

| Event | Direction | Room | Trigger |
|-------|-----------|------|---------|
| `driver.new_offer` | Server → app_taixe | `driver:{driverId}` | Dispatch chọn driver |
| `driver.offer_response` | app_taixe → Server | — | Driver accept/reject |
| `booking.driver_assigned` | Server → cả hai | `booking:{bookingId}` + `driver:{driverId}` | Driver accepted |
| `booking.no_driver_found` | Server → app_user | `booking:{bookingId}` | Hết 3 vòng |

---

## Dispatch Logic

```
Vòng 1: radius=5km,  timeout=30s/vòng, offer timeout=15s/driver
Vòng 2: radius=10km, timeout=30s/vòng
Vòng 3: radius=15km, timeout=30s/vòng
```

- Haversine distance tự implement (không dùng package ngoài)
- `resolverMap = Map<offerId, resolver>` bridge WS event với dispatch loop Promise
- `DispatchService.registerDispatchService()` được gọi từ `onModuleInit` để tránh circular dependency với WebSocketModule (@Global)

---

## Known Issues / Next Steps

- Migration `dispatch_booking_status_enum` cần chạy `bun prisma migrate dev` khi DB available
- Dispatch loop không có concurrency lock — nếu 2 payment.success cùng lúc, 2 loop chạy song song (acceptable MVP, T-0068 có thể thêm lock)
- `DRIVER_ARRIVED` enum value được thêm vào BookingStatus (contract request) nhưng chưa có endpoint sử dụng — T-0068 sẽ wire
- T-0068 (Driver Location & Dispatch Enhancement) phụ thuộc task này — adds real-time GPS streaming và trip lifecycle
- T-0069/T-0070 (app_taixe) phụ thuộc task này — UI nhận offer + respond

---

## Decisions Made

- Dùng `current_location` (đã có trong schema) thay vì thêm `last_location` mới — tránh duplicate field, không cần migration riêng cho field này
- Circular dependency giữa WebSocketModule (@Global) và DispatchModule tránh bằng cách inject `DispatchService` vào gateway qua `registerDispatchService()` thay vì NestJS DI
- `@nestjs/event-emitter ^2.1.1` (không phải ^10.0.0 như plan ban đầu) — package.json đã có đúng version
- `eslint.config.mjs` thêm `setTimeout`/`clearTimeout` vào globals thay vì dùng `global.setTimeout` — cleaner approach cho Node.js environment
