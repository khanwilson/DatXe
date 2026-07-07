# T-0062 Contract — BE: BookingModule + PaymentModule + VNPay Sandbox

**Phase**: Contracting  
**Model**: Sonnet  
**Created**: 2026-07-07  
**Depends on**: T-0002 (Prisma schema), T-0004 (WebSocket gateway), T-0050 (Goong service)

---

## Scope

### In Scope

1. **Prisma migration**
   - Thêm `VNPAY` vào `PaymentMethod` enum
   - Thêm `vehicle_type String?` vào `Booking` model
   - Chạy `bun prisma migrate dev --name add_vnpay_payment_method`
   - Regenerate Prisma Client

2. **BookingModule** (`api/modules/booking/`)
   - `POST /api/v1/bookings` — tạo booking mới (status = PENDING)
   - `GET /api/v1/bookings/:id` — lấy booking theo ID (chỉ owner hoặc assigned driver)
   - JWT auth guard trên cả 2 endpoints
   - Validate customer tồn tại, tọa độ hợp lệ

3. **PaymentModule** (`api/modules/payment/`)
   - `POST /api/v1/payments/vnpay/create-payment-url` — tạo VNPay payment URL
     - Tạo `Payment` record (status = PENDING, method = VNPAY)
     - Build VNPay URL với HMAC-SHA512 signature
     - Trả về `{ paymentUrl, txnRef }`
   - `GET /api/v1/payments/vnpay/callback` — IPN + return URL từ VNPay
     - Xác thực `vnp_SecureHash` (HMAC-SHA512)
     - Cập nhật `Payment.status` → SUCCESSFUL hoặc FAILED
     - Cập nhật `Booking.status` → PAYMENT_COMPLETED (nếu SUCCESSFUL)
     - Emit WebSocket event `booking.payment_success` tới room `booking:{bookingId}`
   - `GET /api/v1/payments/:bookingId` — lấy payment status của booking

4. **VNPay logic** (tự implement, không dùng package bên ngoài)
   - Build query string theo thứ tự alphabet
   - HMAC-SHA512 với `VNPAY_HASH_SECRET`
   - Verify signature khi nhận callback

5. **WebSocket event mới**
   - Thêm `emitPaymentSuccess(bookingId, data)` vào `websocket.gateway.ts`
   - Event name: `booking.payment_success`
   - Payload: `{ bookingId, bookingStatus, paymentStatus }`

6. **Env validation**
   - Thêm `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL`, `VNPAY_RETURN_URL` vào `env.validation.ts`
   - Cho phép placeholder (không hard-fail nếu rỗng — credentials chưa có)

7. **AppModule update**
   - Import `BookingModule` và `PaymentModule` vào `app.module.ts`

---

## Out of Scope

- `DispatchModule` — T-0063
- Driver assignment logic — T-0063
- Frontend changes — T-0064, T-0065
- `app_user`, `app_taixe` — KHÔNG chỉnh sửa
- Refund flow
- Cash payment processing
- Trip creation (T-0010)
- Auth API (T-0006)
- User/Driver profile APIs (T-0007)

---

## Allowed Files

```
nestjs_prisma/prisma/schema.prisma
nestjs_prisma/prisma/migrations/**                    (auto-generated)
nestjs_prisma/api/app.module.ts
nestjs_prisma/api/common/config/env.validation.ts
nestjs_prisma/api/common/websocket/websocket.gateway.ts
nestjs_prisma/api/modules/booking/booking.module.ts   (new)
nestjs_prisma/api/modules/booking/booking.controller.ts (new)
nestjs_prisma/api/modules/booking/booking.service.ts  (new)
nestjs_prisma/api/modules/booking/dto/create-booking.dto.ts (new)
nestjs_prisma/api/modules/booking/dto/booking-response.dto.ts (new)
nestjs_prisma/api/modules/payment/payment.module.ts   (new)
nestjs_prisma/api/modules/payment/payment.controller.ts (new)
nestjs_prisma/api/modules/payment/payment.service.ts  (new)
nestjs_prisma/api/modules/payment/vnpay.service.ts    (new)
nestjs_prisma/api/modules/payment/dto/create-payment.dto.ts (new)
nestjs_prisma/api/modules/payment/dto/payment-response.dto.ts (new)
nestjs_prisma/api/modules/payment/dto/vnpay-callback.dto.ts (new)
nestjs_prisma/api/config/vnpay.config.ts              (new)
nestjs_prisma/.env.example
.harness/tasks/T-0062/**
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

### GET /api/v1/bookings/:id
**Auth**: Bearer JWT (owner customer hoặc assigned driver)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "vehicle_type": "xe4cho",
    "estimated_price": "45000.00",
    "payment": null
  }
}
```

