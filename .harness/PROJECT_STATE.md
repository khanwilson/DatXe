# Project State

**Last Updated**: 2026-07-08  
**Harness Version**: 1.0

---

## Architecture Overview

### Projects

| Project | Role | Status | Tech Stack |
|---------|------|--------|-----------|
| **app_taixe** | Mobile app for drivers | Active | React Native + Expo + TypeScript |
| **app_user** | Mobile app for customers | Active | React Native + Expo + TypeScript |
| **nestjs_prisma** | Backend API | Active | NestJS + Prisma + TypeScript |

### Deployment Model

- **Frontend**: React Native apps (iOS/Android via Expo)
- **Backend**: NestJS REST API
- **Database**: Managed via Prisma ORM
- **Authentication**: Phone + OTP with JWT (1d) + refresh token (30d, Redis-backed, rotation)
- **Deployment**: [To be documented when implemented]

---

## Completed Capabilities

- [x] User registration (driver & customer) - T-0002 schema ready
- [x] User authentication - T-0001 + T-0002 + T-0074 JWT with phone+role, Redis-backed refresh tokens
- [x] Phone + OTP auth flow end-to-end - T-0074 (backend 4 endpoints + auth guard + refresh interceptor in both apps)
- [x] Customer home + map screen (current location, search UI) - T-0034 (app_user)
- [x] WebSocket gateway (Socket.IO with JWT auth) - T-0004
- [x] Goong Places Autocomplete integration - T-0053 (app_user)
- [x] Booking create API (POST /bookings) - T-0062 (nestjs_prisma)
- [x] VNPay sandbox payment integration - T-0062 (nestjs_prisma)
- [x] Driver location update API (PATCH /drivers/location) - T-0063 (nestjs_prisma)
- [x] Dispatch module — 3-round sweep, offer WS, Trip creation - T-0063 (nestjs_prisma)
- [ ] Driver profile management
- [ ] Customer profile management
- [ ] Ride tracking
- [ ] Rating & review system

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
- **Status**: Implemented (T-0074). JWT payload `{ sub, phone, role }`, 1d expiry. Refresh tokens in Redis with 30d TTL, key `refresh_token:<uuid>`, rotation on refresh. DEV bypass code `000000`; production rejects all codes (SMS provider TBD).

### Booking API (T-0062)
- **POST /api/v1/bookings** — tạo booking mới (JWT required)
- **GET /api/v1/bookings/:id** — lấy booking theo id (JWT required)
- **Status**: Implemented (T-0062)

### Payment API (T-0062)
- **POST /api/v1/payments/vnpay** — tạo VNPay payment URL
- **GET /api/v1/payments/vnpay/callback** — VNPay callback (no auth)
- **GET /api/v1/payments/:bookingId** — lấy payment status
- **Status**: Implemented (T-0062)

### Dispatch API (T-0063)
- **PATCH /api/v1/drivers/location** — cập nhật vị trí tài xế (JWT driver required)
  - Body: `{ lat, lng, heading? }`
- **Status**: Implemented (T-0063)

### WebSocket Events (T-0062 + T-0063)
| Event | Direction | Room | Trigger |
|-------|-----------|------|---------|
| `booking.payment_success` | Server → app_user | `booking:{id}` | VNPay callback success |
| `driver.new_offer` | Server → app_taixe | `driver:{id}` | Dispatch chọn driver |
| `driver.offer_response` | app_taixe → Server | — | Driver accept/reject |
| `booking.driver_assigned` | Server → both | `booking:{id}`, `driver:{id}` | Driver accepted |
| `booking.no_driver_found` | Server → app_user | `booking:{id}` | Hết 3 vòng |

---

## Active Prisma Models & Database Conventions

### Conventions
- **Naming**: PascalCase for models, camelCase for fields
- **Table Names**: snake_case via @@map("...")
- **Timestamps**: created_at (DateTime @default(now())), updated_at (DateTime @updatedAt)
- **ID Type**: uuid() via @id @default(uuid())
- **Price Fields**: Decimal @db.Decimal(10, 2) for monetary values
- **Relations**: Cascade delete for dependent relations (User→Customer, User→Driver), nullable for optional foreign keys
- **Indexes**: Applied on frequent query columns (status, driver_id, customer_id, etc.)

### Models (9 models, 9 enums)

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
| **AuditLog** | audit_logs | Entity state change tracking | None (entity_type + entity_id) |

### Enums
- **UserRole**: CUSTOMER, DRIVER, ADMIN
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **DriverStatus**: ONLINE, OFFLINE, SUSPENDED
- **VehicleType**: CAR, MOTORBIKE
- **BookingStatus**: PENDING, CONFIRMED, ACCEPTED, DRIVER_ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED, PAYMENT_PENDING, PAYMENT_COMPLETED, NO_SHOW, LOOKING_DRIVER (T-0063), DRIVER_ARRIVED (T-0063), NO_DRIVER (T-0063)
- **TripStatus**: CREATED, DRIVER_EN_ROUTE, DRIVER_ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, SUCCESSFUL, FAILED, REFUNDED
- **PaymentMethod**: CASH, CARD, WALLET
- **OfferStatus**: PENDING, ACCEPTED, REJECTED, EXPIRED

