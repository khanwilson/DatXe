# T-0023: Receive Booking Offer app_taixe

**Title**: Receive Booking Offer app_taixe  
**Priority**: P1  
**Projects**: app_taixe

---

## Mô tả

Khi driver online → nhận dispatch offer qua WebSocket. Hiển thị popup với thông tin chuyến (pickup, dropoff trên Google Maps, price). Nút accept/reject. Timeout 30s.

## Yêu cầu

### 1. Offer Popup

- Popup fullscreen or bottom sheet với:
  - Google Maps preview:
    - Marker pickup (xanh lá) + dropoff (đỏ)
    - Polyline route từ pickup đến dropoff
    - Zoom phù hợp để hiển thị cả 2 marker
  - Thông tin chuyến:
    - Địa chỉ đón / trả
    - Khoảng cách từ driver đến pickup (từ Google Distance Matrix)
    - Khoảng cách chuyến
    - Giá chuyến
    - Thời gian dự kiến
  - Timer đếm ngược (30 giây)
  - 2 nút lớn:
    - NHẬN CUỐC (màu xanh) → accept
    - TỪ CHỐI (màu đỏ) → reject

### 2. Flow

1. WebSocket nhận `dispatch.offer` → hiển thị popup
2. Fetch route preview từ backend Directions API:
   ```typescript
   POST /api/v1/routes/directions
   Body: { origin: driverLocation, destination: pickup }
   -> hiển thị driver → pickup route + ETA
   ```
3. User tap "NHẬN CUỐC" → gửi `dispatch.accept`
4. User tap "TỪ CHỐI" → gửi `dispatch.reject` → popup đóng
5. Timeout 30s → tự động reject → gửi `dispatch.timeout`
6. Chống double offer: chỉ 1 offer 1 lúc (lock UI)

### 3. WebSocket Events

```typescript
// Nhận:
dispatch.offer → {
  bookingId, pickup: { lat, lng, address },
  dropoff: { lat, lng, address },
  price, distance, duration,
  offerId
}

// Gửi:
dispatch.accept  → { bookingId, offerId }
dispatch.reject  → { bookingId, offerId }
dispatch.timeout → { bookingId, offerId } // tự động
```

### 4. Files

- `app_taixe/src/components/Offer/OfferPopup.tsx` - Popup offer chính
- `app_taixe/src/components/Offer/OfferMapPreview.tsx` - Google Maps preview
- `app_taixe/src/components/Offer/OfferTimer.tsx` - Countdown timer
- `app_taixe/src/services/offer-handler.ts` - Logic xử lý offer
- `app_taixe/src/hooks/useOfferSocket.ts` - WebSocket + offer listener
- `app_taixe/src/api/dispatch.ts` - Dispatch WS events

### 5. Error Handling

- WebSocket disconnect trong lúc offer → auto reject + thông báo
- Google Maps route fetch fail → hiển thị offer không có map preview
- Double tap accept → idempotent (backend handle)
- Mất mạng trong lúc offer → reject + thông báo

### 6. Success Criteria

- [ ] Popup offer hiển thị đúng (pickup, dropoff, price, distance)
- [ ] Google Maps preview với markers + polyline route
- [ ] Distance từ driver đến pickup + ETA
- [ ] Accept gọi WS + navigate đến trip screen
- [ ] Reject gọi WS
- [ ] Timeout 30s → auto reject
- [ ] Chỉ 1 offer 1 lúc (lock UI)
- [ ] Handle mất kết nối WS + network
- [ ] Vibration + sound khi nhận offer

## Dependencies

- T-0022 (Online status + map) - driver location + map components
- T-0009 (Backend dispatch)
- T-0031 (Backend Google Maps) - Directions, Distance Matrix
- Google Maps từ T-0022 (reuse map components)

## Notes

- Offer popup nên có animation slide-in từ bottom
- Vibration + sound khi nhận offer để thu hút attention
- Nếu offer timeout, tài xế không thể accept
- Có thể add "nút xem chi tiết" để xem route đầy đủ trước khi accept

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
