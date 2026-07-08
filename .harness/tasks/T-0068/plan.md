# T-0068 Plan — BE: Driver Location & Dispatch Enhancement

**Phase**: Planning  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Depends on**: T-0062 (BookingModule + PaymentModule), T-0063 (DispatchModule cơ bản)

---

## Goal

Nâng cấp backend để hỗ trợ toàn bộ trip lifecycle từ sau khi tài xế nhận cuốc đến khi hoàn thành chuyến:

1. Driver location broadcast — relay GPS từ app_taixe đến app_user qua WS
2. Trip lifecycle endpoints — driver-arrived, start, complete
3. Prisma schema additions — `Driver.last_location`, `DispatchOffer.expires_at`
4. WebSocket events mới — `driver.location_updated`, `trip.status_changed`
5. Driver location query endpoint cho app_user

---

## Current State

### Đã có (T-0063)
- `PATCH /api/v1/drivers/location` — cập nhật `Driver.current_location` (Json field)
- `DispatchService.runDispatchLoop` — 3 vòng quét Haversine, offer 15s, tạo Trip khi accept
- `DispatchService.resolveOffer` — bridge WS → dispatch Promise
- `gateway.emitDriverNewOffer`, `emitBookingDriverAssigned`, `emitBookingNoDriverFound`
- Prisma: `BookingStatus.LOOKING_DRIVER`, `NO_DRIVER`, `DRIVER_ARRIVED` (enum có sẵn)
- `TripStatus`: CREATED, DRIVER_EN_ROUTE, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED

### Chưa có
- `Driver.last_location` field (distinct từ `current_location`)
- `DispatchOffer.expires_at` field (có `expired_at` nhưng thiếu index/usage chuẩn)
- `driver.location_updated` WS event relay đến booking room
- `GET /api/v1/drivers/:id/location` — query vị trí tài xế
- Trip lifecycle endpoints: `/trips/:id/driver-arrived`, `/trips/:id/start`, `/trips/:id/complete`
- `trip.status_changed` WS event
- TripModule (chưa có module riêng)
- DriverModule (chưa có module riêng — hiện dispatch controller handle location)

---

## Proposed Approach

### Schema Changes (minimal — không thêm field trùng lặp)

Sau khi review schema, `current_location` đã đủ cho location tracking. Không cần thêm `last_location` (duplicate). `DispatchOffer.expired_at` đã có. Plan gốc T-0067 muốn thêm `expires_at` nhưng field này đã tồn tại dưới tên `expired_at` — không rename để tránh migration phức tạp.

**Migration cần thiết**: Không có schema migration mới cần thiết.

**Lý do**: 
- `Driver.current_location` (Json?) đã có, đã dùng, đủ cho broadcast
- `DispatchOffer.expired_at` đã có
- `BookingStatus.LOOKING_DRIVER`, `NO_DRIVER`, `DRIVER_ARRIVED` đã có trong enum
- `TripStatus.DRIVER_EN_ROUTE`, `DRIVER_ARRIVED`, `IN_PROGRESS`, `COMPLETED` đã có

### Module Structure

Tạo `TripModule` mới với trip lifecycle endpoints. Driver location endpoint đã có trong `DispatchController` — chỉ cần thêm location broadcast và GET endpoint vào đó (không tách DriverModule riêng để tránh churn).

### Implementation Steps

#### Step 1: Cập nhật DispatchService + Controller
- `PATCH /api/v1/drivers/location` — sau khi update DB, emit `driver.location_updated` đến booking room liên quan (nếu driver đang có active trip)
- `GET /api/v1/drivers/:id/location` — trả về `current_location` của driver (JWT required, app_user dùng)

#### Step 2: Tạo TripModule
Files mới:
- `api/modules/trip/trip.module.ts`
- `api/modules/trip/trip.controller.ts` — 3 endpoints PATCH
- `api/modules/trip/trip.service.ts` — trip lifecycle logic + WS emit
- `api/modules/trip/dto/trip-response.dto.ts`

Endpoints:
```
PATCH /api/v1/trips/:id/driver-arrived  → TripStatus.DRIVER_ARRIVED, BookingStatus.DRIVER_ARRIVED
PATCH /api/v1/trips/:id/start           → TripStatus.IN_PROGRESS, BookingStatus.IN_PROGRESS  
PATCH /api/v1/trips/:id/complete        → TripStatus.COMPLETED, BookingStatus.COMPLETED
```

Authorization: JWT required, chỉ driver sở hữu trip mới được gọi.

#### Step 3: WebSocket events mới

**`driver.location_updated`** — emit đến `booking:{bookingId}` khi driver update location (nếu có active trip):
```json
{
  "driverId": "uuid",
  "lat": 21.028,
  "lng": 105.804,
  "heading": 90,
  "eta": null
}
```

