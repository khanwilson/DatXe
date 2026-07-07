# T-0063 Contract — BE: Dispatch Module (Find Nearest Driver)

**Phase**: Contracting  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Depends on**: T-0062 (BookingModule, PaymentModule, emitPaymentSuccess WS event)

---

## Scope

### In Scope

1. **DispatchModule** (`api/modules/dispatch/`)
   - `DispatchService`: lắng nghe event nội bộ `booking.payment_success` (NestJS EventEmitter)
   - Khi nhận event: query `Driver` có `status = ONLINE`, tính khoảng cách Haversine tới pickup
   - Sắp xếp driver theo khoảng cách tăng dần, chọn driver gần nhất
   - Tạo `DispatchOffer` (status = PENDING, expired_at = now + 30s)
   - Emit WS event `driver.new_offer` tới room `driver:{driverId}`

2. **Tích hợp EventEmitter**
   - Dùng `@nestjs/event-emitter` package để phát/nhận event nội bộ
   - `PaymentService` emit event `payment.success` khi callback VNPay thành công
   - `DispatchService` lắng nghe `payment.success` qua `@OnEvent('payment.success')`

3. **WebSocket event mới**
   - Thêm `emitDriverNewOffer(driverId, data)` vào `websocket.gateway.ts`
   - Event name: `driver.new_offer`
   - Payload: `{ bookingId, pickupAddress, dropoffAddress, estimatedPrice, vehicleType }`
   - Gửi tới room `driver:{driverId}`

4. **Haversine distance calculation**
   - Tự implement Haversine formula (không dùng package ngoài)
   - Input: driver `(lat, lng)` + booking `(pickup_lat, pickup_lng)`
   - Output: khoảng cách km

5. **AppModule update**
   - Import `EventEmitterModule.forRoot()` và `DispatchModule`

---

## Out of Scope

- Offer timeout/retry queue (simplification: offer tạo ra nhưng không tự retry)
- Driver acceptance flow (T-0070)
- Trip creation (T-0010)
- Frontend changes — T-0064, T-0065
- `app_user`, `app_taixe` — KHÔNG chỉnh sửa
- Redis Geo (dùng Haversine đơn giản trước)
- Background job/queue (Bull/BullMQ)

---

## Allowed Files

```
nestjs_prisma/api/app.module.ts
nestjs_prisma/api/common/websocket/websocket.gateway.ts
nestjs_prisma/api/modules/dispatch/dispatch.module.ts      (new)
nestjs_prisma/api/modules/dispatch/dispatch.service.ts     (new)
nestjs_prisma/api/modules/dispatch/dispatch.listener.ts    (new)
nestjs_prisma/api/modules/payment/payment.service.ts       (update — emit EventEmitter event)
nestjs_prisma/package.json                                  (thêm @nestjs/event-emitter)
.harness/tasks/T-0063/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

---

## API Contracts

### WebSocket Event: driver.new_offer
**Room**: `driver:{driverId}`

**Payload**:
```json
{
  "bookingId": "uuid",
  "offerId": "uuid",
  "pickupAddress": "Hoàn Kiếm, Hà Nội",
  "dropoffAddress": "Ba Đình, Hà Nội",
  "estimatedPrice": 45000,
  "vehicleType": "xe4cho",
  "distanceKm": 1.2
}
```

### Internal Event: payment.success
**Emitted by**: `PaymentService.handleVnpayCallback()` khi `vnp_ResponseCode = 00`

**Payload**:
```typescript
{
  bookingId: string;
  customerId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: number;
  vehicleType: string | null;
}
```

---

## Database Impact

Chỉ đọc `Driver` table (query ONLINE drivers) và ghi `DispatchOffer` table.  
Không thay đổi Prisma schema — `DispatchOffer` model đã tồn tại.

---

## Acceptance Criteria

- [ ] Khi VNPay callback thành công, `DispatchService` nhận event `payment.success`
- [ ] Query driver ONLINE thành công (kể cả khi không có driver nào — không throw)
- [ ] Haversine distance tính đúng (test case: Hà Nội ≈ 0km từ Hà Nội)
- [ ] `DispatchOffer` được tạo với `status = PENDING`, `expired_at = now + 30s`
- [ ] WS event `driver.new_offer` được emit tới room `driver:{driverId}`
- [ ] Nếu không có driver ONLINE: log warning, không throw, không crash
- [ ] `bun run build` pass
- [ ] `bun run lint` pass
- [ ] Không có hard-coded values

---

## Test Strategy

- Build + lint (không có test framework)
- Manual review logic Haversine
- No driver case: verify graceful handling

---

## Implementation Constraints

- Dùng `@nestjs/event-emitter` (cài qua `bun add @nestjs/event-emitter`)
- `DispatchService` inject `PrismaService` + `WebSocketGateway`
- Không đọc `process.env` trực tiếp — dùng `ConfigService` nếu cần config
- Follow NestJS module pattern (xem `api/modules/booking/` làm reference)
- Response format không áp dụng (không có HTTP endpoint)
