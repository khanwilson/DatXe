# T-0068 Contract — BE: Driver Location & Dispatch Enhancement

**Task ID**: T-0068  
**Phase**: Contracting  
**Created**: 2026-07-08  
**Depends on**: T-0062, T-0063

---

## Scope

### In Scope

1. **DispatchService Enhancement**
   - `updateDriverLocation()`: sau khi update DB, query active trip và broadcast `driver.location_updated` đến booking room
   - `getDriverLocation()`: trả về vị trí hiện tại của driver

2. **DispatchController Enhancement**
   - `GET /api/v1/drivers/:id/location`: endpoint lấy vị trí driver (JWT required)

3. **TripModule (new)**
   - `PATCH /api/v1/trips/:id/driver-arrived`: driver xác nhận đến nơi đón
   - `PATCH /api/v1/trips/:id/start`: driver bắt đầu hành trình
   - `PATCH /api/v1/trips/:id/complete`: driver hoàn thành chuyến
   - Authorization: chỉ driver sở hữu trip mới được gọi
   - Emit `trip.status_changed` WS event sau mỗi transition

4. **WebSocketGateway Enhancement**
   - `emitDriverLocationToBooking()`: broadcast driver location đến booking room
   - `emitTripStatusChanged()`: emit trip status đến booking room + driver room

5. **AppModule Update**
   - Import TripModule

### Out of Scope

- Prisma schema migration (không cần thay đổi schema)
- Retry dispatch endpoint
- Driver rating/review
- Trip history query endpoints
- Frontend changes (app_user, app_taixe)

---

## Allowed Files

```
nestjs_prisma/api/modules/dispatch/dispatch.service.ts
nestjs_prisma/api/modules/dispatch/dispatch.controller.ts
nestjs_prisma/api/modules/trip/trip.module.ts          (new)
nestjs_prisma/api/modules/trip/trip.service.ts         (new)
nestjs_prisma/api/modules/trip/trip.controller.ts      (new)
nestjs_prisma/api/modules/trip/dto/trip-response.dto.ts (new)
nestjs_prisma/api/common/websocket/websocket.gateway.ts
nestjs_prisma/api/app.module.ts
```

---

## API Contracts

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
    "updatedAt": "2026-07-08T..."
  }
}
```

### PATCH /api/v1/trips/:id/driver-arrived

**Auth**: JWT driver (owner only)  
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DRIVER_ARRIVED",
    ...
  }
}
```

**Side effects**:
- Update Trip.status = DRIVER_ARRIVED
- Update Booking.status = DRIVER_ARRIVED
- Emit `trip.status_changed` → booking room + driver room

### PATCH /api/v1/trips/:id/start

**Auth**: JWT driver (owner only)  
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "started_at": "2026-07-08T...",
    ...
  }
}
```

**Side effects**:
- Update Trip.status = IN_PROGRESS
- Update Booking.status = IN_PROGRESS
- Set Trip.started_at = now()
- Emit `trip.status_changed` → booking room + driver room

### PATCH /api/v1/trips/:id/complete

**Auth**: JWT driver (owner only)  
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "completed_at": "2026-07-08T...",
    ...
  }
}
```

**Side effects**:
- Update Trip.status = COMPLETED
- Update Booking.status = COMPLETED
- Set Trip.completed_at = now()
- Emit `trip.status_changed` → booking room + driver room

---

## WebSocket Events

### driver.location_updated

**Emitted by**: DispatchService.updateDriverLocation()  
**Room**: `booking:{bookingId}`  
**Payload**:
```json
{
  "driverId": "uuid",
  "lat": 21.028,
  "lng": 105.804,
  "heading": 90
}
```

**Trigger**: Khi driver update location VÀ có active trip (status IN [DRIVER_EN_ROUTE, DRIVER_ARRIVED, IN_PROGRESS])

### trip.status_changed

**Emitted by**: TripService  
**Rooms**: `booking:{bookingId}` + `driver:{driverId}`  
**Payload**:
```json
{
  "tripId": "uuid",
  "bookingId": "uuid",
  "status": "DRIVER_ARRIVED" | "IN_PROGRESS" | "COMPLETED"
}
```

**Trigger**: Sau mỗi trip status transition

---

## Authorization Rules

1. **GET /drivers/:id/location**: JWT required, bất kỳ authenticated user nào cũng có thể query
2. **PATCH /trips/:id/***: JWT driver required, chỉ driver sở hữu trip (trip.driver_id === user.sub)
3. **ForbiddenException**: Nếu driver không phải owner → throw 403

---

## Implementation Constraints

1. **No schema migration**: Tận dụng schema hiện có (T-0063 đã có đủ enum + fields)
2. **WebSocketModule is @Global()**: Không cần import trong TripModule
3. **Response format**: `{ success: true, data: {...} }`
4. **Error handling**: NotFoundException (404) + ForbiddenException (403)
5. **Follow patterns**: BookingModule, DispatchModule patterns

---

## Acceptance Criteria

- [ ] `GET /drivers/:id/location` trả về vị trí driver (lat, lng, heading, updatedAt)
- [ ] `PATCH /drivers/location` broadcast `driver.location_updated` nếu có active trip
- [ ] `PATCH /trips/:id/driver-arrived` → Trip.status=DRIVER_ARRIVED, Booking.status=DRIVER_ARRIVED, emit WS
- [ ] `PATCH /trips/:id/start` → Trip.status=IN_PROGRESS, Booking.status=IN_PROGRESS, started_at set, emit WS
- [ ] `PATCH /trips/:id/complete` → Trip.status=COMPLETED, Booking.status=COMPLETED, completed_at set, emit WS
- [ ] Authorization: chỉ driver owner mới update được trip
- [ ] `bun run typecheck` pass
- [ ] `bun run lint` pass

---

## Dependencies

- T-0062: BookingModule (completed)
- T-0063: DispatchModule (completed)
- WebSocketModule: @Global() (completed)
- Prisma schema: đã có đủ enum (T-0063)

---

## Risk Assessment

**Low risk**:
- Không thay đổi schema
- Không thay đổi API contract cũ
- Chỉ thêm endpoints mới + enhancement
- Follow existing patterns

**Mitigation**:
- Typecheck + lint trước khi complete
- Test authorization logic (driver ownership)
- Verify WS emission logic
