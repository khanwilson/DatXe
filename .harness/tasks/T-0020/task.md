# T-0020: Booking Status Tracking app_user

**Title**: Booking Status Tracking app_user  
**Priority**: P1  
**Projects**: app_user

---

## Mô tả

Màn hình theo dõi booking sau khi đặt xe thành công. Hiển thị trạng thái chuyến realtime qua WebSocket: đang tìm tài xế, tài xế đã nhận, tài xế đang đến, tài xế đã đến. Hiển thị thông tin tài xế + vị trí tài xế trên bản đồ Google Maps.

## Yêu cầu

### 1. Màn hình Tracking

- Google Maps fullscreen với:
  - Marker pickup (xanh lá) + dropoff (đỏ)
  - Marker tài xế di chuyển realtime (màu xanh dương, hình xe)
  - Polyline route (từ backend Directions API)
  - Auto-follow: camera theo dõi tài xế
  - Fit both driver + pickup + dropoff cùng lúc
- Status bar (theo tiến trình):
  - Đang tìm tài xế (SEARCHING_DRIVER) → animation loading
  - Tài xế đã nhận (DRIVER_ASSIGNED) → hiển thị driver info
  - Tài xế đang đến (DRIVER_ARRIVING) → animation + ETA
  - Tài xế đã đến (DRIVER_ARRIVED) → thông báo + hướng dẫn
- Driver info card:
  - Avatar, tên, số điện thoại, đánh giá
  - Biển số xe, loại xe, màu xe
  - ETA đến pickup
- Nút hủy booking:
  - Chỉ active trong giai đoạn SEARCHING_DRIVER
  - Confirmation dialog
  - Gọi API cancel booking

### 2. WebSocket Events

#### 2.1. Kết nối WebSocket
```typescript
// Kết nối khi booking được tạo thành công
// Disconnect khi booking kết thúc
connect(bookingId: string);

// Events nhận:
booking.status_changed    → { bookingId, status, driverInfo?, timestamp }
driver.location_updated   → { driverId, location: { lat, lng }, timestamp }
dispatch.timeout          → { bookingId, message, retryCount }
```

### 3. API Integration

#### 3.1. Google Maps Routes (qua T-0031)
```typescript
// Phase 1: Driver đã nhận → đang đến pickup
// Tính route + ETA từ driver location hiện tại đến pickup
POST /api/v1/routes/directions
Body: {
  origin: { lat: driver.lat, lng: driver.lng },   // vị trí driver realtime
  destination: { lat: pickup.lat, lng: pickup.lng } // pickup đã chọn
}
→ trả về polyline (vẽ route đến pickup), ETA (thời gian driver đến),
  distance (khoảng cách driver còn lại)

// Phase 2: Khi driver đã đến pickup (DRIVER_ARRIVED)
// Không cần route nữa, chỉ giữ driver marker

// Fallback: nếu WebSocket update location thường xuyên,
// có thể kết hợp Directions API 30-60s/lần + WebSocket location
// để cập nhật ETA mà không cần gọi Directions quá nhiều
```

#### 3.2. Geo-fence Detection (đến gần pickup)
- Khi driver location liên tục được cập nhật qua WebSocket, client tự tính khoảng cách driver → pickup:
  - Nếu khoảng cách < 300m → tự động hiển thị "Tài xế sắp đến!"
  - Nếu khoảng cách < 50m → tự động chuyển sang DRIVER_ARRIVED
  - Không cần gọi Directions API cho việc này, chỉ dùng Haversine formula
  hoặc Google Distance Matrix API để xác nhận khoảng cách chính xác

#### 3.3. ETA Updates Continuous
- Khi driver đang di chuyển, ETA cập nhật theo 1 trong 2 cách:
  - **Option A (khuyến nghị)**: Gọi Directions API mỗi 60s để lấy route + ETA mới
  - **Option B (tiết kiệm)**: Backend gửi ETA estimate kèm trong WS driver.location_updated
  - Cache Directions response 60s trong app để tránh gọi API quá nhiều

### 4. Files

- `app_user/app/booking/tracking.tsx` - Màn hình tracking
- `app_user/src/services/websocket.ts` - WebSocket client
- `app_user/src/services/socket-events.ts` - Event handlers
- `app_user/src/components/Map/TrackingMapView.tsx` - Map với driver tracking
- `app_user/src/components/Tracking/StatusBar.tsx` - Progress bar
- `app_user/src/components/Tracking/DriverInfoCard.tsx` - Thông tin tài xế
- `app_user/src/components/Tracking/CancelButton.tsx` - Nút hủy

### 5. Error Handling

- WebSocket disconnect → auto reconnect, hiển thị "Đang kết nối lại..."
- Mất mạng → hiển thị offline banner, cache last known driver location
- Driver location stale > 30s → hiển thị cảnh báo "Vị trí tài xế có thể không chính xác"
- API error → hiển thị thông báo
- Cancel failed → hiển thị reason

### 6. Success Criteria

- [ ] Google Maps hiển thị pickup, dropoff, driver markers
- [ ] Driver marker di chuyển realtime (cập nhật mỗi khi location event)
- [ ] Polyline route hiển thị
- [ ] WebSocket connect ngay sau booking
- [ ] Status updates realtime
- [ ] Driver info card khi được assign
- [ ] ETA đến pickup
- [ ] Auto-follow driver trên map
- [ ] Nút hủy booking (chỉ khi SEARCHING_DRIVER)
- [ ] Handle WebSocket reconnect

## Dependencies

- T-0019 (Booking create screen) - navigate đến tracking
- T-0004 (Backend WebSocket) - realtime events
- T-0008 (Backend booking API) - cancel booking
- Google Maps từ T-0018 (map component)

## Notes

- Driver marker nên dùng custom icon (hình xe) thay vì marker mặc định
- Khi driver đến gần pickup (dưới 100m) → vibration + notification
- Tối ưu performance: không re-render map khi không cần thiết

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
