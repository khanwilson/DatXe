# Decisions Log

**Last Updated**: 2026-07-01 (T-0051)  
**Format**: Per-decision tracking with status and impact

---

## Active Decisions

### D-0001: Task-Based Harness Framework

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | Harness Setup (2026-06-22) |
| **Context** | Need structured task management for multi-project coordination |
| **Decision** | Implement task-based workflow with phases: Created → Planning → Contracting → Generating → Evaluating → Fixing → Closing → Done |
| **Impacted Projects** | All (harness) |
| **Consequences** | <ul><li>All tasks must follow structured workflow</li><li>No code before plan & contract</li><li>API contracts must be documented</li><li>Prisma schema changes must be tracked</li></ul> |

### D-0002: Prisma Schema Conventions

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0002 (2026-06-23) |
| **Context** | Need consistent conventions for database schema design |
| **Decision** | PascalCase models, camelCase fields, uuid() @id, snake_case tables via @@map, Decimal for prices, cascade delete for dependent relations |
| **Impacted Projects** | nestjs_prisma |
| **Consequences** | <ul><li>All future models follow these conventions</li><li>Price fields use Decimal @db.Decimal(10, 2)</li><li>Foreign keys use cascade delete for 1:1 dependent relations (User→Customer, User→Driver)</li><li>Optional relations use nullable foreign keys</li><li>Indexes on frequent query columns</li></ul> |

### D-0003: User Model Design

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0002 (2026-06-23) |
| **Context** | Need to support different user types (customer, driver, admin) in single User model |
| **Decision** | Single User model with role enum (CUSTOMER, DRIVER, ADMIN), separate Customer/Driver models linked 1:1 |
| **Impacted Projects** | nestjs_prisma, app_taixe, app_user |
| **Consequences** | <ul><li>User.role determines user type</li><li>Customer/Driver models extend User with type-specific fields</li><li>Auth JWT payload includes role for authorization guards</li><li>Register endpoint defaults role=CUSTOMER (backward compatible)</li></ul> |

### D-0005: Mobile Auth — Phone + OTP

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0033 (2026-06-26) |
| **Context** | App gọi xe tại VN; cần auth thân thiện, không mật khẩu. UI cũ mock email/password vênh với `ENDPOINTS.AUTH` (đã định hình phone/OTP). |
| **Decision** | Đăng nhập/đăng ký bằng **số điện thoại + OTP 6 số**. Flow: `requestOtp({phone})` → `verifyOtp({phone, code})` → token + user. Bỏ email/password. Mã vùng +84, SĐT VN `0xxxxxxxxx`. |
| **Impacted Projects** | app_user, app_taixe (T-0040 tái dùng), nestjs_prisma (T-0006 implement endpoints) |
| **Consequences** | <ul><li>`authService` dùng requestOtp/verifyOtp; hooks `useRequestOtp`/`useVerifyOtp`</li><li>`user` shape: phone required, name/email optional</li><li>Mock `__DEV__` code `000000` auto-pass — gỡ khi backend live</li><li>Kiến trúc service tách biệt để sau wire nhà mạng (SMS) hoặc Zalo OTP</li><li>Backend T-0006 phải cung cấp `/auth/otp/request` + `/auth/otp/verify`</li></ul> |

### D-0006: Mobile Maps — react-native-maps + PROVIDER_GOOGLE

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0034 (2026-06-29) |
| **Context** | App gọi xe cần Google Maps thật (Maps/Places/Routes nhất quán) trên cả 2 nền tảng. `expo-maps` chỉ hỗ trợ Google trên Android (iOS rơi về Apple Maps) → không hợp yêu cầu. |
| **Decision** | Dùng **react-native-maps** với `PROVIDER_GOOGLE` trên **cả iOS và Android**. API key (Android + iOS) inject qua **env** trong `app.config.ts` (`ios.config.googleMapsApiKey`, `android.config.googleMaps.apiKey`). |
| **Impacted Projects** | app_user (app_taixe sẽ tái dùng pattern ở các task map của tài xế) |
| **Consequences** | <ul><li>**Rời Expo Go** — bắt buộc development build / `expo prebuild` (native module đầu tiên của project)</li><li>`react-native-maps@1.20.1` KHÔNG có config plugin → không thêm vào `plugins`; prebuild đọc key trực tiếp từ config</li><li>Keys build-time, không prefix `EXPO_PUBLIC_`, không commit (chỉ `.env.example` placeholder)</li><li>EAS build cần set 2 key làm secrets/env</li><li>Components `AppMap`/`SearchPanel`/`useCurrentLocation` tái dùng cho booking/trip + app_taixe</li><li>Place search (Places autocomplete/geocode qua backend `/routes/*`) để T-0035</li></ul> |

