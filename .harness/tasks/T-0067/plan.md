# T-0067 Plan — Wave Trip Flow: Sau Payment → Driver → Hoàn Thành

**Phase**: Planning  
**Model**: Opus (wave planning, multi-project, architecture boundary)  
**Created**: 2026-07-07

---

## Mục tiêu Wave

Wire luồng thật từ sau khi user thanh toán thành công đến khi hoàn thành chuyến xe, cross 3 project:

1. **Tìm tài xế**: 3 vòng quét bán kính 5/10/15km, mỗi vòng 30s timeout, offer 15s
2. **Tài xế nhận cuốc → pickup**: app_user + app_taixe chuyển sang giao diện "map pickup"
3. **Tài xế đến nơi đón → map goal**: app_user hiện "đã đến", app_taixe hiện nút "bắt đầu hành trình"
4. **Hành trình → dropping off**: app_user tổng quan, app_taixe tổng quan + dẫn đường
5. **Hoàn thành**: tài xế bấm "đã đến đích", user nhận thông báo cảm ơn

---

## Phân tích hiện trạng

### Đã có (Done)
- T-0004: WebSocket gateway (Socket.IO + JWT auth, room helpers, event emitters)
- T-0002: Prisma schema — Booking, Trip, Payment, DispatchOffer, Driver, Customer + đầy đủ enums
- T-0050: Goong API service backend (routing, places, geocoding)
- T-0051/T-0052/T-0053/T-0054: app_user Mapbox + Goong integration
- T-0036: ActiveTripScreen app_user — **mocked lifecycle** (FINDING → ASSIGNED → ARRIVED → IN_PROGRESS → COMPLETED), UI patterns có thể tái dùng
- T-0003: Redis connection + cache service

### Planned nhưng chưa chạy (liên quan wave này)
- T-0062: BE Booking + Payment + VNPay Module (prerequisite cho dispatch)
- T-0063: BE Dispatch Module (find nearest driver — scope cơ bản)
- T-0064: FE app_user Booking submit + Payment screen
- T-0065: FE app_user ActiveTripScreen sau payment — **bị supersede bởi T-0071**
- T-0055: Mapbox setup app_taixe — **prerequisite cho T-0069**
- T-0058: Port auth flow app_taixe — **prerequisite cho T-0069**
- T-0035: Booking confirmation + payment UI app_user — **bị supersede bởi T-0064**
- T-0042/T-0043/T-0044: app_taixe offer/navigation/trip — **bị supersede bởi T-0070**

### Chưa có
- Driver location broadcast (tài xế bắn GPS mỗi 30s)
- Dispatch logic nâng cao (3 vòng quét bán kính tăng dần)
- Offer timeout 15s + retry khi từ chối
- Trip lifecycle endpoints (start, complete)
- WebSocket events cho trip state transitions
- app_taixe: Mapbox, auth, dashboard, offer UI, trip flow UI
- app_user: wire thật payment → dispatch → realtime tracking

---

## Task cũ bị supersede

| Task | Title | Lý do supersede |
|------|-------|-----------------|
| T-0035 | Booking confirmation & payment UI app_user | T-0064 (Wave VNPay) cover booking submit + payment. T-0035 chỉ có plan, chưa implement |
| T-0042 | Booking offers & acceptance UI app_taixe | T-0070 cover offer popup + toàn bộ trip flow app_taixe |
| T-0043 | Navigation to pickup with routing app_taixe | T-0070 cover map pickup + dẫn đường |
| T-0044 | Trip in progress & routing display app_taixe | T-0070 cover dropping off + complete |
| T-0065 | FE app_user ActiveTripScreen sau payment | T-0071 cover toàn bộ trip flow app_user (looking → pickup → dropping → complete) |

**Action**: Đánh dấu T-0035, T-0042, T-0043, T-0044, T-0065 = **Cancelled (superseded by Wave T-0067)** trong TASKS.md.

---

## Kiến trúc luồng

