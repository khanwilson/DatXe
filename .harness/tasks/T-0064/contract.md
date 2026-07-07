# T-0064 Contract — FE app_user: Booking submit + VNPay payment flow

**Phase**: Contracting  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Depends on**: T-0062 (BookingModule + PaymentModule backend)

---

## Scope

### In Scope

#### 1. API Layer
- Thêm `BOOKING` + `PAYMENT` endpoints vào `src/api/axios/config.ts`
- Tạo `src/api/services/bookingService.ts` — `createBooking(dto)`
- Tạo `src/api/services/paymentService.ts` — `createVnpayUrl(bookingId)`
- Tạo `src/api/hooks/useBooking.ts` — `useCreateBooking()` mutation
- Export từ `src/api/services/index.ts` và `src/api/hooks/index.ts`

#### 2. WebSocket Client
- Tạo `src/api/socket/socketClient.ts` — Socket.IO singleton
- Tạo `src/api/socket/useBookingSocket.ts` — hook lắng nghe booking events
- DEV mock: nếu connect fail → dùng timer giả lập events

#### 3. Zustand State
- Thêm vào `ZustandSession`:
  - `activeBookingId?: string | null`
  - `bookingScreenState?: 'IDLE' | 'BOOKING' | 'PAYMENT' | 'LOOKING' | 'DRIVER_FOUND'`

#### 4. RadarAnimation Component
- Tạo `src/components/map/RadarAnimation.tsx`
- Dùng `react-native-svg` + `react-native-reanimated`
- 3 vòng tròn pulsating + 1 sweep line xoay 360°
- Màu Mai Linh theme

#### 5. BookingRouteScreen Update
- State machine: IDLE → BOOKING → PAYMENT → LOOKING → DRIVER_FOUND
- `onBook`: gọi API → mở browser → hiện radar → lắng nghe WS
- Ẩn `RouteBookingModal` khi LOOKING
- Hiện `RadarAnimation` overlay khi LOOKING
- Navigate `ActiveTripScreen` khi DRIVER_FOUND (placeholder)
- Timeout 90s nếu không có driver → reset IDLE

#### 6. RouteBookingModal Update
- Thêm prop `loading?: boolean`
- Khi `loading=true`: nút "Đặt xe" disabled + spinner

---

## Out of Scope

- `ActiveTripScreen` rewrite (pickup → dropoff flow) — T-0071
- Driver info display (tên, biển số, rating) — T-0071
- Trip tracking real-time — T-0071
- Payment history screen — T-0037
- Cash payment flow
- Refund flow
- app_taixe changes
- Backend changes
- Màn mới (toàn bộ nằm trong `BookingRouteScreen`)

---

## Allowed Files

