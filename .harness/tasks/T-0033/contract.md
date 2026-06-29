# Contract

**Task ID**: T-0033
**Phase**: Contracting
**Created**: 2026-06-26
**Approved**: [x] Yes / [ ] No

---

## Scope

### In Scope

- Xây flow đăng nhập/đăng ký bằng **Phone + OTP** cho app_user (thay cho mock email/password hiện tại).
- **Màn nhập số điện thoại** (`PhoneScreen`): input SĐT VN, validate định dạng, nút gửi OTP.
- **Màn nhập OTP** (`OtpScreen`): 6 ô nhập mã, resend OTP có countdown, verify.
- **Service/hooks layer**: `authService` + `useAuth` chuyển sang OTP flow (`requestOtp`, `verifyOtp`), viết kiến trúc cho phép sau wire nhà mạng/Zalo.
- **Mock dev**: mã `000000` auto-pass khi `__DEV__` (test case), có đường dẫn rõ ràng để thay bằng API thật.
- Refactor `SigninStack` (`_layout.tsx`, `SigninScreen` → `PhoneScreen`, `SignupScreen` → `OtpScreen` hoặc cấu trúc route mới) theo theme Mai Linh (T-0046).
- Lưu token + user vào `ZustandPersist` sau verify thành công; điều hướng vào `(tabs)/HomeScreen`.

### Out of Scope

- Backend thật cho OTP (thuộc T-0006); task này chỉ định nghĩa contract API + mock client.
- Tích hợp SDK nhà mạng / Zalo thực tế (ghi nhận hướng, chưa code).
- Màn hồ sơ sau đăng ký (tên, avatar) — thuộc T-0038 (Profile).
- Đổi schema Prisma / backend.
- app_taixe.

---

## Allowed Files

```
app_user/app/SigninStack/**
app_user/app/_layout.tsx              # nếu cần đổi route name SigninStack
app_user/src/api/services/authService.ts
app_user/src/api/hooks/useAuth.ts
app_user/src/api/axios/config.ts      # ENDPOINTS.AUTH đã có sẵn OTP, chỉ chỉnh nếu cần
app_user/src/zustand/persist.ts       # nếu cần lưu phone/thêm field user
app_user/src/components/**            # nếu cần component OTP input dùng lại
app_user/src/localization/**          # chuỗi i18n cho màn mới
app_user/src/assets/index.ts          # nếu thêm asset
.harness/tasks/T-0033/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

**Rationale**: Auth flow đụng UI (SigninStack), API client layer và state. Giới hạn trong app_user.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] Flow Phone → OTP → Home hoạt động đầy đủ
- [ ] Mã `000000` auto-pass khi `__DEV__`; production đi qua service thật
- [ ] Validate SĐT VN; OTP 6 số; resend có countdown
- [ ] Token + user lưu vào ZustandPersist sau verify
- [ ] UI theo theme Mai Linh (token semantic, không hardcode màu)
- [ ] `npx tsc --noEmit` 0 lỗi (bao gồm sửa lỗi `authService` LOGIN pre-existing)
- [ ] `bun lint` sạch
- [ ] Không hardcode secrets
- [ ] Tất cả thay đổi trong Allowed Files

---

## API Contract Changes

Định nghĩa contract (client-side, mock cho tới khi T-0006 implement backend):

### Endpoints (đã có sẵn trong `config.ts`)

```
POST /auth/otp/request
  Request: { phone: string }
  Response: { success: boolean; expiresIn: number }
  Status: 200 OK | 400 Bad Request | 429 Too Many Requests

POST /auth/otp/verify
  Request: { phone: string; code: string }
  Response: { accessToken: string; refreshToken: string; user: { id, phone, name } }
  Status: 200 OK | 400 Invalid Code | 401 Expired
```

### Modified (client service)

```
authService.login(email,password)  → DEPRECATED, thay bằng:
authService.requestOtp({ phone })
authService.verifyOtp({ phone, code })
  Breaking: Yes (mock auth cũ chưa dùng production nên chấp nhận)
```

---

## Database Impact

Không đổi Prisma schema. (Backend OTP thuộc T-0006.)

---

## Test Strategy

- **Type check**: `npx tsc --noEmit` — cổng chính.
- **Lint**: `bun lint`.
- **Manual**:
  - Nhập SĐT hợp lệ/không hợp lệ → validate.
  - Gửi OTP → sang màn OTP.
  - Nhập `000000` (dev) → vào Home.
  - Resend countdown chạy đúng.
  - Back từ OTP về Phone giữ state.
- **Edge**: SĐT rỗng, sai định dạng, OTP chưa đủ 6 số, resend khi countdown chưa hết.

---

## Design Decisions (chốt với user)

1. **Phương thức**: Phone + OTP (bỏ mock email/password).
2. **Mock dev**: `000000` auto-pass khi `__DEV__`; kiến trúc service tách biệt để sau wire nhà mạng/Zalo.
3. **Backend**: chưa sẵn sàng (T-0006) → mock client, giữ đúng contract endpoint đã định nghĩa trong `config.ts`.

---

## Sign-off

- **Planner**: Claude (harness)
- **Approved**: [x] Yes / [ ] No
- **Approved At**: 2026-06-26
