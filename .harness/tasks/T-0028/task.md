# T-0028: Realtime Trip Tracking app_user

**Title**: Realtime Trip Tracking app_user  
**Priority**: P2  
**Projects**: app_user

---

## Mô tả

User theo dõi trip realtime: tài xế đang đến, đang di chuyển, vị trí cập nhật trên Google Maps, trạng thái chuyến đi. Tích hợp WebSocket để nhận events, hiển thị driver location smooth animation trên map.

## Yêu cầu

### 1. Trip Tracking Screen

- Google Maps fullscreen với:
  - Driver marker (hình xe, màu xanh dương)
  - Dropoff marker (màu đỏ)
  - Route polyline từ driver → dropoff (Google Directions API)
  - Auto-follow: camera theo dõi driver
  - ETA đến dropoff cập nhật realtime
- Driver info card:
  - Avatar, tên, số điện thoại
  - Biển số xe
  - Rating
- Trip info bar:
  - Thời gian đã đi
  - Khoảng cách còn lại
  - ETA đến dropoff
- Nút gọi tài xế

### 2. Realtime Updates

- WebSocket events từ T-0020 (kế thừa connection):
  ```typescript
  driver.location_updated → { driverId, location: { lat, lng }, timestamp }
  trip.status_changed     → { tripId, status: 'IN_PROGRESS' | 'COMPLETED' }
  ```

- **Phase 1: Driver đang đến pickup (DRIVER_ARRIVING)**
  - User thấy driver marker di chuyển đến pickup trên Google Maps
  - Route polyline: driver → pickup (từ Directions API, lưu ở T-0020)
  - ETA: "Tài xế sẽ đến trong X phút"
  - Không cần gọi Directions API mới, dùng cache từ T-0020

- **Phase 2: Trip đã bắt đầu (IN_PROGRESS)**
  - Khi backend emit `trip.status_changed = IN_PROGRESS` → chuyển sang route mới
  - Gọi Directions API để lấy route từ driver hiện tại → dropoff:
    ```typescript
    POST /api/v1/routes/directions
    Body: {
      origin: { lat: driver.lat, lng: driver.lng },
      destination: { lat: dropoff.lat, lng: dropoff.lng }
    }
    → polyline mới (driver → dropoff), ETA đến dropoff, distance
    ```
  - Reset polyline: bỏ route driver → pickup, vẽ route driver → dropoff
  - ETA: "X phút đến điểm đến"

- Khi nhận `driver.location_updated`:
  - Update driver marker position
  - Smooth animate marker đến vị trí mới
  - Cập nhật ETA (nếu cần, call Distance Matrix API hoặc dùng Directions cache)
  - Nếu driver đi xa route hiện tại > 100m → gọi Directions API re-route (optional)
  - Auto-pan camera để follow driver

- Khi nhận `trip.status_changed` → COMPLETED:
  - Navigate đến màn hình invoice
  - Hiển thị trip summary

### 3. Google Maps Integration

- Custom driver marker (hình xe)
- Marker animation:
  - Sử dụng `react-native-maps` animateMarkerToCoordinate
  - Hoặc tự interpolate giữa 2 points để smooth hơn
- Route polyline:
  - Fetch route mỗi 30-60s (tối ưu API cost)
  - Update polyline khi driver đi xa route hiện tại
  - 2 route segments: (1) driver → dropoff, (2) pickup → dropoff (để tham khảo)
- ETA:
  - Fetch từ Directions API response (đầy đủ + polyline)
  - Hoặc Distance Matrix API (chỉ ETA, nhanh hơn, ít tốn quota hơn)
  - Hiển thị "X phút còn lại"

### 4. API Integration

```typescript
// Route đến dropoff (fetch định kỳ hoặc khi cần)
POST /api/v1/routes/directions
Body: {
  origin: { lat: driverCurrent.lat, lng: driverCurrent.lng },
  destination: { lat: dropoff.lat, lng: dropoff.lng }
}

// Hoặc dùng WebSocket để backend gửi route updates (optional, advanced)
```

### 5. Files

- `app_user/src/hooks/useTripSocket.ts` - WebSocket hook cho trip
- `app_user/src/hooks/useTripRoute.ts` - Route + ETA management
- `app_user/src/components/Map/TripTrackingMap.tsx` - Map component
- `app_user/src/components/Trip/DriverInfoCard.tsx` - Driver info
- `app_user/src/components/Trip/TripProgressBar.tsx` - Progress + ETA
- `app_user/src/utils/polyline.ts` - Decode Google polyline string
- `app_user/src/utils/marker-animation.ts` - Smooth marker animation

### 6. Error Handling

- WebSocket disconnect → auto reconnect, cache last known driver location
- Mất mạng → hiển thị offline banner, không update route
- Driver location stale > 30s → cảnh báo "Vị trí tài xế không cập nhật"
- Directions API lỗi → hide route polyline, hiển thị ETA cached

### 7. Success Criteria

- [ ] Driver marker di chuyển realtime trên Google Maps
- [ ] Smooth marker animation (không nhảy vị trí)
- [ ] Route polyline cập nhật khi driver di chuyển
- [ ] ETA đến dropoff realtime
- [ ] Trip status updates (STARTED → IN_PROGRESS → COMPLETED)
- [ ] Handle WebSocket reconnect
- [ ] Performance: 60 FPS trên map
- [ ] Auto-follow driver

## Dependencies

- T-0021 (Trip tracking screen) - UI foundation
- T-0027 (Backend driver location) - location events
- T-0020 (WebSocket connection) - inherit WS connection
- Google Maps từ T-0018 (map components)

## Notes

- Smooth animation: nếu driver update mỗi 5s, interpolate position giữa các updates
- Fetch Directions API mỗi 30-60s (không phải mỗi 5s) để giảm cost
- Marker rotation: có thể xoay marker theo heading của driver
- Khi driver đến gần dropoff (< 200m) → auto detect + vibration
- Test: verify marker không teleport khi network lag

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