```
app_user/src/api/axios/config.ts
app_user/src/api/services/bookingService.ts          (new)
app_user/src/api/services/paymentService.ts          (new)
app_user/src/api/services/index.ts
app_user/src/api/hooks/useBooking.ts                 (new)
app_user/src/api/hooks/index.ts
app_user/src/api/socket/socketClient.ts              (new)
app_user/src/api/socket/useBookingSocket.ts          (new)
app_user/src/zustand/session.ts
app_user/src/components/map/RadarAnimation.tsx       (new)
app_user/app/BookingRouteScreen.tsx
app_user/src/components/route/RouteBookingModal.tsx
.harness/tasks/T-0064/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

---

## API Contracts

### POST /api/v1/bookings
**Auth**: Bearer JWT (role: CUSTOMER)

**Request body**:
```json
{
  "pickup_lat": 21.0285,
  "pickup_lng": 105.8542,
  "pickup_address": "Hoàn Kiếm, Hà Nội",
  "dropoff_lat": 21.0245,
  "dropoff_lng": 105.8412,
  "dropoff_address": "Ba Đình, Hà Nội",
  "vehicle_type": "xe4cho",
  "estimated_price": 45000,
  "distance": 2.5,
  "estimated_duration": 15
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "pickup_address": "...",
    "dropoff_address": "...",
    "vehicle_type": "xe4cho",
    "estimated_price": "45000.00",
    "created_at": "2026-07-07T..."
  }
}
```

---

### POST /api/v1/payments/vnpay/create-payment-url
**Auth**: Bearer JWT (role: CUSTOMER)

**Request body**:
```json
{
  "booking_id": "uuid"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "txnRef": "VNP20260707100000"
  }
}
```

---

### WebSocket Events

| Event | Direction | Room | Trigger |
|-------|-----------|------|---------|
| `booking.payment_success` | Server → app_user | `booking:{bookingId}` | VNPay callback success |
| `booking.driver_assigned` | Server → app_user | `booking:{bookingId}` | Driver accept offer |
| `booking.no_driver_found` | Server → app_user | `booking:{bookingId}` | Hết 3 vòng dispatch |

**`booking.payment_success` payload**:
```json
{
  "bookingId": "uuid",
  "bookingStatus": "PAYMENT_COMPLETED",
  "paymentStatus": "SUCCESSFUL"
}
```

**`booking.driver_assigned` payload**:
```json
{
  "bookingId": "uuid",
  "driverId": "uuid",
  "driverName": "Nguyễn Văn A",
  "driverPhone": "0901234567",
  "driverRating": 4.8,
  "vehicleType": "xe4cho",
  "vehiclePlate": "30A-12345",
  "estimatedArrival": 180
}
```

**`booking.no_driver_found` payload**:
```json
{
  "bookingId": "uuid",
  "reason": "NO_DRIVER_IN_RANGE"
}
```

---

## Screen State Machine

```
IDLE          → map + RouteBookingModal hiện (trạng thái ban đầu)
BOOKING       → modal loading, nút "Đặt xe" disabled
PAYMENT       → browser mở (expo-web-browser), modal ẩn
LOOKING       → modal ẩn, map full-screen, RadarAnimation overlay
DRIVER_FOUND  → navigate sang ActiveTripScreen (placeholder)
ERROR         → alert + reset về IDLE
```

**Transitions**:
- IDLE → BOOKING: user bấm "Đặt xe"
- BOOKING → PAYMENT: API call thành công, mở browser
- BOOKING → ERROR: API call fail → alert + reset IDLE
- PAYMENT → LOOKING: browser đóng
- LOOKING → DRIVER_FOUND: nhận `booking.driver_assigned` WS event
- LOOKING → ERROR: nhận `booking.no_driver_found` hoặc timeout 90s → alert + reset IDLE
- DRIVER_FOUND → IDLE: navigate sang ActiveTripScreen (T-0071 sẽ handle)

---

## Acceptance Criteria

- [ ] `onBook` trong `BookingRouteScreen` gọi `POST /bookings` → nhận bookingId
- [ ] Sau booking → gọi `POST /payments/vnpay/create-payment-url` → nhận paymentUrl
- [ ] Mở in-app browser VNPay, browser đóng → quay lại `BookingRouteScreen`
- [ ] Modal chọn xe ẩn, map full-screen, radar animation hiện (trạng thái LOOKING)
- [ ] WebSocket client connect tới backend với JWT bearer token
- [ ] App nhận `booking.payment_success` WS event → giữ LOOKING (chờ driver)
- [ ] App nhận `booking.driver_assigned` WS event → navigate sang `ActiveTripScreen` (placeholder)
- [ ] App nhận `booking.no_driver_found` → alert + reset về IDLE
- [ ] Nếu payment fail → alert + hiện lại modal chọn xe
- [ ] Timeout 90s không có driver → alert + reset về IDLE
- [ ] DEV mock hoạt động (không cần backend thật)
- [ ] `bun run typecheck` pass
- [ ] `bun run lint` pass

---

## Implementation Constraints

- Follow pattern đã có: `authService.ts` (DEV mock), `useAuth.ts` (useMutation), `ZustandSession`
- Dùng `apiClient` từ `src/api/axios/client.ts` — không gọi axios trực tiếp
- Response format: `{ success: true, data: {...} }` — unwrap trong service layer
- JWT token: đọc từ `ZustandPersist.getState().accessToken`
- WebSocket: dùng `socket.io-client` (cần cài thêm)
- Radar animation: `react-native-svg` + `react-native-reanimated` (đã có)
- Theme: dùng `useAppTheme()` + `ITheme` type
- Không hardcode colors — dùng `theme.color.*`
- Không thêm dependency ngoài `socket.io-client`

---

## Dependencies

**Cần cài thêm**:
- `socket.io-client` — WebSocket client

**Đã có**:
- `expo-web-browser` — in-app browser
- `react-native-svg` — SVG rendering
- `react-native-reanimated` — animations
- `@tanstack/react-query` — useMutation
- `zustand` — state management

---

## Test Strategy

- Không có test framework — kiểm tra bằng typecheck + lint
- DEV mock cho phép test toàn bộ flow mà không cần backend
- Manual test: chọn xe → bấm đặt → browser mở → đóng browser → radar hiện → chờ mock events