**`trip.status_changed`** — emit đến `booking:{bookingId}` + `driver:{driverId}` khi trip status thay đổi:
```json
{
  "tripId": "uuid",
  "bookingId": "uuid", 
  "status": "DRIVER_ARRIVED" | "IN_PROGRESS" | "COMPLETED"
}
```

#### Step 4: Update app.module.ts
- Import TripModule

---

## Files To Create

### New Files
```
nestjs_prisma/api/modules/trip/trip.module.ts
nestjs_prisma/api/modules/trip/trip.controller.ts
nestjs_prisma/api/modules/trip/trip.service.ts
nestjs_prisma/api/modules/trip/dto/trip-response.dto.ts
```

## Files To Modify

```
nestjs_prisma/api/modules/dispatch/dispatch.service.ts   — thêm location broadcast + GET location
nestjs_prisma/api/modules/dispatch/dispatch.controller.ts — thêm GET /drivers/:id/location
nestjs_prisma/api/common/websocket/websocket.gateway.ts  — thêm emitDriverLocationUpdated (booking room), emitTripStatusChanged
nestjs_prisma/api/app.module.ts                          — import TripModule
```

**Không cần Prisma migration.**

---

## API Contracts

### PATCH /api/v1/drivers/location (đã có, thêm broadcast)
**Auth**: JWT driver  
**Behavior thêm**: sau update DB, query active trip của driver, nếu có emit `driver.location_updated` đến `booking:{bookingId}`

### GET /api/v1/drivers/:id/location
**Auth**: JWT required  
**Response**:
```json
{
  "success": true,
  "data": {
    "driverId": "uuid",
    "lat": 21.028,
    "lng": 105.804,
    "heading": 90,
    "updatedAt": "2026-07-07T..."
  }
}
```

### PATCH /api/v1/trips/:id/driver-arrived
**Auth**: JWT driver (owner of trip)  
**Response**: `{ success: true, data: { tripId, status: "DRIVER_ARRIVED" } }`  
**Side effects**: emit `trip.status_changed` đến booking room + driver room

### PATCH /api/v1/trips/:id/start
**Auth**: JWT driver (owner of trip)  
**Response**: `{ success: true, data: { tripId, status: "IN_PROGRESS" } }`  
**Side effects**: emit `trip.status_changed`, set `Trip.started_at`

### PATCH /api/v1/trips/:id/complete
**Auth**: JWT driver (owner of trip)  
**Response**: `{ success: true, data: { tripId, status: "COMPLETED" } }`  
**Side effects**: emit `trip.status_changed`, set `Trip.completed_at`

---

## WebSocket Events Contract

| Event | Emitter | Room | Payload |
|-------|---------|------|---------|
| `driver.location_updated` | DispatchService | `booking:{bookingId}` | `{ driverId, lat, lng, heading, eta: null }` |
| `trip.status_changed` | TripService | `booking:{bookingId}` + `driver:{driverId}` | `{ tripId, bookingId, status }` |

---

## Acceptance Criteria

- [ ] `PATCH /drivers/location` vẫn hoạt động như cũ + emit `driver.location_updated` đến booking room nếu driver có active trip
- [ ] `GET /drivers/:id/location` trả về vị trí hiện tại của driver
- [ ] `PATCH /trips/:id/driver-arrived` → TripStatus.DRIVER_ARRIVED + BookingStatus.DRIVER_ARRIVED + WS emit
- [ ] `PATCH /trips/:id/start` → TripStatus.IN_PROGRESS + BookingStatus.IN_PROGRESS + `Trip.started_at` + WS emit
- [ ] `PATCH /trips/:id/complete` → TripStatus.COMPLETED + BookingStatus.COMPLETED + `Trip.completed_at` + WS emit
- [ ] Authorization: chỉ driver sở hữu trip mới được gọi lifecycle endpoints
- [ ] `bun run typecheck` pass
- [ ] `bun run lint` pass

---

## Out of Scope

- Prisma migration (không cần schema changes)
- Retry dispatch endpoint (`POST /dispatch/:bookingId/retry`) — scope T-0072
- Turn-by-turn routing / navigation
- Driver rating
- Cash payment flow
- app_user, app_taixe changes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Circular dependency TripModule ↔ WebSocketModule | Low | Med | WebSocketModule @Global — inject trực tiếp |
| active trip query performance | Low | Low | Single query với `driver_id + status IN [DRIVER_EN_ROUTE, DRIVER_ARRIVED, IN_PROGRESS]` |
| Authorization bug (wrong driver can complete trip) | Low | High | Verify `trip.driver_id === req.user.id` trước khi update |

---

## Model Routing

- Planning: Sonnet ✓ (task scope rõ, 1 module mới + 1 enhancement, không cần Opus)
- Implementing: Opus (per harness rule)
- Evaluating/Reviewing: Sonnet
- Closing: Haiku