```
app_user                          nestjs_prisma                        app_taixe
────────                          ──────────────                        ─────────
                                  [T-0062: Payment confirmed]
                                  │ emit booking.payment_success
                                  ▼
                                  [T-0063/0068: Dispatch]
                                  │ Vòng 1: radius=5km, timeout=30s
                                  │   → query drivers trong bán kính
                                  │   → emit driver.new_offer → room driver:{id}
                                  │   → tài xế có 15s nhận/từ chối
                                  │   │
                                  │   ├─ Accept → Booking.status=ACCEPTED
                                  │   │           Trip.status=CREATED
                                  │   │           emit booking.driver_assigned
                                  │   │           → cả 2 app navigate map_pickup
                                  │   │
                                  │   └─ Reject/Timeout → tìm driver tiếp
                                  │
                                  │ Vòng 2: radius=10km (nếu chưa tìm được)
                                  │ Vòng 3: radius=15km (nếu chưa tìm được)
                                  │ Hết 3 vòng → emit booking.no_driver_found

─── MAP PICKUP (pickuping) ────────────────────────────────────────────────────
app_user:                         app_taixe:
Tổng quan map                     Đã nhận cuốc:
  routing tài xế → điểm đón         2 chế độ:
  + driver marker realtime          1. Tổng quan: map full routing
  + ETA                             2. Dẫn đường: turn-by-turn
                                    + Nút "Đã đến nơi đón"

─── DRIVER ARRIVED ────────────────────────────────────────────────────────────
app_user: "Tài xế đã đến"          app_taixe: map_goal
                                    routing điểm đón → đích
                                    + Nút "Bắt đầu hành trình"

─── DROPPING OFF ──────────────────────────────────────────────────────────────
app_user: Tổng quan toàn bộ        app_taixe: 2 chế độ
  hành trình trên 1 màn hình         1. Tổng quan: full routing
                                      2. Dẫn đường: turn-by-turn
                                    + Khi gần đích → hiện nút "Đã đến đích"

─── COMPLETED ─────────────────────────────────────────────────────────────────
app_user: "Đã đến nơi,             app_taixe: Xác nhận hoàn thành
  cảm ơn bạn"                        Trip.status=COMPLETED
```

---

## Cấu trúc Task Wave

### T-0067 (file này) — Master Plan
Tài liệu tổng thể, dependency map, không implement gì.

---

### T-0068 — BE: Driver Location & Dispatch Enhancement
**Project**: `nestjs_prisma`
**Depends on**: T-0063 (Dispatch module cơ bản)
**Scope**:
- `PATCH /drivers/location` — nhận lat/lng/heading từ app_taixe, lưu Redis Geo + DB
- Driver location broadcast: khi tài xế online, emit `driver.location_updated` mỗi 30s (client-side) hoặc server push
- Dispatch enhancement:
  - 3 vòng quét: radius [5, 10, 15] km, timeout [30, 30, 30]s
  - Offer timeout: 15s (tài xế phải nhận/từ chối trong 15s)
  - Khi từ chối → tìm driver tiếp trong vòng hiện tại
  - Khi hết vòng → tăng bán kính, tìm tiếp
  - Hết 3 vòng → emit `booking.no_driver_found`
- WebSocket events mới:
  - `driver.location_updated` — server → app_user (realtime driver position)
  - `booking.driver_assigned` — server → cả 2 app (driver info + pickup routing)
  - `booking.driver_rejected` — server → internal (retry dispatch)
  - `booking.no_driver_found` — server → app_user
  - `trip.status_changed` — server → cả 2 app (ARRIVED, IN_PROGRESS, COMPLETED)
- Trip lifecycle endpoints:
  - `PATCH /trips/:id/driver-arrived` — tài xế xác nhận đến nơi đón
  - `PATCH /trips/:id/start` — tài xế bắt đầu hành trình
  - `PATCH /trips/:id/complete` — tài xế xác nhận đến đích
- Prisma: thêm `DispatchOffer.expires_at` (DateTime), `Driver.last_location` (Json? {lat, lng, heading, updated_at})

**Allowed Files**: `nestjs_prisma/src/modules/dispatch/`, `nestjs_prisma/src/modules/trip/`, `nestjs_prisma/src/modules/driver/`, `nestjs_prisma/prisma/schema.prisma`

---