---

### D-0007: Backend Routing Provider — Goong API (replaces Google Maps)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0050 (2026-07-01) |
| **Context** | App gọi xe tại VN cần routing/places/geocoding chính xác cho địa chỉ Việt Nam và chi phí hợp lý. Goong là nhà cung cấp bản đồ nội địa VN (tiles + routing + places), thay cho Google Maps. Backend T-0031 đã dựng `GoogleMapsService`; nay swap provider mà không đổi API contract. |
| **Decision** | Backend `/routes/*` dùng **`GoongService`** (base `https://rsapi.goong.io`) thay `GoogleMapsService`. `GoongService` là **adapter**: gọi Goong rồi normalize response về đúng shape Google-compatible mà `RoutesService.transform*()` đang đọc → `RoutesController` + tất cả DTO **không đổi**. Env: `GOONG_API_KEY` + `GOONG_BASE_URL`. |
| **Impacted Projects** | nestjs_prisma (T-0050); app_user (T-0053 Places autocomplete, T-0054 route display); T-0056 (cleanup Google Maps) |
| **Consequences** | <ul><li>Mode mapping: `driving→car`, `walking→bike`; **`transit` bị reject** (Goong không hỗ trợ) → `BadRequestException`</li><li>Cache key prefix đổi sang `goong:*` để không phục vụ entry Google-shaped cũ</li><li>Google Maps files (config/service) **còn nằm nguyên** — xóa ở T-0056</li><li>Frontend map stack (Mapbox tiles + Goong routing/places) — xem [[map-stack-mapbox-goong]]</li><li>Bổ sung D-0006: backend routing provider chuyển từ Google sang Goong; `PROVIDER_GOOGLE` phía mobile map SDK là vấn đề tách biệt (đang được thay bằng Mapbox ở T-0051+)</li></ul> |

---

### D-0008: Mobile Map SDK — @rnmapbox/maps (replaces react-native-maps + PROVIDER_GOOGLE)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0051 (2026-07-01) |
| **Context** | Sau khi backend chuyển routing/places sang Goong (D-0007), map tiles phía mobile cũng chuyển sang Mapbox để đồng bộ map stack (Mapbox tiles + Goong routing/places). Thay `react-native-maps`+`PROVIDER_GOOGLE` (D-0006) bằng `@rnmapbox/maps`. T-0051 chỉ setup SDK; migrate `AppMap` là T-0052. |
| **Decision** | Mobile dùng **`@rnmapbox/maps@10.3.1`** (Mapbox GL Native). Two-token model: **`MAPBOX_DOWNLOAD_TOKEN`** (`sk.`, build-time, inject vào config plugin `RNMapboxMapsDownloadToken` qua `app.config.ts`, **KHÔNG** `EXPO_PUBLIC_`) + **`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`** (`pk.`, runtime, gọi `Mapbox.setAccessToken()` ở app entry). Camera model (`centerCoordinate: [lng, lat]`, `zoomLevel`) thay `Region` (lat/lng + delta). |
| **Impacted Projects** | app_user (T-0051 setup, T-0052 migrate AppMap, T-0053/T-0054 search/route); app_taixe (T-0055 tái dùng pattern); T-0056 (gỡ react-native-maps) |
| **Consequences** | <ul><li>Supersede D-0006 (mobile tile provider): react-native-maps + PROVIDER_GOOGLE → Mapbox. `react-native-maps` **còn cài song song** cho tới T-0056</li><li>Coordinate order đảo sang GeoJSON `[lng, lat]` — đồng nhất với Goong (xem [[map-stack-mapbox-goong]])</li><li>`app.config.ts` giờ inject cả Google Maps key (cũ) lẫn Mapbox download token — Google key gỡ ở T-0056</li><li>`@rnmapbox/maps@10.3.1` tương thích Expo 54 / RN 0.81 / New Arch (peer `react-native >=0.79`, `expo >=47`)</li><li>Vẫn cần dev build / `expo prebuild` (đã có từ D-0006)</li><li>`src/constants/map.ts` (Region-based) giữ nguyên tới T-0052; types Mapbox mới nằm ở `src/constants/mapbox.ts`</li></ul> |

---

