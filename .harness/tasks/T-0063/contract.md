# T-0063 Contract — BE: Dispatch Module (Find Nearest Driver)

**Phase**: Contracting  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Updated**: 2026-07-07 (scope expanded per Wave T-0067 requirements)  
**Depends on**: T-0062 (BookingModule, PaymentModule, emitPaymentSuccess WS event)

---

## Scope

### In Scope

#### 1. Driver Location Update
- `PATCH /api/v1/drivers/location` — app_taixe gọi mỗi 30s khi đang ONLINE
  - Body: `{ lat: number, lng: number, heading?: number }`
  - Lưu vào `Driver.last_location` (Json field — thêm vào Prisma schema)
  - Auth: JWT driver role required
- Prisma schema: thêm `last_location Json?` vào `Driver` model

#### 2. DispatchModule — 3-round sweep logic
- `DispatchService` lắng nghe event nội bộ `payment.success` (NestJS EventEmitter)
- Khi nhận event → cập nhật `Booking.status = LOOKING_DRIVER` → bắt đầu dispatch loop

**Dispatch loop (3 vòng)**:
```
Vòng 1: radius = 5km,  timeout = 30s
Vòng 2: radius = 10km, timeout = 30s
Vòng 3: radius = 15km, timeout = 30s
Hết 3 vòng → emit booking.no_driver_found → Booking.status = NO_DRIVER
```

Mỗi vòng:
1. Query `Driver` có `status = ONLINE` và `last_location` không null
2. Tính Haversine distance từ driver location tới pickup
3. Filter drivers trong bán kính hiện tại, sort theo distance tăng dần
4. Lần lượt thử từng driver (skip drivers đã bị rejected trong booking này):
   - Tạo `DispatchOffer` (`status = PENDING`, `expires_at = now + 15s`)
   - Emit WS `driver.new_offer` tới room `driver:{driverId}`
   - Wait 15s:
     - Nếu driver accept → dừng loop, Booking.status = ACCEPTED
     - Nếu driver reject hoặc timeout → DispatchOffer.status = REJECTED/EXPIRED → thử driver tiếp
5. Nếu hết driver trong vòng → chuyển vòng tiếp (tăng bán kính)

**Offer acceptance** (nhận WS event từ app_taixe):
- Event: `driver.offer_response` từ room `driver:{driverId}`
- Payload: `{ offerId: string, accepted: boolean }`
- Nếu `accepted = true`:
  - `DispatchOffer.status = ACCEPTED`
  - `Booking.status = ACCEPTED`
  - Tạo `Trip` (status = CREATED)
  - Emit WS `booking.driver_assigned` tới room `booking:{bookingId}` (app_user nhận)
  - Emit WS `booking.driver_assigned` tới room `driver:{driverId}` (app_taixe nhận, confirm)
- Nếu `accepted = false`:
  - `DispatchOffer.status = REJECTED`
  - Tiếp tục loop (driver tiếp hoặc vòng tiếp)

#### 3. Prisma schema additions
```prisma
// Driver model — thêm field
model Driver {
  ...
  last_location Json?  // { lat: Float, lng: Float, heading: Float?, updated_at: String }
  ...
}

// BookingStatus enum — thêm values
enum BookingStatus {
  ...
  LOOKING_DRIVER   // NEW — đang tìm tài xế (sau payment success)
  DRIVER_ARRIVED   // NEW — tài xế đã đến nơi đón
  NO_DRIVER        // NEW — không tìm được tài xế sau 3 vòng
  ...
}
```

Migration: `bun prisma migrate dev --name dispatch_driver_location`

#### 4. WebSocket events

| Event | Direction | Room | Trigger |
|-------|-----------|------|---------|
| `driver.new_offer` | Server → app_taixe | `driver:{driverId}` | Dispatch chọn driver |
| `driver.offer_response` | app_taixe → Server | — | Driver accept/reject |
| `booking.driver_assigned` | Server → app_user + app_taixe | `booking:{bookingId}`, `driver:{driverId}` | Driver accepted |
| `booking.no_driver_found` | Server → app_user | `booking:{bookingId}` | Hết 3 vòng không tìm được |

**`driver.new_offer` payload**:
```json
{
  "offerId": "uuid",
  "bookingId": "uuid",
  "pickupAddress": "Hoàn Kiếm, Hà Nội",
  "dropoffAddress": "Ba Đình, Hà Nội",
  "estimatedPrice": 45000,
  "vehicleType": "xe4cho",
  "distanceKm": 1.2,
  "expiresAt": "2026-07-07T10:00:15Z"
}
```