### T-0069 — FE app_taixe: Foundation (Mapbox + Auth + Dashboard)
**Project**: `app_taixe`
**Depends on**: T-0055 (Mapbox setup), T-0058 (Auth port)
**Scope**: Covers T-0055 + T-0058 + T-0041 (driver dashboard):
- Cài `@rnmapbox/maps` cho app_taixe (T-0055)
- Port auth flow phone+OTP từ app_user (T-0058)
- Driver dashboard:
  - Toggle online/offline
  - Khi online: bắn GPS lên `PATCH /drivers/location` mỗi 30s
  - Hiện trạng thái: đang online/offline, số cuốc hôm nay
  - Lắng nghe WS `driver.new_offer` → navigate sang offer screen
- Mapbox map component cho app_taixe (tái dùng pattern từ app_user)
- i18n keys cho dashboard

**Allowed Files**: `app_taixe/` (toàn bộ)

---

### T-0070 — FE app_taixe: Trip Flow (Offer → Pickup → Dropoff → Complete)
**Project**: `app_taixe`
**Depends on**: T-0069, T-0068
**Scope**: Covers T-0042 + T-0043 + T-0044:
- **Offer screen**:
  - Nhận WS `driver.new_offer` → hiện popup với thông tin khách (pickup, destination, fare)
  - Countdown 15s
  - Nút "Nhận cuốc" / "Từ chối"
  - Nếu timeout → tự từ chối, emit `driver.offer_rejected`
- **Map Pickup screen** (sau khi nhận):
  - Mapbox map full screen
  - Routing: vị trí tài xế → điểm đón khách
  - Driver marker (vị trí hiện tại) + pickup marker
  - 2 chế độ:
    1. **Tổng quan**: fit bounds toàn bộ routing
    2. **Dẫn đường**: camera follow driver, zoom gần (mock turn-by-turn nếu chưa có Navigation SDK)
  - Nút "Đã đến nơi đón" → emit `PATCH /trips/:id/driver-arrived`
- **Map Goal screen** (sau khi đến đón + user lên xe):
  - Routing: điểm đón → điểm đến
  - 2 chế độ: tổng quan + dẫn đường
  - Nút "Bắt đầu hành trình" → emit `PATCH /trips/:id/start`
  - Khi gần đích (< 200m) → hiện nút "Đã đến đích"
- **Complete screen**:
  - Bấm "Đã đến đích" → emit `PATCH /trips/:id/complete`
  - Hiện xác nhận hoàn thành + doanh thu cuốc này
- **Chờ nhận cuốc (trước khi accept)**:
  - Map tổng quan nhỏ + thông tin offer
  - Countdown timer

**Allowed Files**: `app_taixe/` (toàn bộ)

---

### T-0071 — FE app_user: Trip Flow (Looking → Pickup → Dropoff → Complete)
**Project**: `app_user`
**Depends on**: T-0064 (payment screen), T-0068
**Scope**: Covers T-0065 + extends T-0036's patterns:
- **Looking Driver screen** (sau payment success):
  - Spinner animation + "Đang tìm tài xế..."
  - Hiện vòng quét hiện tại (1/3, 2/3, 3/3) + bán kính
  - Lắng nghe WS `booking.driver_assigned` → navigate map_pickup
  - Lắng nghe WS `booking.no_driver_found` → hiện thông báo + nút thử lại
- **Map Pickup screen**:
  - Mapbox map tổng quan
  - Routing: vị trí tài xế → điểm đón
  - Driver marker realtime (nhận WS `driver.location_updated`)
  - ETA countdown
  - Bottom sheet: thông tin tài xế (tên, xe, biển số, rating)
- **Driver Arrived**:
  - Notification banner "Tài xế đã đến nơi đón"
  - Lắng nghe WS `trip.status_changed` (ARRIVED → IN_PROGRESS)
- **Dropping Off screen**:
  - Mapbox map tổng quan: toàn bộ hành trình (điểm đón → đích)
  - Driver marker realtime
  - Bottom sheet: ETA đến đích, khoảng cách còn lại
- **Completed screen**:
  - "Đã đến nơi, cảm ơn bạn đã sử dụng dịch vụ"
  - Nút "Quay về trang chủ"
  - Tóm tắt cuốc xe (fare, distance, duration)

**Allowed Files**: `app_user/` (toàn bộ)

---