---

## Shared Conventions

### Code Style
- **Language**: TypeScript with strict mode
- **Linting**: ESLint (if configured in projects)
- **Formatting**: Prettier (if configured in projects)
- **Type Checking**: TypeScript strict

### Folder Structure
- `src/` - Source code
- `src/types/` - Shared types
- `src/components/` - React components (mobile apps)
- `src/services/` - Business logic
- `src/modules/` - NestJS modules

### Error Handling
- [To be documented]

### Logging
- [To be documented]

### Permissions (Mobile Apps)
- **Xin quyền theo ngữ cảnh (just-in-time)**, không gom hết vào onboarding.
- Onboarding (app_user) chỉ xin quyền tối thiểu để đặt xe: **Location (foreground)** + **Notifications**. Wired in `app_user/app/onboarding/permissions.tsx` qua `expo-location` + `expo-notifications` (T-0032.2).
- Permission request là **non-blocking**: allow/deny đều cho user đi tiếp; kiểm tra lại quyền tại điểm sử dụng thực.
- Quyền khác xin tại đúng màn dùng: Contacts → màn liên hệ; Camera/Photo Library → màn đổi profile.
- Location: foreground cho app_user (khách); background dành cho app_taixe (tài xế) khi triển khai.
- iOS usage description strings cấu hình qua plugin trong `app.json`.

---

## Known Risks

- **API Contract Mismatch**: Frontend/backend API signatures may diverge
- **Database Migration**: Migration strategy not yet defined
- **Authentication Flow**: Implementation approach not yet decided
- **Cross-app State**: How user state syncs between apps unclear
- **Offline Support**: Unclear if mobile apps need offline-first design

---

## Open Technical Debt

- No test coverage documented
- No CI/CD pipeline configured
- No error handling strategy defined
- No logging strategy defined
- No environment configuration strategy
- No API versioning strategy
- No database backup strategy

---

## Recently Completed Tasks

- **T-0001**: Backend env config mở rộng (2026-06-23) - .env, env.validation.ts, docker-compose
- **T-0002**: Prisma schema mở rộng cho booking flow (2026-06-23) - 9 models, 9 enums, seed, migration
- **T-0003**: Redis connection và cache service (2026-06-23) - RedisModule, CacheService, health check
- **T-0004**: WebSocket gateway cơ bản (2026-06-24) - Socket.IO gateway with JWT auth, room helpers, 6 event emitters
- **T-0005**: API response format và error handling (2026-06-24) - Response interceptor, exception filter, request ID middleware, structured logging
- **T-0031**: Google Maps routing service backend (2026-06-24) - 5 API endpoints, Google Maps integration, Redis caching, retry logic
- **T-0032**: Onboarding & Welcome screens app_user (2026-06-25) - splash, welcome carousel, permissions, get-started (Expo Router)
- **T-0032.1**: Button layout & animation enhancement (2026-06-25) - carousel slide animations, synchronized button transitions
- **T-0032.2**: Permissions screen wire real OS permission requests (2026-06-26) - Location (foreground) + Notifications via expo-location/expo-notifications, non-blocking onboarding flow
- **T-0046**: Bộ theme Mai Linh semantic cho app_user (2026-06-26) - IAppColor semantic, palette Mai Linh, migrate mọi consumer sang token, khử hardcode đỏ
- **T-0033**: Login & Registration screens app_user (2026-06-26) - flow Phone + OTP (màn nhập SĐT + màn OTP resend countdown), authService/hooks OTP, mock DEV `000000`, AppTextInput forwardRef
- **T-0033.1**: PhoneInput component + libphonenumber-js validation (2026-06-29) - PhoneInput tái sử dụng (country picker 75% + search, digits-only, E.164 output), static CLDR country-name map (Hermes không có Intl.DisplayNames)
- **T-0034**: Home & map taxi search app_user (2026-06-29) - react-native-maps + PROVIDER_GOOGLE (cả iOS/Android), HomeScreen full-screen map + recenter + "Where to?" search UI + saved shortcuts, useCurrentLocation hook, app.config.ts inject Google Maps keys từ env
- **T-0050**: Backend Goong API service (2026-07-01) - `GoongService` adapter thay `GoogleMapsService` trong `RoutesModule`; normalize Goong responses về Google-shaped fields nên `RoutesService.transform*` + DTOs + endpoints `/routes/*` không đổi; mode `driving→car`/`walking→bike`, `transit` bị reject; retry+backoff giữ nguyên; cache prefix bump `goong:*`; env `GOONG_API_KEY`/`GOONG_BASE_URL`. Google Maps files còn lại (gỡ ở T-0056)
- **T-0053**: Goong Places Autocomplete integration app_user (2026-07-02) - SearchDestinationScreen với debounce 300ms, gọi backend `/routes/places/autocomplete` + `/routes/places/:placeId`, hiển thị predictions, fetch place detail khi chọn, lưu destination vào ZustandSession, HomeScreen đọc qua useFocusEffect
- **T-0062**: BE Booking + Payment + VNPay Module (2026-07-07) - BookingModule (POST /bookings, GET /bookings/:id), PaymentModule (POST /payments/vnpay, GET /payments/vnpay/callback, GET /payments/:bookingId), VNPay HMAC-SHA512, WS `booking.payment_success`, migration `add_vnpay_payment_method`
- **T-0063**: BE Dispatch Module — find nearest driver (2026-07-07) - DispatchModule với 3-round sweep (5/10/15km Haversine), DispatchOffer lifecycle, PATCH /drivers/location, WS `driver.new_offer` + `booking.driver_assigned` + `booking.no_driver_found`, EventEmitter `payment.success` → dispatch loop, Trip creation on accept, BookingStatus enum +3 values (LOOKING_DRIVER, DRIVER_ARRIVED, NO_DRIVER) - SearchDestinationScreen với debounce 300ms, gọi backend `/routes/places/autocomplete` + `/routes/places/:placeId`, hiển thị predictions, fetch place detail khi chọn, lưu destination vào ZustandSession, HomeScreen đọc qua useFocusEffect

