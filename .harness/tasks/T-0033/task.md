# T-0033: Login & Registration Screens - app_user

**Title**: Login & Registration (Phone + OTP) for Customer App
**Created**: 2026-06-26
**Priority**: P0
**Projects**: app_user

---

## Requirement

Dựng cấu trúc đăng nhập / đăng ký cho app khách hàng (app_user) theo flow **Số điện thoại + OTP**:
nhập SĐT → nhận & nhập mã OTP (6 số) → vào app. Viết qua service/hooks layer để sau dễ liên
kết nhà mạng (SMS gateway) hoặc bên thứ ba (Zalo OTP).

## Context

- Flow auth chuẩn cho app gọi xe tại VN là phone + OTP (không mật khẩu).
- `ENDPOINTS.AUTH` đã định hình theo hướng phone/OTP (`/auth/phone`, `/auth/otp/request`,
  `/auth/otp/verify`) nhưng UI hiện tại (`SigninScreen`/`SignupScreen`) lại là mock email/password
  → mismatch cần dọn.
- Backend auth thật (T-0006) chưa Done → task này mock, không phụ thuộc backend.
- Theme Mai Linh semantic đã có (T-0046) → các màn mới phải dùng token, không hardcode.

## Mock / Dev behavior

- Khi `__DEV__`: nhập mã OTP `000000` là **auto-pass** (bỏ qua call backend), set mock token + user
  để vào thẳng app phục vụ demo & test.
- Mã khác trong `__DEV__`: vẫn đi qua mock service (giả lập), trả lỗi để test luồng sai mã.
- Production: gọi `authService.requestOtp` / `verifyOtp` thật (đã có cấu trúc, chờ backend wire).

## Assumptions

- Số điện thoại VN, mặc định mã vùng +84 (hiển thị tĩnh, chưa làm màn chọn quốc gia).
- OTP 6 chữ số.
- Không làm forgot-password (đăng nhập bằng OTP nên không cần).
- Giữ nguyên cấu trúc expo-router + `SigninStack`.

## Out of Scope

- Backend OTP thật / tích hợp nhà mạng / Zalo (chỉ chừa cấu trúc).
- Màn chọn quốc gia / mã vùng động.
- Nhập hồ sơ chi tiết sau đăng ký (tên, ảnh…) — để task profile (T-0038).
- Social login (Google/Apple/Zalo SDK).
- app_taixe, backend.

## Success Criteria

- [ ] Màn nhập SĐT (validate định dạng VN, format mã vùng +84).
- [ ] Màn nhập OTP (6 ô / 1 input, resend có countdown).
- [ ] Mock `000000` auto-pass trong `__DEV__`; vào được app.
- [ ] Service + hooks layer cho requestOtp/verifyOtp, sẵn sàng wire backend.
- [ ] Dùng theme Mai Linh semantic, không hardcode màu.
- [ ] `tsc --noEmit` sạch cho file trong scope; `bun lint` sạch.
- [ ] Không crash khi đi hết flow.

---

**Created**: 2026-06-26
**Phase**: Created
**Status**: Planned
