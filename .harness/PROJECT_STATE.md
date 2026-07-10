# Project State

**Last Updated**: 2026-07-09
**Purpose**: Index của API contracts, Prisma models, và env vars đang chạy. Rules/decisions ở `DECISIONS.md`, task list ở `TASKS.md`.

---

## Active API Contracts

### Authentication API (T-0074)
- **POST /api/v1/auth/otp/request** — Request OTP (DEV: logs `000000`, no SMS sent)
  - Body: `{ "phone": "+84912345678" }` (E.164 VN)
  - Response: `{ "success": true, "expiresIn": 300 }`
- **POST /api/v1/auth/otp/verify** — Verify OTP, find-or-create User, issue token pair
  - Body: `{ "phone": "+84912345678", "code": "000000" }`
  - Response: `{ "accessToken": "eyJ...", "refreshToken": "uuid", "user": { "id", "phone", "name", "email", "role" } }`
- **POST /api/v1/auth/refresh** — Rotate refresh token, issue new pair
  - Body: `{ "refreshToken": "uuid" }`
  - Response: `{ "accessToken": "eyJ...", "refreshToken": "new-uuid" }`
- **POST /api/v1/auth/logout** — Invalidate refresh token
  - Body: `{ "refreshToken": "uuid" }`
  - Response: `{ "success": true }`
- JWT payload `{ sub, phone, role }`, 1d expiry. Refresh tokens in Redis, key `refresh_token:<uuid>`, 30d TTL, rotation on refresh. DEV bypass `000000`; prod SMS provider TBD.

### Booking API (T-0062)
- **POST /api/v1/bookings** — tạo booking mới (JWT required)
- **GET /api/v1/bookings/:id** — lấy booking theo id (JWT required)

### Payment API (T-0062, T-0075)
- **POST /api/v1/payments/vnpay** — tạo VNPay payment URL
  - Body: `{ "booking_id": "uuid", "amount": 45000, "order_info": "DatXe Booking ...", "client_ip": "127.0.0.1" }` (all required)
  - Response: `{ "payment_id": "uuid", "transaction_id": "txn_...", "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..." }`
  - Signing: deterministic RFC3986 encoding (`encodeURIComponent`), `%20` for spaces, sorted param keys. Signed string is byte-identical to URL query for callback verification (T-0075 D-0012).
- **GET /api/v1/payments/vnpay/callback** — VNPay callback (no auth). Query: `vnp_TxnRef`, `vnp_SecureHash`, etc. Backend re-signs and verifies hash, updates `Payment.status → SUCCESSFUL/FAILED`, `Booking.status → PAYMENT_COMPLETED/CANCELLED`, emits WS `booking.payment_success`.
- **GET /api/v1/payments/:bookingId** — lấy payment status (JWT required). Response: `{ "status": "SUCCESSFUL|FAILED|PENDING" }` (used by app_user poll during PAYMENT state).

### Dispatch API (T-0063)
- **PATCH /api/v1/drivers/location** — cập nhật vị trí tài xế (JWT driver required). Body: `{ lat, lng, heading? }`

### Routes API (T-0050, Goong-backed)
- `/api/v1/routes/*` — routing/places/geocode qua `GoongService`. `driving→car`, `walking→bike`; `transit` bị reject.

### WebSocket Events (T-0072: FE↔BE aligned)
| Event | Direction | Room | Payload | Trigger |
|-------|-----------|------|---------|---------|
| `booking.payment_success` | Server → app_user | `booking:{id}` | `{ transactionId, bookingId }` | VNPay callback success |
| `driver.new_offer` | Server → app_taixe | `driver:{driverPk}` | flat: `{ offerId, bookingId, pickupAddress, dropoffAddress, estimatedPrice, vehicleType, distanceKm, expiresAt, pickupLat, pickupLng }` (FE maps to nested) | Dispatch chọn driver |
| `driver.offer_response` | app_taixe → Server | — | `{ offerId, accepted }` | Driver accept/reject |
| `booking.driver_assigned` | Server → both | `booking:{id}`, `driver:{driverPk}` | nested BE: `{ bookingId, tripId, driver: { id, name, phone, vehicleType, vehiclePlate, rating, lat, lng } }` (FE flattens to `{ driverName, driverPhone, vehicleModel, driverLat, driverLng, ... }`) | Driver accepted |
| `trip.status_changed` | Server → both | `booking:{id}`, `driver:{driverPk}` | `{ tripId, bookingId, status }` | Trip lifecycle (DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED) |
| `driver.location_updated` | Server → app_user | `booking:{id}` | `{ driverId, lat, lng, heading \| null }` (driverId = Driver PK, resolved root-cause at emit) | Driver moves during active trip |
| `booking.no_driver_found` | Server → app_user | `booking:{id}` | `{ bookingId }` | Hết 3 vòng retry |
| `join` | app_user → Server | `booking:{id}` | room name (FE emits after connect handshake) | Passenger joins booking room |
| `leave` | app_user → Server | any room | room name | Passenger leaves room (cleanup) |
| `(auto-join on connect)` | — | `user:{id}`, `driver:{driverPk}` | — | Driver auto-joins `driver:` room; all users join `user:` room |

