# T-0024: Trip Management app_taixe

**Title**: Trip Management app_taixe  
**Priority**: P1  
**Projects**: app_taixe

---

## Mô tả

Sau khi accept offer: màn hình trip info (pickup, dropoff trên Google Maps, user info). Nút "Bắt đầu chuyến" (khi tới điểm đón), "Kết thúc chuyến" (khi tới điểm đến). Gửi GPS realtime trong trip. Hiển thị navigation-style map.

## Yêu cầu

### 1. Màn hình Trip Active

- Google Maps fullscreen với:
  - Marker pickup (xanh lá) + dropoff (đỏ)
  - Marker user location (nếu user đang gửi location)
  - Marker driver location (vị trí hiện tại)
  - Route polyline đến pickup → dropoff (2 segment)
  - ETA + distance to pickup / to dropoff (từ Google Directions API)
  - Auto-navigate: camera theo dõi driver + fit route
- Info bar:
  - User info (avatar, tên, số điện thoại)
  - Địa chỉ đón / trả
  - Khoảng cách + ETA
  - Giá chuyến hiển thị

### 2. Trip Flow

1. **Arrived at pickup** → hiển thị nút "Bắt đầu chuyến" (chỉ enable khi GPS gần pickup < 100m)
2. **Trip start** → gọi API `PATCH /trips/:id/start`
   - Bắt đầu GPS tracking interval 5s
   - Cập nhật route: pickup → dropoff
   - Hiển thị nút "Kết thúc chuyến"
3. **In trip** → gửi GPS liên tục (WebSocket driver.location_updated)
   - Hiển thị ETA đến dropoff
   - Nút "Kết thúc chuyến" luôn active
4. **Arrived at dropoff** → gọi API `PATCH /trips/:id/complete`
   - Show earnings summary

### 3. Trip Complete Screen

- Earnings summary:
  - Total amount
  - Chuyến đã hoàn thành
  - Thời gian + khoảng cách
- Nút "Quay về trang chủ" → về home, clear trip state

### 4. API Integration

```typescript
PATCH /trips/:id/start
Body: { timestamp }
Response: { tripId, status: 'IN_PROGRESS', startTime }

PATCH /trips/:id/complete
Body: { timestamp, endLocation: { lat, lng } }
Response: { tripId, status: 'COMPLETED', earnings, totalDistance }

WS: driver.location_updated
Payload: { driverId, location: { lat, lng }, timestamp, tripId }
```

### 5. Google Maps API (qua T-0031 Backend Routes Service)

```typescript
// Phase 1: Sau khi accept → đang đến pickup
// Route từ vị trí driver đến pickup
POST /api/v1/routes/directions
Body: { origin: driverLocation, destination: pickup }
→ polyline đến pickup, ETA, distance
→ Đây là route dẫn đường cho driver đến đón khách

// Phase 2: Khi đến pickup → nút "Bắt đầu chuyến" hiện ra
// Chỉ enable khi GPS xác nhận đã đến gần pickup (< 100m)
// Haversine formula kiểm tra khoảng cách driver → pickup (không cần API)

// Phase 3: Sau khi bắt đầu chuyến → đang chở khách đến dropoff
// Cập nhật route từ driver đến dropoff (có thể khác route cũ)
POST /api/v1/routes/directions
Body: {
  origin: { lat: driver.lat, lng: driver.lng },
  destination: { lat: dropoff.lat, lng: dropoff.lng }
}
→ polyline đến dropoff, ETA mới, distance mới
→ Reset route polyline: bỏ route cũ (pickup), vẽ route mới (dropoff)

// Phase 4: Trong trip → cập nhật ETA liên tục
// Gọi Directions API mỗi 30s để lấy route + ETA mới
// Cache response 30s trong app
// Nếu driver đi sai route → tự động re-route

// Phase 5: Khi đến dropoff (< 200m) → nút "Kết thúc chuyến"
// Auto detect bằng Haversine formula
// Không cần gọi Directions API

// Distance Matrix API (optional, dùng cho ETA nhanh hơn)
// Thay vì gọi Directions đầy đủ mỗi 30s, có thể gọi Distance Matrix
// để lấy duration estimate nhanh hơn, ít tốn quota hơn:
POST /api/v1/routes/distance-matrix
Body: {
  origins: [{ lat: driver.lat, lng: driver.lng }],
  destinations: [{ lat: dropoff.lat, lng: dropoff.lng }],
  mode: 'driving'
}
→ duration estimate + distance
→ Dùng để cập nhật ETA mà không cần vẽ lại polyline
```

#### 5.1. Routing Flow Summary

```
Accept Offer
  ↓
[Route: Driver → Pickup]  ← Directions API (polyline + ETA)
  ↓
Driver đến pickup (GPS < 100m)
  ↓
[BẮT ĐẦU CHUYẾN]
  ↓
[Route: Driver → Dropoff] ← Directions API (reset polyline + ETA mới)
  ↓
Trong trip → Cập nhật ETA mỗi 30s
  ├─ Gọi Directions API → route mới + ETA
  └─ Hoặc Distance Matrix API → chỉ ETA, không vẽ route
  ↓
GPS đến dropoff (< 200m)
  ↓
[KẾT THÚC CHUYẾN]
```

### 6. Files

- `app_taixe/app/trip/active.tsx` - Màn hình trip active
- `app_taixe/app/trip/complete.tsx` - Màn hình complete
- `app_taixe/src/api/trips.ts` - Trip API
- `app_taixe/src/api/trip-hooks.ts` - Custom hooks
- `app_taixe/src/components/Map/TripDriverMapView.tsx` - Map navigation
- `app_taixe/src/components/Trip/TripInfoBar.tsx` - Info bar
- `app_taixe/src/components/Trip/UserInfoCard.tsx` - User info
- `app_taixe/src/components/Trip/StatusButtons.tsx` - Start/Complete buttons

### 7. Error Handling

- GPS không chính xác (tưởng đến pickup nhưng chưa) → chỉ enable nút khi < 100m
- API call start/complete thất bại → retry 3 lần
- WebSocket disconnect → cache location, reconnect
- Mất mạng trong trip → cache trip state, retry khi có mạng

### 8. Success Criteria

- [ ] Google Maps hiển thị pickup + dropoff markers + route polyline
- [ ] ETA + distance đến pickup/dropoff
- [ ] Nút "Bắt đầu chuyến" gọi API đúng
- [ ] GPS gửi realtime trong trip (interval 5s)
- [ ] Nút "Kết thúc chuyến" gọi API đúng
- [ ] Show earnings sau complete
- [ ] Tự động follow camera theo driver
- [ ] Handle mất mạng + reconnect

## Dependencies

- T-0023 (Accept offer) - navigate từ offer
- T-0010 (Backend trip API) - start/complete
- T-0031 (Backend Google Maps) - Directions API
- Google Maps từ T-0022 (reuse map components)

## Notes

- GPS tracking trong trip nên tăng tần suất (5s thay vì 10s)
- Nút "Bắt đầu chuyến" chỉ enable khi GPS xác nhận gần pickup
- Test cases: verify không cho phép start trip nếu chưa đến pickup
- Trip info cần persist locally trong case app crash

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