---

## Suggested Next Tasks

1. **T-0001**: Setup project initialization & harness validation
2. **T-0002**: Design authentication & authorization flow
3. **T-0003**: Create User, Driver, Customer Prisma models
4. **T-0004**: Implement user registration API (backend)
5. **T-0005**: Implement user registration screen (app_taixe)
6. **T-0006**: Implement user registration screen (app_user)
7. **T-0007**: Implement login API (backend)
8. **T-0008**: Implement login screens (mobile apps)

---

## Assumptions

- Repository root is `/Users/chubo/Work/DatXe/` (named `hethong` logically)
- Project structure is as-is; no source code reorganization
- Each project manages its own dependencies
- No monorepo tooling (Nx, Turborepo) in use
- Tasks are sequential unless explicitly parallelized
- No existing CLAUDE.md or harness setup before this initialization

---

## Environment Variables & Secrets

### app_user
- `GOOGLE_MAPS_ANDROID_API_KEY` — Google Maps SDK key (Android), injected via `app.config.ts` (T-0034)
- `GOOGLE_MAPS_IOS_API_KEY` — Google Maps SDK key (iOS), injected via `app.config.ts` (T-0034)
- Stored in `.env` (gitignored); placeholders documented in `.env.example`. Build-time only (no
  `EXPO_PUBLIC_` prefix). For EAS builds, set both as EAS secrets/env.
- **Build model**: app_user now requires a **development build / `expo prebuild`** (react-native-maps
  native module, T-0034) — **Expo Go no longer works**.

### Backend / other
- `GOONG_API_KEY` — Goong API key for routing/places/geocoding (T-0050), used by `GoongService`. Config throws hard on missing key at boot.
- `GOONG_BASE_URL` — Goong API base URL, default `https://rsapi.goong.io`.
- `GOOGLE_MAPS_API_KEY` / `GOOGLE_MAPS_BASE_URL` — **legacy**, no longer wired into `RoutesModule` (Goong swapped in at T-0050). Removal deferred to T-0056.

---

## Performance Baseline

**[Not yet measured]**

To be established after core features working:
- API response times
- Mobile app startup time
- Database query performance
- Build times

---

## Animation Standards (Expo Apps)

### Framework: react-native-reanimated
**Status**: Mandatory for all animations across app_taixe and app_user

**Why Reanimated?**
- Native 60fps animations on RN thread (not JS thread)
- Worklet support for complex gesture-driven animations
- Better performance than React Native Animated API
- Integrates seamlessly with Expo

**Implementation Pattern**:
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Shared values (not refs)
const opacity = useSharedValue(1);

// Update animations with withTiming
opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });

// Create animated styles
const animStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

// Apply to Animated components
<Animated.View style={animStyle} />
```

**Key Differences from Animated API**:
- ✅ Use `useSharedValue()` instead of `useRef(new Animated.Value())`
- ✅ Use `useAnimatedStyle()` instead of manual transform/style interpolation
- ✅ Use `withTiming()` instead of `Animated.timing()`
- ✅ Assign directly: `value.value = withTiming(...)` instead of `.start()`
- ❌ No `.interpolate()` - use worklets for complex calculations

**Reference**: WelcomeCarouselScreen.tsx (T-0032 refactored to Reanimated)

**All new animations MUST use react-native-reanimated** - no exceptions.

---