# Plan

**Task ID**: T-0033
**Phase**: Planning
**Created**: 2026-06-26

---

## Analysis

### Scope Clarification

- Affected Projects: `app_user`
- Affected Files (3 nhóm):
  1. **API layer**: `src/api/axios/config.ts` (đã có endpoints), `src/api/services/authService.ts`
     (đổi từ login/register email-password → requestOtp/verifyOtp), `src/api/hooks/useAuth.ts`
     (hooks mới `useRequestOtp`/`useVerifyOtp`), `src/zustand/persist.ts` (user shape: thêm `phone`).
  2. **Screens**: `app/SigninStack/SigninScreen.tsx` → màn nhập SĐT; `app/SigninStack/OtpScreen.tsx`
     (mới) → nhập OTP; `app/SigninStack/_layout.tsx` (đăng ký route mới). Xử lý `SignupScreen.tsx`
     (phone+OTP gộp đăng nhập/đăng ký nên signup riêng có thể bỏ hoặc chuyển thành màn nhập tên — xem Step 5).
  3. **Components (nếu cần)**: ô nhập OTP (có thể tái dùng `AppTextInput`).
- Estimated Complexity: **Medium** (UI mới + refactor API service, không đụng backend).

### Dependencies

- Previous Tasks: T-0032 (onboarding điều hướng tới đây), T-0046 (theme semantic — bắt buộc dùng token).
- External Dependencies: không thêm package (dùng RN core + reanimated sẵn có).
- Blocked By: none (mock, không chờ T-0006 backend).

### Risks

- **R1 — authService đang gọi `ENDPOINTS.AUTH.LOGIN` (không tồn tại)**: đây là lỗi tsc pre-existing.
  → Task này refactor service sang `requestOtp`/`verifyOtp` khớp `ENDPOINTS`, xoá luôn lỗi.
- **R2 — useAuth hooks & màn cũ phụ thuộc `authService.login/register`**: đổi signature sẽ vỡ consumer.
  → Refactor đồng loạt hooks + screens trong cùng task; `tsc` làm cổng.
- **R3 — user shape persist có `email` (required)**: flow phone không có email.
  → Đổi `email` thành optional, thêm `phone`. Kiểm tra mọi nơi đọc `user.email`.
- **R4 — Mock auto-pass lẫn vào production**: phải guard chặt bằng `__DEV__`, comment rõ.
  → Tách nhánh `__DEV__` trong service, không để rò mã cứng ra production path.
- **R5 — SignupScreen trở nên thừa**: flow OTP gộp login/register.
  → Quyết trong Step 5: giữ file nhưng repurpose hoặc gỡ khỏi navigation (không xoá source nếu chưa cần).

---

## Implementation Approach

### Step 1: API service layer (phone + OTP)
Refactor `authService.ts`:
- `requestOtp({ phone })` → `POST /auth/otp/request`
- `verifyOtp({ phone, code })` → `POST /auth/otp/verify`, trả `{ accessToken, refreshToken, user }`
- Giữ `logout`, `refreshToken`.
- Bỏ `login`/`register` email-password (hoặc giữ tạm nếu có consumer ngoài scope — kiểm tra trước).
- Types: `RequestOtpRequest`, `VerifyOtpRequest`, `AuthResponse` (user: `{ id, phone, name? }`).

### Step 2: Mock dev layer
Trong service, nhánh `if (__DEV__)`:
- `requestOtp`: resolve giả (no-op) để UI sang màn OTP.
- `verifyOtp`: nếu `code === '000000'` → trả mock `{ accessToken, refreshToken, user }`;
  ngược lại reject với lỗi "Mã OTP không đúng" để test luồng sai.
Comment rõ "DEV ONLY — remove/replace when backend ready".

### Step 3: Hooks
`useAuth.ts`: thay `useLogin`/`useRegister` bằng `useRequestOtp`, `useVerifyOtp`.
`useVerifyOtp.onSuccess` → `setTokens` + `setUser` (như cũ). Cập nhật consumer.

### Step 4: Zustand persist
`user` shape: `{ id: string; phone: string; name?: string; email?: string }`.
Cập nhật `partialize` không đổi (vẫn persist `user`). Kiểm tra `setUser` callers.

### Step 5: Screens
- **SigninScreen** → màn nhập SĐT: input phone (prefix +84, validate), nút "Tiếp tục" → gọi
  `useRequestOtp` → router.push OTP screen kèm param `phone`.
- **OtpScreen (mới)**: hiển thị SĐT, ô nhập 6 số, nút "Xác nhận" → `useVerifyOtp` → vào `(tabs)`.
  Resend OTP với countdown 60s. Hint dev: "(DEV) dùng 000000".
- **_layout.tsx**: thêm `<Stack.Screen name='OtpScreen' />`.
- **SignupScreen**: flow OTP không tách signup → gỡ khỏi `_layout` navigation (giữ file source,
  không xoá; ghi rõ trong handoff). Nếu sau cần nhập tên cho user mới sẽ làm ở T-0038.
- Tất cả dùng theme token Mai Linh, AppText/AppTextInput/AppButton, StyleSheet pattern dự án.

### Step 6: Verify
`npx tsc --noEmit` (file trong scope 0 lỗi, xác nhận lỗi authService cũ biến mất), `bun lint`.
Grep hardcode màu. Manual: đi flow SĐT → OTP 000000 → vào app; thử mã sai; thử resend.

---

## Testing Strategy

- Unit tests: project không có runner → skip, log rõ.
- Type safety: `tsc --noEmit` là cổng chính.
- Manual:
  - Nhập SĐT hợp lệ/không hợp lệ → validate.
  - OTP `000000` (DEV) → vào app.
  - OTP sai → báo lỗi, không vào.
  - Resend countdown chạy đúng.
- Edge: SĐT rỗng, OTP thiếu số, double-tap nút, back từ OTP về nhập lại SĐT.

---

## Estimated Effort

- Planning/Contracting: 40 min
- Implementation: 2–2.5 giờ
- Verify + manual: 30 min
- Total: ~3.5 giờ

---

## Acceptance Criteria

- [ ] Service + hooks phone/OTP, lỗi `authService.LOGIN` cũ biến mất khỏi tsc
- [ ] Màn nhập SĐT + màn OTP hoàn chỉnh, điều hướng đúng
- [ ] Mock `000000` auto-pass trong `__DEV__`, vào được app
- [ ] Dùng theme Mai Linh, không hardcode màu
- [ ] `tsc --noEmit` sạch (scope), `bun lint` sạch
- [ ] Không breaking consumer ngoài ý muốn; không crash khi chạy flow
