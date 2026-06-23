# T-0022: Driver Online/Offline app_taixe

**Title**: Driver Online/Offline app_taixe  
**Priority**: P1  
**Projects**: app_taixe

---

## Mô tả

Tạo màn hình home cho driver với toggle online/offline, gửi GPS location realtime khi online, và hiển thị bản đồ với vị trí hiện tại.

## Yêu cầu

### 1. Online/Offline Toggle

- Nút toggle lớn trên màn hình home
- Khi bật online:
  - Gọi API `PATCH /api/drivers/online` để cập nhật status
  - Bắt đầu gửi GPS location qua WebSocket (interval 5-10s)
  - Hiển thị map với vị trí hiện tại
  - Hiển thị các booking request nearby (nếu có)
- Khi tắt offline:
  - Gọi API `PATCH /api/drivers/offline`
  - Dừng gửi GPS location
  - Ẩn các booking request
  - Hiển thị thông báo "Bạn đã offline"

### 2. GPS Tracking

- Sử dụng `expo-location` hoặc `react-native-geolocation`
- Request location permission khi app start
- Gửi GPS qua WebSocket khi online:
  ```typescript
  WebSocket event: driver.location_updated
  Payload: {
    driverId: string,
    location: { lat: number, lng: number },
    timestamp: number
  }
  ```
- Frequency: 5-10 giây
- Accuracy: high (GPS)
- Handle cases:
  - Permission denied → không cho phép online
  - GPS unavailable → hiển thị thông báo
  - Network lost → cache location, retry khi có mạng

### 3. Map Display

- Sử dụng Google Maps SDK (qua `react-native-maps`)
- Hiển thị vị trí hiện tại của driver (marker màu xanh dương)
- Hiển thị khu vực xung quanh (zoom level 16)
- Khi có booking request nearby → hiển thị marker màu cam với pickup location
- Tap marker → hiển thị thông tin booking (pickup, dropoff, distance)

### 4. Nearby Booking Requests

- Khi online + có booking nearby → hiển thị notification badge trên map
- Tap notification → navigate đến màn hình offer (T-0023)
- Hiển thị distance từ driver đến pickup point (Google Distance Matrix API)
- Hiển thị route polyline (Google Directions API) nếu driver quan tâm

### 5. API Integration

#### 5.1. Driver Status
```typescript
PATCH /api/drivers/online
Body: { isOnline: boolean }
Response: { success: true, data: { isOnline: boolean } }
```

#### 5.2. GPS Location (WebSocket)
```typescript
WebSocket event: driver.location_updated
Payload: { driverId, location: { lat, lng }, timestamp }
```

#### 5.3. Distance Matrix (optional)
```typescript
POST /api/v1/routes/distance-matrix
Body: {
  origins: [{ lat, lng }], // driver current location
  destinations: [{ lat, lng }] // booking pickup location
}
```

### 6. Files cần tạo

- `app_taixe/app/(tabs)/home.tsx` - Màn hình home với toggle + map
- `app_taixe/src/components/Map/DriverMapView.tsx` - Google Maps component
- `app_taixe/src/components/Driver/OnlineToggle.tsx` - Toggle button
- `app_taixe/src/components/Driver/NearbyBookings.tsx` - Booking requests display
- `app_taixe/src/services/location.ts` - GPS tracking service
- `app_taixe/src/services/websocket.ts` - WebSocket client
- `app_taixe/src/api/drivers.ts` - Driver API functions
- `app_taixe/src/hooks/useDriverStatus.ts` - Hook quản lý online/offline state
- `app_taixe/src/hooks/useGPSTracking.ts` - Hook quản lý GPS tracking
- `app_taixe/src/utils/location.ts` - GPS permission handling

### 7. State Management

```typescript
// Zustand store
interface DriverState {
  isOnline: boolean;
  currentLocation: Location | null;
  nearbyBookings: BookingRequest[];
  
  // Actions
  setOnline: (online: boolean) => Promise<void>;
  updateLocation: (loc: Location) => void;
  startGPSTracking: () => void;
  stopGPSTracking: () => void;
}
```

### 8. Error Handling

- Location permission denied → hiển thị dialog giải thích, không cho online
- GPS unavailable → hiển thị thông báo, cho phép offline mode
- Network lost → cache GPS location, retry khi có mạng
- WebSocket disconnect → auto reconnect với exponential backoff
- API error → hiển thị thông báo, fallback về last known state

### 9. Success Criteria

- [ ] Nút online/offline toggle hoạt động
- [ ] Gọi API backend khi toggle
- [ ] GPS tracking (interval 5-10s)
- [ ] Gửi location qua WebSocket
- [ ] Google Maps hiển thị vị trí driver
- [ ] Hiển thị nearby booking requests trên map
- [ ] Distance + route đến pickup (optional)
- [ ] Handle mất GPS/mạng
- [ ] Permission GPS request
- [ ] WebSocket auto reconnect

## Dependencies

- T-0015 (API client) - gọi backend driver API
- T-0031 (Backend Google Maps service) - Distance Matrix, Directions APIs

## Notes

- GPS tracking cần chạy background → cần setup background location permission
- Google Maps SDK cần setup API key trong `app.config.js` hoặc `.env`
- Restrict API key trên Google Cloud Console theo package name (Android) / bundle ID (iOS)
- Test trên cả iOS và Android
- Battery optimization: chỉ gửi GPS khi online

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
