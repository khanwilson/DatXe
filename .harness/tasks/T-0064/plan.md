# T-0064 Plan — FE app_user: Booking submit + VNPay payment flow

**Phase**: Planning  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Depends on**: T-0062 (BookingModule + PaymentModule backend)

---

## Goal

Thay thế flow booking mock hiện tại trong `BookingRouteScreen` bằng flow thật, **toàn bộ nằm trong `BookingRouteScreen`** (không navigate ra màn mới):

1. User chọn loại xe → bấm "Đặt xe"
2. App gọi `POST /bookings` → nhận `bookingId`
3. App gọi `POST /payments/vnpay/create-payment-url` → nhận `paymentUrl`
4. App mở `expo-web-browser` (in-app) để user thanh toán VNPay
5. Browser đóng → app đang ở lại `BookingRouteScreen`
6. **Modal chọn xe ẩn**, map full-screen, **radar animation** (Reanimated + SVG) xuất hiện = trạng thái `LOOKING_DRIVER`
7. WebSocket lắng nghe `booking.payment_success` → chuyển sang trạng thái `LOOKING_DRIVER` và lắng nghe tiếp `booking.driver_assigned`
8. Khi nhận `booking.driver_assigned` → navigate sang màn map pickup (T-0071)
9. Nếu payment fail → alert + hiện lại modal chọn xe
10. Nếu `booking.no_driver_found` sau 3 vòng → alert thông báo + reset về trạng thái ban đầu

---

## Current State

- `BookingRouteScreen` hiện dùng `MOCK_VEHICLES` hardcode, `onBook` chỉ navigate thẳng sang `ActiveTripScreen` không qua API
- `ActiveTripScreen` nhận `vehicleName` + `fare` qua params, dùng `useTripSimulation` (mock hoàn toàn)
- Không có bookingService, paymentService, hay WebSocket client trong app_user
- `ENDPOINTS` config chưa có booking/payment endpoints
- `ZustandSession` chưa lưu bookingId hay paymentState

---

## Proposed Approach

### Scope của T-0064

T-0064 cover: booking submit → VNPay payment → looking driver → driver assigned (hand off sang T-0071).

**Không đụng** `ActiveTripScreen` — T-0071 sẽ rewrite. Không tạo màn mới — toàn bộ trạng thái nằm trong `BookingRouteScreen`.

### Screen States (BookingRouteScreen)

```
IDLE          → map + RouteBookingModal hiện (trạng thái ban đầu)
BOOKING       → modal loading, nút "Đặt xe" disabled
PAYMENT       → browser mở (expo-web-browser), modal ẩn
LOOKING       → modal ẩn, map full-screen, radar animation overlay
DRIVER_FOUND  → navigate sang màn pickup (T-0071, placeholder hiện tại)
ERROR         → alert + reset về IDLE
```

### Implementation Plan

#### Step 1: API layer
- Thêm `BOOKING` + `PAYMENT` endpoints vào `src/api/axios/config.ts`
- Tạo `src/api/services/bookingService.ts` — `createBooking(dto)` → `{ id, status, ... }`
- Tạo `src/api/services/paymentService.ts` — `createVnpayUrl(bookingId)` → `{ paymentUrl, txnRef }`
- Tạo `src/api/hooks/useBooking.ts` — `useCreateBooking()` mutation (useMutation pattern)

#### Step 2: WebSocket client
- Tạo `src/api/socket/socketClient.ts` — Socket.IO singleton, connect với JWT Bearer từ `ZustandPersist.accessToken`
- Tạo `src/api/socket/useBookingSocket.ts` — hook nhận `bookingId`, join room `booking:{bookingId}`, lắng nghe:
  - `booking.payment_success` → callback `onPaymentSuccess`
  - `booking.driver_assigned` → callback `onDriverAssigned`
  - `booking.no_driver_found` → callback `onNoDriverFound`
- DEV: nếu connect fail (mock token) → dùng mock event sau delay

#### Step 3: Zustand state
- Thêm vào `ZustandSession`:
  - `activeBookingId?: string | null`
  - `bookingScreenState?: 'IDLE' | 'BOOKING' | 'PAYMENT' | 'LOOKING' | 'DRIVER_FOUND'`

#### Step 4: RadarAnimation component
- Tạo `src/components/map/RadarAnimation.tsx`
- Dùng `react-native-svg` (đã có) + `react-native-reanimated` (đã có)
- 3 vòng tròn pulsating (SVG Circle + Reanimated `useSharedValue` loop)
- 1 sweep line xoay 360° liên tục (`withRepeat + withTiming`)
- Màu Mai Linh theme (`theme.color.primary.*`)
- Overlay position absolute, center màn hình, bên dưới BackButton

