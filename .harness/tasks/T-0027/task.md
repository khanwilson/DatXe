# T-0027: Realtime Driver Location app_taixe

**Title**: Realtime Driver Location app_taixe  
**Priority**: P2  
**Projects**: app_taixe, nestjs_prisma

---

## Mô tả

Driver gửi GPS location realtime qua WebSocket khi đang online hoặc trong trip. Backend nhận location, cập nhật Redis Geo, broadcast tới user trong booking room. Tần suất gửi 5-10s, có throttle để tránh spam.

## Yêu cầu

### 1. Frontend - Driver App

- GPS tracking service chạy background khi online
- Gửi location qua WebSocket mỗi 5-10s
- Throttle logic:
  - Không gửi nếu vị trí không thay đổi (> 50m)
  - Không gửi nếu offline
  - Không gửi quá 1 lần / 5 giây
- Handle cases:
  - Permission denied
  - GPS unavailable
  - Network lost → cache location, batch send khi có mạng
  - Background mode (iOS/Android khác nhau)

### 2. Backend - Location Gateway

- WebSocket endpoint cho driver location updates
- Khi nhận location event:
  - Cập nhật Redis Geo: `GEOADD drivers:online <lng> <lat> <driverId>`
  - Cập nhật Prisma Driver model: `currentLocation` (không log history, chỉ latest)
  - Emit tới booking room nếu driver đang có active booking
  - Broadcast tới user app qua booking.roomId
- Validation:
  - Validate driverId authenticated
  - Validate location format
  - Reject suspicious location (jump > 1km in 10s = fake GPS)
- Throttle: max 1 event per driver per 3 seconds

### 3. Redis Geo Usage

- **Redis Geo** (không PostgreSQL) cho:
  - Query tài xế gần booking (GEORADIUS)
  - Cập nhật vị trí hiện tại nhanh (O(log(N)))
- **PostgreSQL** (optional, nếu cần history):
  - Batch write mỗi 5-10 phút
  - Chỉ log location khi driver trong active trip
  - TimescaleDB cho time-series nếu cần scale lớn

### 4. WebSocket Events

```typescript
// Driver gửi:
driver.location_updated {
  driverId: string,
  location: { lat: number, lng: number },
  timestamp: number,
  accuracy: number, // meters
  speed?: number,   // km/h
  heading?: number  // degrees
}

// Backend phát sóng tới user trong booking room:
driver.location_updated → { driverId, location, timestamp }
```

### 5. Files

#### Frontend (app_taixe):
- `app_taixe/src/services/location.ts` - GPS tracking service
- `app_taixe/src/services/location-batcher.ts` - Throttle + batch logic
- `app_taixe/src/hooks/useGPSTracking.ts` - GPS hook
- `app_taixe/src/utils/gps.ts` - Permission, accuracy handling

#### Backend (nestjs_prisma):
- `nestjs_prisma/src/modules/location/gateways/location.gateway.ts` - WS gateway
- `nestjs_prisma/src/modules/location/services/location.service.ts` - Location logic
- `nestjs_prisma/src/modules/location/services/redis-geo.service.ts` - Redis Geo operations
- `nestjs_prisma/src/modules/location/services/location-batch-worker.ts` - Batch write worker

### 6. Error Handling

- WebSocket disconnect → auto reconnect với exponential backoff
- Network lost → cache location, retry khi có mạng
- Invalid location (fake GPS detected) → reject, cảnh báo driver
- Redis unavailable → fallback vào memory cache + retry

### 7. Success Criteria

- [ ] Driver gửi GPS interval 5-10s
- [ ] Backend nhận + validate + broadcast
- [ ] User nhận location update trong booking room
- [ ] Redis Geo cập nhật driver location
- [ ] Throttle/debounce để tránh spam
- [ ] Handle mất mạng + reconnect
- [ ] Detect suspicious GPS (fake location)
- [ ] Performance: handle 1000+ concurrent drivers

## Dependencies

- T-0022 (Driver online status + GPS) - GPS service foundation
- T-0004 (Backend WebSocket) - WS infrastructure
- T-0003 (Redis connection) - Redis Geo operations

## Notes

- iOS: background location cần setup `UIBackgroundModes` trong Info.plist
- Android: background location cần `ACCESS_BACKGROUND_LOCATION` permission
- Throttle client-side để giảm network load
- Không log toàn bộ GPS history vào PostgreSQL (chỉ lưu nếu cần audit)
- Performance target: 1000+ concurrent drivers, mỗi 5s = 200 events/s

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
