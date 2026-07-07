# T-0061 Plan — Wave VNPay: Master Plan

**Phase**: Planning  
**Model**: Opus (wave planning, multi-project, architecture boundary)  
**Created**: 2026-07-07

---

## Mục tiêu Wave

Tích hợp sandbox VNPay vào luồng đặt xe:

1. Người dùng chọn loại xe → nhấn Book trong `BookingRouteScreen`
2. Hệ thống tạo booking → mở màn chọn phương thức thanh toán
3. Người dùng chọn VNPay → redirect sang VNPay sandbox → thanh toán
4. Callback VNPay → backend xác thực → cập nhật trạng thái payment
5. Khi payment thành công → dispatch tìm tài xế gần nhất

---

## Phân tích hiện trạng

### Đã có
- Prisma schema: `Booking`, `Payment`, `Trip`, `DispatchOffer`, `DriverStatus`, `BookingStatus`, `PaymentStatus`, `PaymentMethod` — đầy đủ
- `BookingRouteScreen` + `RouteBookingModal`: UI scaffold, `onBook` callback chưa wire
- Backend `auth` + `routes` modules hoạt động
- WebSocket gateway (`common/websocket`) đã có, chưa gắn vào booking/dispatch

### Chưa có
- Backend: `BookingModule`, `PaymentModule`, `DispatchModule` — không tồn tại
- Frontend: logic submit booking, màn payment, VNPay deeplink
- `ENDPOINTS.BOOKING`, `ENDPOINTS.PAYMENT` trong `app_user/src/api/axios/config.ts`

### Schema gap
- `PaymentMethod` enum hiện có: `CASH`, `CARD`, `WALLET` — cần thêm `VNPAY` cho sandbox
- `Booking` chưa có `vehicle_type` field — cần thêm để lưu loại xe người dùng chọn

---

## Kiến trúc luồng VNPay

```
app_user (BookingRouteScreen)
  │ onBook(vehicleId)
  ▼
POST /api/v1/bookings          → BookingModule → tạo Booking (PENDING)
  │ bookingId
  ▼
POST /api/v1/payments/vnpay/create-payment-url
  │                            → PaymentModule → tạo Payment (PENDING)
  │                            → gọi VNPay SDK tạo payment URL
  │ vnpayUrl
  ▼
app_user Linking.openURL(vnpayUrl)  [VNPay sandbox — browser ngoài]
  │ user hoàn tất thanh toán
  ▼
VNPay GET /api/v1/payments/vnpay/callback?vnp_*  [IPN + return URL]
  │                            → PaymentModule xác thực chữ ký
  │                            → cập nhật Payment.status = SUCCESSFUL
  │                            → cập nhật Booking.status = PAYMENT_COMPLETED
  │                            → emit WebSocket event `booking.payment_success`
  ▼
DispatchModule nhận event      → tìm driver gần nhất (Goong geolocation)
  │                            → tạo DispatchOffer, emit `driver.new_offer`
  ▼
app_user nhận WS `booking.payment_success` → navigate ActiveTripScreen
app_taixe nhận WS `driver.new_offer`       → hiện offer popup (T-0042 scope)
```

---

## Cấu trúc Task Wave

### T-0061 (file này) — Master Plan
Tài liệu tổng thể, dependency map, không implement gì.

### T-0062 — BE: Booking + Payment + VNPay Module
**Project**: `nestjs_prisma`  
**Scope**:
- Prisma migration: thêm `VNPAY` vào `PaymentMethod` enum, thêm `vehicle_type` vào `Booking`
- `BookingModule`: `POST /bookings`, `GET /bookings/:id`
- `PaymentModule`:
  - `POST /payments/vnpay/create-payment-url`
  - `GET /payments/vnpay/callback` (IPN + return URL — xác thực HMAC-SHA512)
  - `GET /payments/:bookingId` (status query)
- Emit `booking.payment_success` qua WebSocket gateway khi payment confirmed
- VNPay sandbox: dùng `vnpay` npm package hoặc tự implement HMAC-SHA512 theo tài liệu VNPay

### T-0063 — BE: Dispatch Module (find nearest driver)
**Project**: `nestjs_prisma`  
**Depends on**: T-0062  
**Scope**:
- `DispatchModule` lắng nghe event `booking.payment_success`
- Query `Driver` với `status = ONLINE`, tính khoảng cách tới pickup (dùng `GoongService` hoặc PostGIS/Haversine)
- Tạo `DispatchOffer`, emit `driver.new_offer` qua WebSocket tới room `driver:{driverId}`
- Timeout offer sau N giây → tìm driver kế tiếp (simple queue)