#### Step 5: BookingRouteScreen update
```
onBook():
  1. setState(BOOKING) → modal loading
  2. createBooking({ pickup, dropoff, vehicle_type, estimated_price, distance, duration })
  3. createVnpayUrl(bookingId) → paymentUrl
  4. save activeBookingId, setState(PAYMENT)
  5. WebBrowser.openBrowserAsync(paymentUrl)
  6. Browser đóng → setState(LOOKING), RouteBookingModal ẩn, RadarAnimation hiện
  7. useBookingSocket active:
     - onPaymentSuccess → giữ LOOKING (WS confirm payment)
     - onDriverAssigned → setState(DRIVER_FOUND) → navigate ActiveTripScreen (placeholder)
     - onNoDriverFound → alert "Không tìm được tài xế" → reset IDLE
  8. Timeout 90s nếu không có driver → reset IDLE + alert
```

#### Step 6: RouteBookingModal — loading state
- Thêm prop `loading?: boolean` vào `RouteBookingModal`
- Khi `loading=true`: nút "Đặt xe" hiện spinner, disabled

#### Step 7: _layout.tsx — không cần thêm screen mới
- `BookingRouteScreen` đã registered, không cần màn mới

---

## DEV Mock Strategy

Backend T-0062 chưa chắc đã live khi T-0064 chạy. Áp dụng pattern giống `authService`:

```typescript
// bookingService.ts
if (__DEV__) return mockCreateBooking(data);  // bookingId = 'dev-booking-xxx'

// paymentService.ts
if (__DEV__) return { paymentUrl: 'https://sandbox.vnpayment.vn/...', txnRef: 'dev-txn' };
```

Mock VNPay: mở browser thật với sandbox URL (hoặc skip nếu không có URL), sau khi browser đóng tiếp tục flow bình thường.

WebSocket DEV: `socketClient` cố connect → nếu fail sau 2s → `useBookingSocket` dùng mock timer:
- 3s sau → giả lập `booking.payment_success`
- 5s sau → giả lập `booking.driver_assigned`

Cách này cho phép test toàn bộ UI state machine mà không cần backend.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| T-0062 backend chưa live | Cao | Medium | DEV mock layer như authService |
| expo-web-browser không có trong deps | Thấp | Low | Đã có `expo-web-browser ~15.0.11` trong package.json |
| Socket.IO client chưa có | Medium | Medium | Cài `socket.io-client` — cần thêm dependency |
| VNPay callback URL scheme (deep link) | Medium | High | Trong T-0064 chỉ cần WebSocket confirm, không cần deep link return URL |
| JWT token chưa thật (mock `dev-access-token`) | Medium | Medium | Socket connect sẽ fail với mock token → dùng mock socket trong DEV |

---

## Dependency Check

- `expo-web-browser` — đã có trong `package.json`
- `socket.io-client` — **chưa có**, cần cài thêm
- `@tanstack/react-query` — đã có, dùng `useMutation`
- `zustand` — đã có

**Cần cài thêm**: `socket.io-client` (1 package)

---

## Files To Create/Modify

### New files
```
app_user/src/api/services/bookingService.ts
app_user/src/api/services/paymentService.ts
app_user/src/api/hooks/useBooking.ts
app_user/src/api/socket/socketClient.ts
app_user/src/api/socket/useBookingSocket.ts
app_user/src/components/map/RadarAnimation.tsx
```

### Modified files
```
app_user/src/api/axios/config.ts              (thêm BOOKING + PAYMENT endpoints)
app_user/src/api/services/index.ts            (export bookingService, paymentService)
app_user/src/api/hooks/index.ts               (export useBooking)
app_user/src/zustand/session.ts               (thêm activeBookingId, bookingScreenState)
app_user/app/BookingRouteScreen.tsx           (state machine + API calls + radar overlay)
app_user/src/components/route/RouteBookingModal.tsx  (thêm prop loading)
```

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

## Out of Scope

- `ActiveTripScreen` rewrite (pickup → dropoff flow) — T-0071
- Driver info display (tên, biển số, rating) — T-0071
- Trip tracking real-time — T-0071
- Payment history screen — T-0037
- Cash payment flow
- Refund flow
- app_taixe changes
- Backend changes
