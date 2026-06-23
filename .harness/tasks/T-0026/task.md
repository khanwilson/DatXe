# T-0026: Realtime Booking Status app_user

**Title**: Realtime Booking Status app_user  
**Priority**: P2  
**Projects**: app_user, nestjs_prisma

---

## Mô tả

Tích hợp realtime booking status updates vào app_user qua WebSocket. Các events: SEARCHING_DRIVER → DRIVER_ASSIGNED → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED. Hiển thị driver location trên Google Maps realtime.

## Yêu cầu

### 1. Backend - Booking Gateway

- WebSocket gateway riêng cho booking room
- Room management: mỗi booking là 1 room
- Events phát sóng:
  ```typescript
  booking.status_changed {
    bookingId, status, timestamp,
    driverInfo?: { driverId, name, phone, vehicle, rating }
  }
  
  driver.location_updated {
    driverId, location: { lat, lng }, timestamp
  }
  
  dispatch.timeout {
    bookingId, message, retryCount
  }
  ```

### 2. Frontend - WebSocket Client

- Socket manager service (singleton, manage multiple rooms)
- Hook `useBookingSocket(bookingId)` - kết nối/join room
- State management:
  - Current booking status
  - Driver info (khi assigned)
  - Driver location (latest)
- UI updates trên map:
  - Driver marker di chuyển realtime
  - Status bar update theo progress

### 3. Google Maps Integration

- Driver marker update trên map (T-0020)
- Re-render map khi nhận location event
- Smooth animation cho marker move (interpolate giữa 2 points)
- Auto-pan camera khi driver di chuyển

### 4. Files

#### Frontend:
- `app_user/src/services/socket-manager.ts` - Socket connection manager
- `app_user/src/hooks/useBookingSocket.ts` - Booking socket hook
- `app_user/src/components/Map/BookingTrackingMap.tsx` - Map component

#### Backend:
- `nestjs_prisma/src/modules/booking/gateways/booking.gateway.ts` - WebSocket gateway
- `nestjs_prisma/src/modules/booking/gateways/booking.gateway.spec.ts` - Tests
- `nestjs_prisma/src/modules/booking/services/booking-status.service.ts` - Status logic

### 5. Error Handling

- WebSocket disconnect → auto reconnect, cache last known state
- Mất mạng → hiển thị offline banner
- Driver location stale > 30s → cảnh báo
- Socket timeout → retry with exponential backoff

### 6. Success Criteria

- [ ] Kết nối WebSocket khi booking active
- [ ] Realtime status update từ backend
- [ ] Hiển thị driver info khi assign
- [ ] Driver marker di chuyển realtime trên Google Maps
- [ ] Handle disconnect/reconnect
- [ ] Join booking room
- [ ] Performance: map smooth với frequent updates

## Dependencies

- T-0020 (Booking tracking screen) - map + UI
- T-0004 (Backend WebSocket cơ bản) - WS infrastructure
- Google Maps từ T-0018 (map components)

## Notes

- Smooth marker animation: dùng react-native-maps `animateMarkerToCoordinate`
- Driver marker nên là hình xe thay vì pin mặc định
- Rate limit location updates nếu quá nhiều event (tối đa 10/s)

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