### T-0072 — Integration & Realtime Wiring
**Project**: cross-project (app_user + app_taixe + nestjs_prisma)
**Depends on**: T-0068, T-0070, T-0071
**Scope**:
- Wire WebSocket events thật vào cả 2 app (thay mock data)
- Test end-to-end flow: payment → dispatch → offer → pickup → trip → complete
- Verify driver location realtime trên map app_user
- Fix integration issues (API contract mismatch, WS event naming, state sync)
- Error handling: mất kết nối WS, driver offline giữa chừng, timeout

**Allowed Files**: `app_user/`, `app_taixe/`, `nestjs_prisma/`

---

## Dependency Graph

```
Wave VNPay (existing):
  T-0062 (BE Booking + Payment)
    └─→ T-0063 (BE Dispatch cơ bản)
    └─→ T-0064 (FE app_user Payment)

Wave Trip Flow (new):
  T-0063 + T-0062
    └─→ T-0068 (BE Dispatch Enhancement + Trip Lifecycle)
          ├─→ T-0070 (app_taixe Trip Flow)
          └─→ T-0071 (app_user Trip Flow)

  T-0055 (Mapbox app_taixe) + T-0058 (Auth app_taixe)
    └─→ T-0069 (app_taixe Foundation)
          └─→ T-0070

  T-0064 (FE Payment)
    └─→ T-0071

  T-0068 + T-0070 + T-0071
    └─→ T-0072 (Integration)
```

---

## WebSocket Events Contract

| Event | Emitter | Receiver | Payload |
|-------|---------|----------|---------|
| `booking.payment_success` | BE PaymentModule | BE DispatchModule | `{ bookingId, customerId, pickup: {lat, lng}, destination: {lat, lng}, vehicleType, fare }` |
| `driver.new_offer` | BE DispatchModule | app_taixe (room `driver:{id}`) | `{ offerId, bookingId, pickup: {address, lat, lng}, destination: {address}, fare, expiresAt }` |
| `driver.offer_response` | app_taixe | BE DispatchModule | `{ offerId, accepted: boolean }` |
| `booking.driver_assigned` | BE DispatchModule | app_user + app_taixe | `{ bookingId, driver: {name, phone, vehicle, plate, rating, lat, lng}, pickup, destination, fare }` |
| `booking.no_driver_found` | BE DispatchModule | app_user | `{ bookingId, message }` |
| `driver.location_updated` | BE (relay from app_taixe) | app_user (room `booking:{id}`) | `{ driverId, lat, lng, heading, eta }` |
| `trip.status_changed` | BE TripModule | app_user + app_taixe | `{ tripId, status: 'DRIVER_ARRIVED' \| 'IN_PROGRESS' \| 'COMPLETED', eta?, distance? }` |

---

## API Endpoints bổ sung (T-0068)

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/api/v1/drivers/location` | Cập nhật vị trí tài xế (lat, lng, heading) |
| GET | `/api/v1/drivers/:id/location` | Query vị trí tài xế (cho app_user) |
| PATCH | `/api/v1/trips/:id/driver-arrived` | Tài xế xác nhận đến nơi đón |
| PATCH | `/api/v1/trips/:id/start` | Tài xế bắt đầu hành trình |
| PATCH | `/api/v1/trips/:id/complete` | Tài xế xác nhận đến đích |
| POST | `/api/v1/dispatch/:bookingId/retry` | Manual retry dispatch (khi hết 3 vòng) |

---

## Trip States & Transitions

```
                    payment_success
                         │
                    LOOKING_DRIVER
                    (3 vòng quét)
                         │
              ┌──────────┴──────────┐
              │ driver_assigned      │ no_driver_found
              ▼                      ▼
         PICKUPING              NO_DRIVER
         (map_pickup)           (retry or cancel)
              │
         driver_arrived
              │
              ▼
         WAITING_BOARDING
         (user lên xe)
              │
         trip.start
              │
              ▼
         DROPPING_OFF
         (map_goal)
              │
         trip.complete
              │
              ▼
         COMPLETED
```

**BookingStatus transitions**:
```
PAYMENT_COMPLETED → LOOKING_DRIVER → ACCEPTED → DRIVER_ARRIVING → IN_PROGRESS → COMPLETED
                                       │
                                       └─ (reject/timeout) → LOOKING_DRIVER (retry)