---

## Active Prisma Models & Conventions

**Conventions** (xem D-0002): PascalCase model, camelCase field, snake_case table via `@@map`, `uuid() @id`, `Decimal @db.Decimal(10,2)` cho tiền, cascade delete cho 1:1 dependent (User→Customer, User→Driver), timestamps `created_at`/`updated_at`.

**Enum imports** (xem D-0009): luôn `import { ... } from '@prisma/client'`, không hardcode string.

### Models (9)

| Model | Table | Purpose | Key Relations |
|-------|-------|---------|---------------|
| **User** | users | Base user account with role | → Customer?, Driver? |
| **Customer** | customers | Customer profile | → User (cascade), → Booking[] |
| **Driver** | drivers | Driver profile + location | → User (cascade), → Vehicle?, → Booking[] |
| **Vehicle** | vehicles | Driver's vehicle info | → Driver |
| **Booking** | bookings | Ride booking lifecycle | → Customer, → Driver?, → Trip?, → Payment? |
| **Trip** | trips | Active/completed trip tracking | → Booking, → Driver, → Customer |
| **Payment** | payments | Booking payment record | → Booking |
| **DispatchOffer** | dispatch_offers | Driver offer dispatching | → Booking, → Driver |
| **AuditLog** | audit_logs | Entity state change tracking | (entity_type + entity_id) |

### Enums (9)
- **UserRole**: CUSTOMER, DRIVER, ADMIN
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **DriverStatus**: ONLINE, OFFLINE, SUSPENDED
- **VehicleType**: CAR, MOTORBIKE
- **BookingStatus**: PENDING, CONFIRMED, ACCEPTED, DRIVER_ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED, PAYMENT_PENDING, PAYMENT_COMPLETED, NO_SHOW, LOOKING_DRIVER, DRIVER_ARRIVED, NO_DRIVER
- **TripStatus**: CREATED, DRIVER_EN_ROUTE, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, SUCCESSFUL, FAILED, REFUNDED
- **PaymentMethod**: CASH, CARD, WALLET
- **OfferStatus**: PENDING, ACCEPTED, REJECTED, EXPIRED

---

## Environment Variables & Secrets

### nestjs_prisma
- `GOONG_API_KEY` — Goong API key cho routing/places/geocode (T-0050). Config throws hard on missing key at boot.
- `GOONG_BASE_URL` — default `https://rsapi.goong.io`.
- `GOOGLE_MAPS_API_KEY` / `GOOGLE_MAPS_BASE_URL` — **legacy**, không còn wired vào `RoutesModule`. Gỡ ở T-0056.

### app_user
- `GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY` — Google Maps SDK key inject qua `app.config.ts` (T-0034). Build-time only, KHÔNG prefix `EXPO_PUBLIC_`. Trên EAS: set làm secrets/env.
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (`pk.`) — runtime, `Mapbox.setAccessToken()` ở app entry.
- `MAPBOX_DOWNLOAD_TOKEN` (`sk.`) — build-time, inject vào config plugin `RNMapboxMapsDownloadToken`.
- **Build model**: app_user cần **development build / `expo prebuild`** — Expo Go không chạy được (react-native-maps + rnmapbox native modules).

### app_taixe
- Mapbox tokens tương tự app_user (T-0055).