### T-0064 — FE app_user: Booking submit + Payment screen
**Project**: `app_user`  
**Depends on**: T-0062  
**Scope**:
- Wire `onBook` trong `BookingRouteScreen` → gọi `POST /bookings` → `POST /payments/vnpay/create-payment-url`
- Thêm `PaymentMethodModal`: chọn VNPay / Cash (không cần VNPay integration cho Cash)
- Thêm `VNPayWebViewScreen`: `WebView` mở VNPay sandbox URL
- Lắng nghe WS event `booking.payment_success` → navigate `ActiveTripScreen`
- Thêm `ENDPOINTS.BOOKING` + `ENDPOINTS.PAYMENT` vào `config.ts`
- Loading/error states cho booking + payment flow

### T-0065 — FE app_user: ActiveTripScreen sau payment
**Project**: `app_user`  
**Depends on**: T-0064  
**Scope**:
- `ActiveTripScreen` hiện tại nhận `vehicleName` + `fare` qua params
- Sau khi có bookingId thật, wire screen đọc booking status từ BE
- Hiện driver info, trip status, map tracking (mock driver position nếu chưa có real-time)
- Lắng nghe WS `trip.status_changed` để cập nhật UI

---

## Dependency Graph

```
T-0062 (BE Booking + Payment + VNPay)
  └─→ T-0063 (BE Dispatch)
  └─→ T-0064 (FE Payment screen)
        └─→ T-0065 (FE ActiveTripScreen)
```

T-0062 và T-0063 nên chạy trước; T-0064 có thể mock BE trong khi T-0062 chưa xong (stub API).

---

## Prisma Changes Required (T-0062)

```prisma
// Thêm vào PaymentMethod enum
enum PaymentMethod {
  CASH
  CARD
  WALLET
  VNPAY    // NEW
}

// Thêm vào Booking model
model Booking {
  ...
  vehicle_type  String?  // "xe4cho" | "xe7cho" | "xevip"
  ...
}
```

Migration: `bun prisma migrate dev --name add_vnpay_payment_method`

---

## VNPay Sandbox Integration Notes

- Sandbox URL: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Required params: `vnp_Version`, `vnp_Command`, `vnp_TmnCode`, `vnp_Amount` (x100), `vnp_CurrCode=VND`, `vnp_TxnRef` (unique), `vnp_OrderInfo`, `vnp_ReturnUrl`, `vnp_IpAddr`, `vnp_CreateDate`, `vnp_SecureHash` (HMAC-SHA512)
- Return URL: `https://<your-domain>/api/v1/payments/vnpay/callback` — có thể dùng ngrok cho dev
- Sandbox credentials từ VNPay merchant portal (user cần cung cấp `TMN_CODE` + `HASH_SECRET`)
- Deep link scheme cho mobile return: `template://payment/vnpay/return` (scheme từ `app.json`)

---

## Env Variables Cần Thêm

### nestjs_prisma
```
VNPAY_TMN_CODE=<từ sandbox portal>
VNPAY_HASH_SECRET=<từ sandbox portal>
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://<ngrok-or-server>/api/v1/payments/vnpay/callback
```

### app_user
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:3000/api/v1
EXPO_PUBLIC_WS_URL=http://192.168.1.20:3000
```

---

## Rủi ro & Quyết định

1. **VNPay credentials**: Chưa có — T-0062 implement đầy đủ logic với placeholder credentials. User điền `TMN_CODE` + `HASH_SECRET` vào `.env` khi có để test end-to-end.
2. **Deep link scheme**: Đổi từ `template://` sang **`datxe://`**. Return URL: `datxe://payment/vnpay/return`. Cần update `scheme` trong `app.json`.
3. **VNPay redirect**: Dùng **`Linking.openURL`** (mở browser ngoài) — không cần `react-native-webview`. App lắng nghe deep link return qua `Linking.addEventListener`.
4. **T-0054 status**: T-0054 (Route display Mapbox) được list là "Planned/Created" nhưng git log cho thấy đã commit — T-0064 tiến hành bình thường.

---

## Thứ tự thực hiện đề xuất

```
1. T-0062 (BE Booking + Payment + VNPay) — unblock FE
2. T-0063 (BE Dispatch) — song song với T-0064 nếu có thể
3. T-0064 (FE Payment screen) — sau khi T-0062 sẵn sàng
4. T-0065 (FE ActiveTripScreen) — sau T-0064
```

---

## Out of Scope của Wave này

- app_taixe UI cho offer popup (T-0042) — driver nhận offer là task riêng
- Rating/review sau trip
- Refund flow
- Cash payment flow chi tiết (chỉ UI stub)
- Production VNPay credentials + webhook SSL
- Push notification (chỉ dùng WebSocket trong wave này)
