# Decisions Log

**Last Updated**: 2026-07-09
**Scope**: Chỉ lưu decision đã **Accepted**. Pending/Rejected KHÔNG lưu ở đây.

**Format mỗi decision** — 3 field, ngắn gọn:
- **Context** — 1-2 câu vì sao cần quyết định
- **Decision** — chốt gì, không giải thích dài
- **Impacted Projects** — project nào bị ảnh hưởng

Không viết Consequences, Notes, Status. Nếu cần chi tiết implementation → đọc task `handoff.md`.

---

### D-0001: Task-Based Harness Framework (2026-06-22)
- **Context**: Cần workflow chuẩn cho multi-project.
- **Decision**: Task đi qua phases Created → Planning → Contracting → Implementing → Evaluating → (Fixing/Architecting) → Reviewing → Closing → Done. Không code trước plan + contract.
- **Impacted Projects**: All

### D-0002: Prisma Schema Conventions (T-0002, 2026-06-23)
- **Context**: Cần convention thống nhất cho schema.
- **Decision**: PascalCase model, camelCase field, `uuid() @id`, snake_case table via `@@map`, `Decimal @db.Decimal(10,2)` cho tiền, cascade delete cho 1:1 dependent, index trên cột query nhiều.
- **Impacted Projects**: nestjs_prisma

### D-0003: User Model Design (T-0002, 2026-06-23)
- **Context**: Cần hỗ trợ nhiều loại user trong một model.
- **Decision**: Single `User` với enum `role` (CUSTOMER, DRIVER, ADMIN). `Customer`/`Driver` là bảng 1:1 mở rộng. JWT payload chứa role.
- **Impacted Projects**: nestjs_prisma, app_user, app_taixe

### D-0004: Package Manager — bun (T-0003, 2026-06-23)
- **Context**: Project có `bun.lock`, chạy npm gây conflict.
- **Decision**: Dùng `bun` cho mọi thao tác (install/build/lint) trong `nestjs_prisma`. Không dùng npm.
- **Impacted Projects**: nestjs_prisma

### D-0005: Mobile Auth — Phone + OTP (T-0033, 2026-06-26)
- **Context**: App gọi xe VN cần auth thân thiện, không mật khẩu.
- **Decision**: Đăng nhập/đăng ký bằng **SĐT + OTP 6 số**. Flow `requestOtp → verifyOtp → token`. Bỏ email/password. Mã vùng +84. DEV mock code `000000`.
- **Impacted Projects**: app_user, app_taixe, nestjs_prisma

### D-0007: Backend Routing Provider — Goong API (T-0050, 2026-07-01)
- **Context**: Cần routing/places/geocode chính xác cho địa chỉ VN.
- **Decision**: Backend `/routes/*` dùng `GoongService` (base `https://rsapi.goong.io`) làm adapter, normalize response về Google-shaped nên `RoutesController` + DTO không đổi. Mode `driving→car`, `walking→bike`, `transit` reject. Env `GOONG_API_KEY` + `GOONG_BASE_URL`.
- **Impacted Projects**: nestjs_prisma

### D-0008: Mobile Map SDK — @rnmapbox/maps (T-0051, 2026-07-01, supersedes D-0006)
- **Context**: Đồng bộ map stack Mapbox tiles + Goong routing/places sau D-0007.
- **Decision**: Mobile dùng `@rnmapbox/maps@10.3.1`. Two-token: `MAPBOX_DOWNLOAD_TOKEN` (`sk.`, build-time, inject vào config plugin) + `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (`pk.`, runtime, `Mapbox.setAccessToken()` ở app entry). Camera model `[lng, lat] + zoomLevel` (GeoJSON order). Vẫn cần dev build / `expo prebuild`.
- **Impacted Projects**: app_user, app_taixe

### D-0009: nestjs_prisma — Import Enum từ @prisma/client (2026-07-09)
- **Context**: Hardcode string cho enum gây runtime lỗi khi rename + mất type safety.
- **Decision**: Mọi code trong `nestjs_prisma` phải `import { UserRole, BookingStatus, ... } from '@prisma/client'` và dùng `UserRole.ADMIN` thay `'ADMIN'`. Áp dụng cho seed, service, controller, guard, test.
- **Impacted Projects**: nestjs_prisma

### D-0010: Mobile Animations — react-native-reanimated (2026-07-09)
- **Context**: Cần 60fps mượt; React Native `Animated` chạy trên JS thread → drop frame.
- **Decision**: Mọi animation trong `app_user` và `app_taixe` phải dùng `react-native-reanimated` (worklet, native thread) — `useSharedValue` + `useAnimatedStyle` + `withTiming/withSpring`. Không dùng RN `Animated` cho code mới.
- **Impacted Projects**: app_user, app_taixe

### D-0011: Mobile Permissions — Just-In-Time (T-0032.2, 2026-06-26)
- **Context**: Gom permission vào onboarding → user deny nhiều, hạ activation.
- **Decision**: Xin quyền theo ngữ cảnh. Onboarding chỉ xin Location foreground + Notifications, non-blocking (allow/deny đều đi tiếp). Contacts/Camera/Photo Library xin tại màn dùng thật. Location background chỉ cho `app_taixe`.
- **Impacted Projects**: app_user, app_taixe

### D-0012: VNPay Payment Flow — FE aligns to BE, state machine gated (T-0075, 2026-07-09)
- **Context**: VNPay signing must be deterministic (signed string == URL query); app state must transition only on confirmed payment, not browser close.
- **Decision**: (1) FE DTO aligns to BE `CreateVnpayUrlParams { booking_id, amount, order_info, client_ip }` — FE shapes data to match BE, never vice versa. (2) `app_user` gates `LOOKING` transition on confirmed payment via WS `booking.payment_success` OR `GET /payments/:bookingId` poll returning `SUCCESSFUL`. (3) Backend signing uses single RFC3986 encoder (`encodeURIComponent`), `%20` for spaces, sorted keys — ensures signed bytes are byte-identical to URL query for VNPay callback re-verification.
- **Impacted Projects**: app_user, nestjs_prisma

---

## Superseded

- **D-0006** (react-native-maps + PROVIDER_GOOGLE, T-0034) — thay bằng D-0008.