---

### POST /api/v1/payments/vnpay/create-payment-url
**Auth**: Bearer JWT (role: CUSTOMER)

**Request body**:
```json
{
  "bookingId": "uuid",
  "amount": 45000,
  "orderInfo": "Thanh toan don xe DatXe"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_...",
    "txnRef": "TXN-uuid-timestamp"
  }
}
```

---

### GET /api/v1/payments/vnpay/callback
**Auth**: None (VNPay server callback)

**Query params**: VNPay standard params (`vnp_TxnRef`, `vnp_ResponseCode`, `vnp_SecureHash`, ...)

**Response**: Redirect về `VNPAY_RETURN_URL` hoặc trả `200 OK` với `{ RspCode: "00" }` cho IPN

---

### GET /api/v1/payments/:bookingId
**Auth**: Bearer JWT

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "amount": "45000.00",
    "method": "VNPAY",
    "status": "PENDING",
    "transaction_id": null,
    "paid_at": null
  }
}
```

---

### WebSocket Event: booking.payment_success
**Room**: `booking:{bookingId}`

**Payload**:
```json
{
  "bookingId": "uuid",
  "bookingStatus": "PAYMENT_COMPLETED",
  "paymentStatus": "SUCCESSFUL"
}
```

---

## Database Impact

### Prisma schema changes
```prisma
enum PaymentMethod {
  CASH
  CARD
  WALLET
  VNPAY    // thêm mới
}

model Booking {
  // thêm field:
  vehicle_type  String?
}
```

### Migration
- Tên: `add_vnpay_payment_method`
- Không phá vỡ dữ liệu hiện có (enum thêm giá trị mới, field nullable)
- Cần chạy `bun prisma generate` sau migrate để regenerate client

---

## Env Variables

### Thêm vào `.env.example`
```
VNPAY_TMN_CODE=your_tmn_code_here
VNPAY_HASH_SECRET=your_hash_secret_here
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/v1/payments/vnpay/callback
```

### Validation policy
- `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`: optional tại validation (placeholder OK)
- VNPayService log warning nếu credentials rỗng, không throw khi boot

---

## Acceptance Criteria

- [ ] `POST /bookings` tạo Booking với status PENDING, trả về bookingId
- [ ] `GET /bookings/:id` trả về booking đúng owner (401 nếu sai user)
- [ ] `POST /payments/vnpay/create-payment-url` tạo Payment record + trả về URL hợp lệ (có `vnp_SecureHash`)
- [ ] `GET /payments/vnpay/callback` với `vnp_ResponseCode=00` cập nhật Payment SUCCESSFUL + Booking PAYMENT_COMPLETED
- [ ] `GET /payments/vnpay/callback` với `vnp_ResponseCode` khác 00 cập nhật Payment FAILED
- [ ] `booking.payment_success` WS event được emit khi callback thành công
- [ ] `GET /payments/:bookingId` trả đúng status
- [ ] Prisma migration chạy thành công, không mất data
- [ ] `bun run build` pass (không có TypeScript errors)
- [ ] `bun run lint` pass
- [ ] Không có hard-coded credentials, không commit `.env`
- [ ] `.env.example` updated với VNPay keys

---

## Test Strategy

- Không có test framework — kiểm tra bằng build + lint
- Implementer verify logic bằng manual review của VNPay signature building
- Callback endpoint có thể test với curl bằng mock params (không cần VNPay thật)

---

## Implementation Constraints

- Follow NestJS module pattern đã có (xem `api/modules/routes/` làm reference)
- Dùng `PrismaService` từ `common` (nếu có) hoặc inject trực tiếp
- Dùng `ConfigService` để đọc env — không đọc `process.env` trực tiếp trong service
- Response format phải dùng `ApiResponse<T>` wrapper (theo T-0005 interceptor)
- JWT guard: `@UseGuards(JwtAuthGuard)` từ `common/guards/jwt-auth.guard.ts`
- Không thêm `npm` package mới (tự implement VNPay HMAC — chỉ cần Node built-in `crypto`)