**`booking.driver_assigned` payload**:
```json
{
  "bookingId": "uuid",
  "tripId": "uuid",
  "driver": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "vehicleType": "xe4cho",
    "vehiclePlate": "29A-12345",
    "rating": 4.8,
    "lat": 21.0285,
    "lng": 105.8542
  }
}
```

**`booking.no_driver_found` payload**:
```json
{
  "bookingId": "uuid",
  "message": "Không tìm được tài xế. Vui lòng thử lại."
}
```

#### 5. EventEmitter integration
- `@nestjs/event-emitter` (cài qua `bun add @nestjs/event-emitter`)
- `PaymentService` emit `payment.success` khi VNPay callback thành công
- `DispatchService` lắng nghe `@OnEvent('payment.success')`

#### 6. AppModule update
- Import `EventEmitterModule.forRoot()` và `DispatchModule`

---

## Out of Scope

- Driver acceptance flow UI (T-0070 app_taixe)
- Trip lifecycle sau khi accepted (T-0068: driver-arrived, start, complete)
- Frontend changes — T-0064, T-0071
- `app_user`, `app_taixe` — KHÔNG chỉnh sửa
- Redis Geo (dùng Haversine + Json field)
- Background job/queue (Bull/BullMQ) — dùng setTimeout + Promise
- Push notification (chỉ WS)
- Retry sau `booking.no_driver_found` (manual retry từ user)

---

## Allowed Files

```
nestjs_prisma/prisma/schema.prisma                              (thêm last_location, enum values)
nestjs_prisma/prisma/migrations/                                (migration file mới)
nestjs_prisma/api/app.module.ts
nestjs_prisma/api/common/websocket/websocket.gateway.ts
nestjs_prisma/api/modules/dispatch/dispatch.module.ts           (new)
nestjs_prisma/api/modules/dispatch/dispatch.service.ts          (new)
nestjs_prisma/api/modules/dispatch/dispatch.listener.ts         (new)
nestjs_prisma/api/modules/dispatch/dispatch.controller.ts       (new — PATCH /drivers/location)
nestjs_prisma/api/modules/dispatch/dto/                         (new DTOs)
nestjs_prisma/api/modules/payment/payment.service.ts            (update — emit EventEmitter event)
nestjs_prisma/package.json                                      (thêm @nestjs/event-emitter)
.harness/tasks/T-0063/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

---

## Acceptance Criteria

- [ ] `PATCH /api/v1/drivers/location` lưu được lat/lng vào `Driver.last_location`
- [ ] Khi VNPay callback thành công, `Booking.status` → `LOOKING_DRIVER`
- [ ] Dispatch loop chạy đúng 3 vòng với bán kính 5/10/15km
- [ ] Mỗi vòng query đúng drivers trong bán kính (Haversine)
- [ ] Offer được tạo với `expires_at = now + 15s`
- [ ] WS `driver.new_offer` emit tới đúng room `driver:{driverId}`
- [ ] Khi driver accept: Booking = ACCEPTED, Trip được tạo, WS `booking.driver_assigned` emit
- [ ] Khi driver reject: tiếp tục tìm driver tiếp trong vòng
- [ ] Offer timeout 15s: DispatchOffer.status = EXPIRED, tiếp tục tìm
- [ ] Hết 3 vòng không tìm được: WS `booking.no_driver_found` emit, Booking = NO_DRIVER
- [ ] Không có driver ONLINE: graceful (không throw, emit `no_driver_found`)
- [ ] Prisma migration chạy clean (`bun prisma migrate dev`)
- [ ] `bun run build` pass
- [ ] `bun run lint` pass

---

## Database Impact

- `Driver` table: thêm `last_location` Json field
- `DispatchOffer` table: đọc + ghi (PENDING → ACCEPTED/REJECTED/EXPIRED)
- `Booking` table: cập nhật status (LOOKING_DRIVER → ACCEPTED / NO_DRIVER)
- `Trip` table: tạo mới khi driver accepted (status = CREATED)
- Migration required: `dispatch_driver_location`

---

## Implementation Constraints

- Dùng `@nestjs/event-emitter` cho internal events
- Dispatch loop dùng `async/await` + `setTimeout` wrap trong Promise (không dùng Bull)
- Driver skip list: lưu `Set<driverId>` trong memory của dispatch session (không persist)
- `DispatchService` inject `PrismaService` + `WebSocketGateway` + `EventEmitter2`
- Không đọc `process.env` trực tiếp — dùng `ConfigService`
- Follow NestJS module pattern (xem `api/modules/booking/` làm reference)
- Haversine tự implement, không dùng package ngoài