```

**TripStatus transitions**:
```
CREATED → DRIVER_EN_ROUTE → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED
```

---

## Prisma Changes (T-0068)

```prisma
// DispatchOffer — thêm expires_at
model DispatchOffer {
  ...
  expires_at  DateTime?  // thời điểm offer hết hạn (15s)
  ...
}

// Driver — thêm last_location
model Driver {
  ...
  last_location Json?  // { lat: Float, lng: Float, heading: Float, updated_at: DateTime }
  ...
}

// BookingStatus — thêm LOOKING_DRIVER
enum BookingStatus {
  PENDING
  CONFIRMED
  PAYMENT_COMPLETED
  LOOKING_DRIVER    // NEW — đang tìm tài xế
  ACCEPTED
  DRIVER_ARRIVING   // renamed từ DRIVER_EN_ROUTE
  DRIVER_ARRIVED    // NEW — tài xế đã đến nơi đón
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_DRIVER         // NEW — không tìm được tài xế
  PAYMENT_PENDING
  NO_SHOW
}
```

---

## Thứ tự thực hiện

```
Phase 1 — Foundation (song song):
  T-0062 (BE Booking + Payment) ← Wave VNPay, chạy trước
  T-0055 (Mapbox app_taixe)
  T-0058 (Auth app_taixe)

Phase 2 — BE Enhancement:
  T-0063 (BE Dispatch cơ bản)
    └─→ T-0068 (BE Dispatch Enhancement + Trip Lifecycle)

Phase 3 — FE Foundation:
  T-0064 (FE app_user Payment)
  T-0069 (app_taixe Foundation = T-0055 + T-0058 + Dashboard)

Phase 4 — Trip Flow FE (song song):
  T-0070 (app_taixe Trip Flow) ← depends T-0068 + T-0069
  T-0071 (app_user Trip Flow) ← depends T-0068 + T-0064

Phase 5 — Integration:
  T-0072 (Integration & Realtime Wiring) ← depends T-0068 + T-0070 + T-0071
```

---

## Out of Scope

- Rating/review sau trip
- Refund flow
- Cash payment chi tiết (chỉ stub)
- Push notification (chỉ dùng WebSocket)
- Turn-by-turn navigation thật (Mapbox Navigation SDK) — mock UI, camera follow
- Driver chat/call với khách (chỉ UI stub)
- Multiple stops / waypoint
- Surge pricing / dynamic fare
- Admin dashboard

---

## Rủi ro & Quyết định

1. **T-0062/T-0063/T-0064 chưa chạy**: Wave này phụ thuộc Wave VNPay. Nếu Wave VNPay chưa xong, T-0068/T-0070/T-0071 cần mock BE hoặc chạy song song.
2. **Driver location realtime**: 30s interval có thể gây lag trên map. Có thể interpolate vị trí driver giữa 2 lần update.
3. **Dispatch timeout**: 30s/vòng × 3 vòng = 90s tối đa. Nếu không tìm được, user phải retry manual.
4. **Offer 15s**: Tài xế cần notification + sound để không miss. Hiện tại chỉ WS, chưa có push notification.
5. **Mapbox Navigation SDK**: Chưa tích hợp. Chế độ "dẫn đường" sẽ mock bằng camera follow driver marker + route polyline highlight.
6. **Prisma migration**: Thêm `LOOKING_DRIVER`, `DRIVER_ARRIVED`, `NO_DRIVER` vào BookingStatus cần migration. Có thể break existing data nếu có booking cũ.
7. **app_taixe chưa có Mapbox**: T-0055 + T-0069 cần chạy trước T-0070. Đây là dependency chain dài.

---

## Task cũ cần cập nhật trong TASKS.md

| Task | Action |
|------|--------|
| T-0035 | Cancelled (superseded by T-0064 + T-0071) |
| T-0042 | Cancelled (superseded by T-0070) |
| T-0043 | Cancelled (superseded by T-0070) |
| T-0044 | Cancelled (superseded by T-0070) |
| T-0065 | Cancelled (superseded by T-0071) |
| T-0067 | New — Master Plan |
| T-0068 | New — BE Dispatch Enhancement |
| T-0069 | New — app_taixe Foundation |
| T-0070 | New — app_taixe Trip Flow |
| T-0071 | New — app_user Trip Flow |
| T-0072 | New — Integration |