### P-D-0001: Authentication Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | T-0006 (Auth API refresh token) |
| **Options** | <ul><li>JWT with refresh tokens</li><li>Session-based with cookies</li><li>OAuth 2.0 integration</li><li>Firebase Auth</li></ul> |
| **Impact Scope** | NestJS backend, both mobile apps, database schema |
| **Notes** | T-0001 set up JWT access/refresh tokens. T-0002 added role to JWT payload. T-0033 chốt phương thức **phone + OTP** cho mobile (xem D-0005). T-0006 sẽ implement full refresh token flow + OTP endpoints thật. |

### P-D-0002: Database Strategy

| Field | Value |
|-------|-------|
| **Status** | Resolved |
| **Resolved By** | T-0001 + T-0002 |
| **Decision** | PostgreSQL with PostGIS + Prisma ORM |
| **Details** | <ul><li>PostgreSQL 16 with PostGIS extension for geo queries</li><li>Prisma ORM for migrations, queries, and type safety</li><li>Database conventions documented in PROJECT_STATE.md</li><li>Redis installed (T-0003) for caching, Geo, streams</li></ul> |

### D-0004: Package Manager — bun

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0003 (2026-06-23) |
| **Context** | Project dùng bun (có bun.lock) nhưng lệnh install ban đầu chạy bằng npm, gây conflict |
| **Decision** | Dùng bun cho tất cả operations (install, run build, run lint, etc.) |
| **Impacted Projects** | nestjs_prisma |
| **Consequences** | <ul><li>`bun add <package>` thay vì `npm install`</li><li>`bun run build` thay vì `npm run build`</li><li>`bun run lint` thay vì `npm run lint`</li><li>Không dùng npm trong project directory</li></ul> |

### P-D-0003: API Versioning

| Field | Value |
|-------|-------|
| **Status** | Resolved |
| **Resolved By** | T-0001 |
| **Decision** | URL versioning with `/api/v1/` prefix |
| **Details** | <ul><li>API_PREFIX = `/api/v1` configurable via env</li><li>All future endpoints use this prefix</li><li>Version bump when breaking changes needed</li></ul> |

### P-D-0004: State Management (Mobile Apps)

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | First feature requiring complex state |
| **Options** | <ul><li>Redux/Redux Toolkit</li><li>Zustand</li><li>MobX</li><li>React Context</li><li>Jotai</li></ul> |
| **Impact Scope** | app_taixe, app_user architecture |
| **Notes** | Affects code structure, testing strategy, developer experience |

### P-D-0005: Testing Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When test coverage requirements become clear |
| **Options** | <ul><li>Unit + integration (Jest)</li><li>E2E testing (Cypress, Detox)</li><li>API contract testing</li><li>Visual regression testing</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects CI/CD, release confidence, development velocity |

### P-D-0006: Deployment & Environment Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | Pre-production setup |
| **Options** | <ul><li>AWS/GCP/Azure</li><li>Heroku</li><li>Docker + Kubernetes</li><li>Vercel/Railway</li><li>Managed services (Firebase, Supabase)</li></ul> |
| **Impact Scope** | Backend deployment, CI/CD pipeline, infrastructure |
| **Notes** | Affects cost, scalability, team DevOps knowledge |

### P-D-0007: Monitoring & Logging

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When production issues appear |
| **Options** | <ul><li>Sentry for error tracking</li><li>DataDog/New Relic for APM</li><li>ELK Stack for logs</li><li>Cloudwatch/Stackdriver</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects debugging, incident response, performance insights |

---

## Superseded Decisions

*(None yet)*

---

## Decision Making Process

1. **Identify**: Recognize when a decision is needed (triggered by task, risk, or recurring question)
2. **Document**: Add to Pending Decisions with Status = Pending
3. **Discuss**: Evaluate options and consequences (may span multiple tasks)
4. **Decide**: Once decided, move to Active Decisions with Status = Accepted
5. **Communicate**: Update `PROJECT_STATE.md` and affected task handoffs
6. **Implement**: Apply decision in new tasks
7. **Review**: Periodically review if decision still holds (quarterly?)

---

## Linking Decisions to Tasks

When a task involves a decision:

- If decision **already exists** in this file: reference it by ID in task `decisions.md`
- If decision is **new to this task**: create it here with `Source Task` set to current task
- If decision **only affects current task**: keep in `tasks/T-XXXX/decisions.md` (don't promote)
- If decision **affects future tasks**: promote to this file

