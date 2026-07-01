# Project State

**Last Updated**: 2026-07-01  
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
- **Authentication**: [To be documented when implemented]
- **Deployment**: [To be documented when implemented]

---

## Completed Capabilities

- [x] User registration (driver & customer) - T-0002 schema ready
- [x] User authentication - T-0001 + T-0002 JWT with role
- [x] Customer login/registration UI (phone + OTP) - T-0033 (app_user, mock DEV)
- [x] Customer home + map screen (current location, search UI) - T-0034 (app_user)
- [x] WebSocket gateway (Socket.IO with JWT auth) - T-0004
- [ ] Driver profile management
- [ ] Customer profile management
- [ ] Ride booking flow
- [ ] Ride tracking
- [ ] Payment system
- [ ] Rating & review system

---

## Active API Contracts

### Authentication API
- **Endpoint**: `POST /auth/otp/request` | `POST /auth/otp/verify` (phone + OTP)
- **Status**: Client contract defined (T-0033); backend mock cho tới T-0006
- **Last Updated**: 2026-06-26
- **Projects**: app_user (app_taixe sẽ tái dùng ở T-0040), nestjs_prisma
- **Flow**: nhập SĐT (VN `0xxxxxxxxx`) → `requestOtp` → nhập OTP 6 số → `verifyOtp` → token + user
- **DEV mock**: `__DEV__` + code `000000` auto-pass (gỡ khi backend live)

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
- **BookingStatus**: PENDING, CONFIRMED, ACCEPTED, DRIVER_ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED, PAYMENT_PENDING, PAYMENT_COMPLETED, NO_SHOW
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