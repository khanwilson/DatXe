# Handoff

**Task ID**: T-0033
**Title**: Login & Registration screens app_user (Phone + OTP)
**Completed**: 2026-06-26
**Duration**: ~1 phiên (planning → generating → evaluating)

---

## Summary

Thay flow đăng nhập app_user từ mock email/password sang **Phone + OTP**. Refactor API service +
hooks sang `requestOtp`/`verifyOtp`, có mock DEV (`000000` auto-pass), dựng 2 màn (nhập SĐT, nhập
OTP với resend countdown), toàn bộ dùng theme Mai Linh semantic. Kiến trúc service tách biệt để
sau wire nhà mạng / Zalo mà không đụng UI.

---

## What Was Delivered

- Màn nhập số điện thoại (validate VN, prefix +84 tĩnh).
- Màn OTP (6 ô, hidden input điều khiển, resend countdown 60s, hint DEV).
- Service `authService.requestOtp/verifyOtp` + mock `__DEV__`.
- Hooks `useRequestOtp`/`useVerifyOtp`; lưu token + user vào ZustandPersist.
- i18n EN/VI cho luồng auth (13 key).
- `AppTextInput` hỗ trợ `forwardRef`.

---

## API Changes

### Client Service (mock cho tới khi backend T-0006 sẵn sàng)

```
POST /auth/otp/request
  Purpose: Gửi mã OTP tới số điện thoại
  Request: { phone: string }            // VN format 0xxxxxxxxx
  Response: { success: boolean, expiresIn: number }

POST /auth/otp/verify
  Purpose: Xác thực OTP, trả token + user
  Request: { phone: string, code: string }   // code 6 số
  Response: { accessToken, refreshToken, user: { id, phone, name? } }
  Errors: throw "Mã OTP không đúng" (DEV: code != 000000)
```

### Deprecated

```
authService.login / authService.register (mock email/password)
  Alternative: requestOtp + verifyOtp
  Đã gỡ; không còn consumer.
```

---

## Database Changes

Không có. (Backend OTP thuộc T-0006.)

---

## Lessons Learned

### What Went Well

- Refactor service đồng loạt khử luôn lỗi tsc pre-existing (`ENDPOINTS.AUTH.LOGIN`).
- Theme Mai Linh (T-0046) sẵn sàng → screens mới zero hardcode màu.
- Mock tách nhánh `__DEV__` rõ ràng, không rò mã cứng ra production path.

### What Was Challenging

- typedRoutes của Expo Router báo lỗi route `OtpScreen` chưa tồn tại → Solution: regenerate
  `.expo/types/router.d.ts` (Metro tự sinh khi chạy export/start).
- user shape mismatch (email required) → Solution: chuẩn hóa `phone` required, `name/email`
  optional ở persist + userService.

### What We'd Do Differently

- Có thể tách `phoneRegex`/`normalizePhone` ra util dùng chung nếu app_taixe cũng cần (T-0040).

---

## Next Steps

### Immediate Next Tasks

1. **T-0038** (Profile & settings) — màn nhập tên/avatar cho user mới sau verify OTP.
2. **T-0006** (Backend auth refresh token) — implement OTP endpoints thật để thay mock.
3. **T-0040** (Login app_taixe) — tái dùng pattern phone/OTP này cho app tài xế.

### Known Technical Debt

- Mock DEV `000000` cần gỡ/đổi feature-flag khi backend OTP live — Priority: Medium.
- `SignupScreen.tsx` còn file nhưng không dùng — quyết định xoá/repurpose ở task profile — Priority: Low.
- Chưa có rate-limit UI cho resend ngoài countdown (vd lỗi 429) — Priority: Low.

---

## Testing Coverage

- Unit/Integration: N/A (chưa có runner).
- Static: tsc 0 lỗi, lint 0 error, grep sạch stale refs.
- Manual runtime: cần chạy simulator trước demo (không có blocker).

---

## Security Review

- [x] No hard-coded secrets (token mock là chuỗi giả DEV, không phải secret thật)
- [x] Input validation (regex SĐT VN, OTP chỉ số, maxLength)
- [x] Authentication: token lưu qua ZustandPersist; interceptor đính Bearer (sẵn có)
- [ ] SQL injection: N/A (không đụng DB)
- [ ] CORS/CSRF: N/A (client)

---

## Deployment Notes

### Prerequisites

- Khi build production: đảm bảo backend `/auth/otp/*` đã live (T-0006), vì `__DEV__=false` sẽ
  gọi API thật.

### Rollback Plan

- Revert các file trong `files-changed.md`. Không có migration/DB nên rollback thuần code.

---

## File Changes Summary

- **Projects Modified**: app_user, harness
- **Total Files Changed**: 13 (1 file mới code: OtpScreen)
- See `files-changed.md` for details.

---

## Approvals

- **Task Owner**: nathan
- **Implemented By**: Claude (harness)
- **Approved**: 2026-06-26
