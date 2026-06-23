# T-0021: Trip Tracking và Payment app_user

**Title**: Trip Tracking và Payment app_user  
**Priority**: P1  
**Projects**: app_user

---

## Mô tả

Màn hình theo dõi chuyến đi khi tài xế đã đến đón, đang di chuyển, và kết thúc. Xem tài xế di chuyển realtime trên Google Maps. Kết thúc: hiển thị hóa đơn, thanh toán, đánh giá (optional).

## Yêu cầu

### 1. Active Trip Screen

- Google Maps fullscreen với:
  - Marker tài xế di chuyển realtime (hình xe, màu xanh)
  - Marker dropoff (đỏ)
  - Polyline route đến dropoff
  - Auto-follow: camera theo dõi tài xế
  - Cập nhật ETA đến dropoff realtime
- Status info:
  - Driver info (avatar, tên, biển số)
  - ETA đến dropoff (từ Google Directions API)
  - Khoảng cách còn lại
  - Thời gian đã đi
- Nút gọi tài xế (phone call)
- Nút "Đã đến nơi" (khi đến dropoff gần)

### 2. Trip Complete Screen

- Hóa đơn chi tiết:
  - Điểm đón / điểm đến
  - Khoảng cách (km)
  - Thời gian (phút)
  - Giá cước
  - Phụ phí (nếu có)
  - Tổng thanh toán
  - Phương thức thanh toán (CASH / E_WALLET)
- Payment status:
  - CASH: "Vui lòng thanh toán tiền mặt cho tài xế"
  - E_WALLET: "Đã thanh toán" hoặc "Đang xử lý"
- Nút "Đánh giá" (optional): star rating + comment
- Nút "Quay về trang chủ"

### 3. API Integration

#### 3.1. WebSocket Events
```typescript
// Kết nối WebSocket từ T-0020, tiếp tục trong trip
driver.location_updated → { driverId, location: { lat, lng }, timestamp }
trip.status_changed     → { tripId, status: 'STARTED' | 'COMPLETED', timestamp }
```

#### 3.2. Trip APIs
```typescript
GET  /api/trips/:id           → chi tiết chuyến
PATCH /api/trips/:id/complete (driver gọi, user chỉ xem)
```

#### 3.3. Payment APIs
```typescript
GET /api/payments/:tripId → payment status & details
```

#### 3.4. Google Maps Routes
```typescript
POST /api/v1/routes/directions
Body: {
  origin: { lat: driverCurrent.lat, lng: driverCurrent.lng },
  destination: { lat: dropoff.lat, lng: dropoff.lng }
}
// Gọi định kỳ (30s-60s) để cập nhật ETA
```

### 4. Files

- `app_user/app/trip/active.tsx` - Màn hình theo dõi chuyến
- `app_user/app/trip/complete.tsx` - Màn hình hóa đơn
- `app_user/src/api/payments.ts` - Payment API
- `app_user/src/api/trips.ts` - Trip API
- `app_user/src/components/Map/TripMapView.tsx` - Map tracking component
- `app_user/src/components/Trip/TripInfoBar.tsx` - ETA + distance info
- `app_user/src/components/Trip/TripInvoice.tsx` - Hóa đơn
- `app_user/src/components/Trip/RatingModal.tsx` - Đánh giá

### 5. Error Handling

- WebSocket disconnect → reconnect, cache last location
- Mất mạng → hiển thị offline banner, không update ETA
- Driver location stale > 30s → cảnh báo
- API lỗi khi get invoice → retry + hiển thị cached data
- Payment API lỗi → hiển thị thông báo, cho phép refresh

### 6. Success Criteria

- [ ] Google Maps hiển thị driver marker + dropoff marker + route polyline
- [ ] Driver marker di chuyển realtime
- [ ] ETA đến dropoff cập nhật realtime
- [ ] Màn hình hóa đơn sau trip complete
- [ ] Payment status hiển thị đúng
- [ ] Handle WebSocket disconnect/reconnect
- [ ] Nút gọi tài xế hoạt động
- [ ] Performance: map không bị lag

## Dependencies

- T-0020 (WebSocket + tracking screen) - inherit connection
- T-0010 (Backend trip API)
- T-0011 (Backend payment API)
- Google Maps từ T-0018 (map component)

## Notes

- ETA update: gọi Directions API mỗi 30-60s hoặc dùng WebSocket để optimize
- Driver marker nên smooth animate giữa các location updates
- Khi đến gần dropoff (dưới 200m) → auto detect + vibration
- Invoice cần hiển thị ngay cả khi không có mạng (cache từ API response)

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
