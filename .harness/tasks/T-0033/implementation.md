# Implementation

**Task ID**: T-0033
**Phase**: Generating
**Created**: 2026-06-26
**Completed**: 2026-06-26

---

## Summary

Chuyển flow đăng nhập app_user từ mock email/password sang **Phone + OTP**. Refactor API service
layer sang `requestOtp`/`verifyOtp`, thêm mock DEV (`000000` auto-pass), dựng màn nhập SĐT và màn
nhập OTP (6 ô, resend countdown), dùng theme Mai Linh semantic.

---

## Changes Made

### Frontend - Customer App (app_user)

**API layer:**
- `src/api/services/authService.ts` — bỏ `login`/`register` (email/password), thêm `requestOtp` +
  `verifyOtp` khớp `ENDPOINTS.AUTH.REQUEST_OTP`/`VERIFY_OTP`. Thêm khối mock `__DEV__`: `000000`
  hợp lệ → trả mock token/user; mã khác → throw "Mã OTP không đúng". Types: `AuthUser`,
  `RequestOtp*`, `VerifyOtp*`.
- `src/api/hooks/useAuth.ts` — thay `useLogin`/`useRegister` bằng `useRequestOtp`/`useVerifyOtp`.
  `useVerifyOtp.onSuccess` lưu token + user vào ZustandPersist.
- `src/api/hooks/index.ts` — cập nhật export tên hook mới.
- `src/api/services/userService.ts` — `User` shape: `phone` required, `name`/`email` optional (khớp
  flow phone). Tránh mismatch với `setUser`.

**State:**
- `src/zustand/persist.ts` — `user` shape: `{ id, phone, name?, email? }`.

**Localization:**
- `iLocalization.ts` + `resources/en.ts` + `resources/vi.ts` — thêm 13 key cho 2 màn auth.

**Screens:**
- `app/SigninStack/SigninScreen.tsx` — màn nhập SĐT: prefix +84 tĩnh, validate regex VN
  (`/^0\d{9}$/`), gọi `useRequestOtp` → push OtpScreen kèm param `phone`.
- `app/SigninStack/OtpScreen.tsx` (mới) — 6 ô OTP (hidden input điều khiển), resend countdown 60s,
  hint DEV `000000`, verify → `router.replace('/(tabs)/HomeScreen')`.
- `app/SigninStack/_layout.tsx` — đăng ký route `OtpScreen`, gỡ `SignupScreen` khỏi navigation
  (file giữ nguyên, không xoá source).

**Component:**
- `src/components/input/TextInput.tsx` — `AppTextInput` chuyển `React.memo` → `forwardRef` để
  OtpScreen focus-on-tap (ref tới TextInput).

### Database (Prisma)

Không thay đổi.

---

## Code Quality Checks

- [x] ESLint: PASS (0 errors; 2 warnings ở `src/utils/clearCache.ts` — file dev ngoài scope)
- [x] TypeScript: PASS (`tsc --noEmit` 0 lỗi; lỗi `authService.LOGIN` pre-existing đã được khử)
- [ ] Tests: N/A (project chưa có test runner)
- [x] Build: type-check thay cho build (Expo managed)
- [x] No console.log left (chỉ console.error/warn, hợp lệ theo ESLint config)
- [x] No hard-coded secrets

---

## API Verification

### Endpoints (client contract, backend mock cho tới T-0006)

- `POST /auth/otp/request` — `{ phone }` → `{ success, expiresIn }` ✅ (DEV: mock)
- `POST /auth/otp/verify` — `{ phone, code }` → `{ accessToken, refreshToken, user }` ✅ (DEV: `000000`)

---

## Notes

- Mock `__DEV__` được comment rõ "DEV-ONLY", có đường thay bằng API thật khi backend sẵn sàng.
- `SignupScreen.tsx` còn tồn tại nhưng không được navigation/route tham chiếu. Giữ theo quy tắc
  "không xoá source". Màn nhập tên cho user mới để T-0038.
- typedRoutes (Expo Router) cần regenerate `.expo/types/router.d.ts` để nhận route `OtpScreen` mới.
