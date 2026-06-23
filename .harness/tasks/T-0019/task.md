# T-0019: Booking Create Screen app_user

**Title**: Booking Create Screen app_user  
**Priority**: P1  
**Projects**: app_user

---

## Mô tả

Màn hình đặt xe sau khi chọn điểm đón/đến trên bản đồ: hiển thị thông tin chuyến (pickup, dropoff, distance, estimated price, route polyline), chọn phương thức thanh toán (CASH, E_WALLET), nút "Đặt xe". Gọi API tạo booking.

## Yêu cầu

### 1. Màn hình Booking

- Hiển thị map preview với:
  - Marker pickup (xanh lá) + dropoff (đỏ)
  - Polyline route giữa 2 điểm (từ backend Directions API)
  - Fit markers trong map bounds
- Hiển thị thông tin chuyến:
  - Địa chỉ đón / trả đầy đủ
  - Khoảng cách (ví dụ: 5.2 km)
  - Thời gian dự kiến (ví dụ: 15 phút)
  - Giá ước tính (ví dụ: 45,000đ)
- Chọn phương thức thanh toán:
  - Cash (tiền mặt)
  - E-Wallet (ví điện tử)
- Nút "Đặt xe" (màu chủ đạo, disabled khi đang loading)
- Preview driver info (nếu có tài xế gần)

### 2. API Integration

#### 2.1. Tạo Booking
```typescript
POST /api/bookings
Body: {
  pickup: { lat, lng, address, placeId },
  dropoff: { lat, lng, address, placeId },
  paymentMethod: 'CASH' | 'E_WALLET',
  distance: number, // meters
  estimatedPrice: number,
  routePolyline?: string // encoded polyline từ Directions API
}

Response: {
  bookingId: string,
  status: 'PENDING_DISPATCH',
  estimatedArrival: number // seconds
}
```

#### 2.2. Get Price Estimate
```typescript
POST /api/bookings/estimate
Body: { pickup, dropoff }
Response: { distance, duration, price }
```

### 3. Error Handling

- API lỗi → hiển thị thông báo + retry
- Mất mạng → hiển thị offline message
- Invalid payment method → cảnh báo
- Không có tài xế gần → thông báo
- Booking failed → hiển thị reason

### 4. Files

- `app_user/app/booking/create.tsx` - Màn hình booking
- `app_user/src/api/bookings.ts` - API functions
- `app_user/src/api/booking-hooks.ts` - Custom hooks
- `app_user/src/zustand/booking-store.ts` - State management

### 5. Success Criteria

- [ ] Map hiển thị pickup/dropoff markers + route polyline
- [ ] Thông tin chuyến hiển thị đúng (distance, ETA, price)
- [ ] Chọn payment method (CASH, E_WALLET)
- [ ] Nút "Đặt xe" gọi API thành công
- [ ] Validate: required pickup + dropoff
- [ ] Loading state khi booking
- [ ] Error handling + retry
- [ ] Navigate đến màn hình tracking sau booking
- [ ] Prevent double submit

## Dependencies

- T-0014 (API client)
- T-0008 (Backend booking API)
- T-0018 (Map picker - loại bỏ, đã merge: T-0018 cung cấp pickup/dropoff data)

## Notes

- Estimated price cần được tính trước khi show, không show số 0
- Ngăn user tạo booking trùng lần 2 trong khi chờ response
- Clear booking state sau khi navigate

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
